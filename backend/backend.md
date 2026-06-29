# backend.md — Technology Stack & Rationale (Master Reference)

This is the single source of truth for every technology choice in this project. For each item: what it is, why it was chosen over the alternatives, and where exactly it's used.

---

## 1. Language & Runtime

**Choice: Node.js (TypeScript) + Express**

- TypeScript gives compile-time safety on the two places this project is most failure-prone: the rate engine's input shape and the status-transition whitelist. A typo'd field name in a pricing calculation is exactly the kind of bug that's invisible until production.
- Express over NestJS: NestJS's DI/module ceremony buys structure this project's size (single service, ~6 domains) doesn't need yet. Express + a disciplined folder structure (see §8) gets the same separation of concerns with far less boilerplate, which matters when the deliverable is graded on code clarity.
- Considered Fastify: marginally faster, but smaller ecosystem for the queue/cache libraries below; not worth the tradeoff here.

## 2. Database

**Choice: PostgreSQL**

- This system is **relationally strict by nature**: zones → areas → rate cards → orders → tracking history are foreign-keyed, and the most important invariant ("never update tracking history, only insert") and the most important concurrency guard ("don't over-assign an agent") are both things Postgres enforces well — `SELECT ... FOR UPDATE`, row-level locking, and `CHECK` constraints.
- Rejected MongoDB: the domain is not document-shaped. Rate cards, zones, and orders are reference data with strict referential integrity needs (a rate card must point to real zones; an order must point to a real rate snapshot). Modeling that in Mongo means re-implementing what a relational DB gives for free, and atomic "increment agent's order count" is more natural as a SQL transaction than a Mongo `findOneAndUpdate` race.
- **PostGIS extension** is used for agent geolocation (`current_lat`, `current_lng` as a `geography` column) so "nearest available agent" is a real spatial query (`ORDER BY location <-> point LIMIT N`) rather than a manual haversine calculation in application code.

**ORM: Prisma**

- Strong TypeScript type generation from schema, first-class migration tooling, and `$transaction` support for the multi-step writes this project needs (order creation + history row in one transaction, agent assignment + capacity increment in one transaction).
- Raw SQL is dropped in via `prisma.$queryRaw` only for the PostGIS nearest-neighbor query, since Prisma doesn't model geography types natively.

## 3. Caching

**Choice: Redis**

- Zone, area, and rate-card lookups are read on every single order calculation but written only when an admin edits config — a textbook cache-aside candidate.
- Pattern: read-through cache keyed by `rate:{fromZone}:{toZone}:{orderType}`, `zone:area:{pincode}`. Any admin `PUT`/`POST`/`DELETE` on zones/areas/rate-cards invalidates the relevant keys synchronously in the same request, before responding.
- Also backs the BullMQ queue (below) — Redis is already a hard dependency, so it does double duty rather than introducing a second piece of infrastructure.

## 4. Background Jobs / Queue

**Choice: BullMQ**

- Two things must never run in the request/response path: **sending email/SMS**, and **the multi-step failed-delivery saga** (notify → wait for reschedule input → reassign). Both go through BullMQ workers running as a separate process from the API.
- Why a queue over `setTimeout`/fire-and-forget async calls: retries with backoff, job persistence across process restarts (Redis-backed), and the ability to scale workers independently of the API.
- Rejected a simple cron-poll table: more moving parts to build correctly for less reliability than a maintained queue library gives out of the box.

## 5. Auth

**Choice: JWT (access token) + bcrypt for password hashing**

- Stateless JWT keeps the API horizontally scalable without a server-side session store.
- Role (`customer` / `agent` / `admin`) is embedded in the JWT payload and re-verified server-side on every protected route via middleware — the frontend role check is UX only, never the security boundary.
- Rejected session-cookie auth: no strong reason to need server-side session invalidation at this scale, and JWT simplifies a future mobile client.

## 6. Notifications

**Choice: Resend (email) + Fast2SMS or Twilio trial (SMS) — both free-tier**

- Resend over SendGrid/Nodemailer+Gmail: simplest free-tier API, good deliverability, minimal setup friction for a demo deployment.
- SMS provider is swappable behind a single `notificationService.sendSMS()` interface — whichever free tier is live at deploy time plugs in without touching call sites. This is documented explicitly in the README since free-tier SMS providers change terms often.
- Both are called **only** from inside BullMQ workers, never from route handlers.

## 7. Hosting

**Choice: Railway (API + Postgres + Redis) or Render, with the frontend on Vercel**

- Railway/Render both give a managed Postgres + Redis instance alongside the app, which matters because this stack has three runtime dependencies (API, Postgres, Redis) that need to be co-located or low-latency to each other for the queue and cache to behave.
- Frontend (if a separate SPA) deploys to Vercel for free static/edge hosting; API stays on Railway/Render since it needs a persistent process for the BullMQ worker, which Vercel's serverless model doesn't support well.
- Final choice documented in README with the actual deployed URL once provisioned.

## 8. Project Structure

```
/src
  /modules
    /auth          → register, login, JWT issuance, role middleware
    /zones         → zone & area CRUD (admin)
    /rateCards     → rate card & COD surcharge CRUD (admin)
    /pricing       → the rate engine (pure functions) — billableWeight(), resolveZones(), calculateCharge()
    /orders        → preview/confirm endpoints, order CRUD, status transition endpoint
    /tracking      → order_tracking_history reads, timeline assembly
    /agents        → agent CRUD, clock-in/out, auto-assignment query
    /notifications → BullMQ producers (enqueue) — consumed by /workers
  /workers
    notificationWorker.ts   → sends email/SMS, retries on failure
    rescheduleWorker.ts     → failed-delivery saga steps
  /lib
    prisma.ts, redis.ts, queue.ts, stateMachine.ts (transition whitelist + validateTransition())
  /middleware
    authGuard.ts, roleGuard.ts, errorHandler.ts
/prisma
  schema.prisma, migrations/
```

- **Why pricing is its own module, not nested inside orders**: it's called from two places (preview, confirm) and must never have two implementations. Isolating it forces that reuse.
- **Why workers are a separate top-level folder**: they run as a separate `node` process in production (`npm run worker`), distinct from the API process (`npm run start`), which is the whole point of decoupling notifications from the request path.

## 9. Environment Variables (`.env.example` contents)

```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_URL=redis://host:6379
JWT_SECRET=
JWT_EXPIRES_IN=7d
RESEND_API_KEY=
SMS_PROVIDER_API_KEY=
PORT=4000
NODE_ENV=development
```

## 10. Why Not [X] — quick reference

| Considered | Rejected because |
|---|---|
| NestJS | Heavier DI/module structure than this project's domain count justifies. |
| MongoDB | Domain is relational with strict FK integrity needs (zones→areas→rates→orders). |
| Firebase/Firestore | No native transactional capacity-locking for agent assignment; weak fit for relational rate lookups. |
| GraphQL | Single client type, simple REST CRUD + two pricing endpoints — REST is simpler to grade and document. |
| Cron-based polling for notifications | Strictly worse reliability/retry story than a Redis-backed queue, for similar effort. |
| Synchronous email send in request handler | Couples API latency to a third-party provider's latency — the most common scoring deduction in this type of project. |