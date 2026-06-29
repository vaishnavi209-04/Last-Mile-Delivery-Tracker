# Product Requirements Document — Last-Mile Delivery Tracker

**Version:** 1.0
**Owner:** Engineering / Solo build (architect + dev)
**Status:** Approved for build

---

## 1. Problem Statement

Small and mid-size logistics operators need a platform to take delivery orders from customers (B2B and B2C), price them correctly against configurable zone-based rate cards, assign the order to a delivery agent, and keep the customer informed at every stage — without manual pricing errors, lost status updates, or double-booked agents.

This product solves three things that are easy to get wrong if treated as CRUD: **pricing must be deterministic and reproducible after rate cards change**, **agent assignment must not race under concurrent orders**, and **status history must be a permanent, append-only record**, not a single mutable field.

---

## 2. Goals

- Let a customer get an accurate, admin-configured price *before* committing to an order.
- Let an admin configure zones, areas, rate cards, and COD surcharges without a code deploy.
- Auto-assign the nearest available agent, or let admin assign manually, with no double-assignment under concurrency.
- Give every order an immutable, timestamped, actor-tagged status trail.
- Notify the customer by email (and SMS where configured) on every status transition, without blocking the request that caused it.
- Handle failed deliveries as a first-class flow: notify → reschedule → reassign.

## 3. Non-Goals (Out of Scope for v1)

- Payment gateway integration (COD/Prepaid are tracked as a field, not processed).
- Route optimization across multiple stops per agent.
- Multi-tenant white-labeling (single operator instance).
- Native mobile apps (responsive web only).
- Real-time GPS trail playback (only current lat/lng per agent).

---

## 4. Personas

| Persona | Needs |
|---|---|
| **Customer** | Register/login, place an order, see price before confirming, track status, reschedule failed deliveries. |
| **Delivery Agent** | See assigned orders, update status as delivery progresses, mark failed with reason. |
| **Admin** | Configure zones/areas/rate cards/COD surcharge, view & filter all orders, manually assign/reassign agents, override any status, create orders on behalf of a customer. |

---

## 5. Functional Requirements

### 5.1 Auth & Roles
- FR-1: Email/password registration & login for customers.
- FR-2: Role-based access control — `customer`, `agent`, `admin`. Admin accounts are seeded/created by admin, not self-registered.
- FR-3: JWT-based session; agent and admin endpoints are role-guarded server-side, not just hidden in UI.

### 5.2 Zone & Rate Configuration (Admin)
- FR-4: Admin can create/edit zones.
- FR-5: Admin can map pincodes (areas) to a zone. One pincode → one zone.
- FR-6: Admin can configure rate cards per **(from_zone, to_zone, order_type)** — separate cards for B2B and B2C, separate rates for intra-zone vs inter-zone.
- FR-7: Admin can configure COD surcharge per order type (flat or percentage).
- FR-8: Rate card edits must never retroactively change the price of an already-placed order (see §6.2, price snapshot).

### 5.3 Order Creation & Pricing
- FR-9: Customer or admin (on behalf of customer) enters pickup address, drop address, L×B×H, actual weight, order type, payment type.
- FR-10: System resolves pickup zone and drop zone from pincode → area → zone.
- FR-11: System computes volumetric weight = (L×B×H)/5000 and bills on **max(actual weight, volumetric weight)**.
- FR-12: System looks up the correct rate card by (from_zone, to_zone, order_type) and computes the base charge.
- FR-13: If payment type is COD, the configured COD surcharge is added.
- FR-14: The full price breakdown is shown to the customer **before** the order is confirmed (no DB write yet).
- FR-15: On confirmation, the same calculation is re-run server-side (never trust a client-sent price) and the order is created with the result frozen onto it.

### 5.4 Agent Assignment
- FR-16: Admin can manually assign any available agent to an order.
- FR-17: Admin (or system, post-confirmation) can trigger auto-assignment, which selects the nearest **clocked-in** agent with available capacity in/near the pickup zone.
- FR-18: Two concurrent assignment attempts must never assign the same agent past their max capacity.

### 5.5 Status Lifecycle
- FR-19: Order status moves only through allowed transitions: `CREATED → PICKED_UP → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED`, and any active state `→ FAILED`, and `FAILED → RESCHEDULED → (reassignment → PICKED_UP...)`.
- FR-20: Every transition is recorded as a new row in an append-only history table with actor, timestamp, and optional notes. The current status on the order is a derived convenience field, never the source of truth.
- FR-21: Admin can override status directly (still goes through the same transition-logging path, actor = admin).

### 5.6 Failed Delivery & Reschedule
- FR-22: Marking an order `FAILED` triggers a customer notification with a reschedule link/flow.
- FR-23: Customer submits a reschedule date → order moves to `RESCHEDULED` → a new assignment is triggered for that order.
- FR-24: Each failed attempt is visible in the tracking timeline, not overwritten.

### 5.7 Notifications
- FR-25: Every status change enqueues an email notification job; it does not run inline in the request that changed the status.
- FR-26: SMS notification on the same trigger, using any free-tier provider, behind the same queue.
- FR-27: Notification failures are retried with backoff and do not affect order state.

### 5.8 Visibility
- FR-28: Customer can view their own orders and full tracking timeline.
- FR-29: Admin can view all orders, filter by status, zone, and agent.
- FR-30: Agent can view only orders assigned to them.

---

## 6. Key Business Rules (the parts evaluators/graders will probe hardest)

### 6.1 Billable weight is a pure function
`billableWeight(l, b, h, actualWeight) = max(actualWeight, (l*b*h)/5000)`
Must be implemented once and reused identically by the preview endpoint and the confirm endpoint. Two implementations that can drift is a defect.

### 6.2 Price snapshot, not live recompute
Once an order is created, its charge is **frozen** on the order row (including which rate card values were applied). Changing a rate card tomorrow must never alter the price of an order placed today. Historical orders must remain reproducible from their own snapshot, not from a join to current config.

### 6.3 Status is a ledger, not a flag
`current_status` on `orders` is a cached pointer for fast filtering. The actual truth is `order_tracking_history`. Nothing ever updates a status row in place.

### 6.4 No double-assignment under concurrency
If admin clicks "auto-assign" twice, or two orders auto-assign in the same second, the same agent must not exceed `max_capacity`. This is enforced at the data layer (row locking / atomic increment), not just in application logic.

### 6.5 Quote price must equal confirm price
The preview and confirm endpoints must call the **same** rate engine function with the **same** inputs. If they diverge, customers get quoted one price and charged another — treated as a critical bug.

---

## 7. Acceptance Criteria (mapped to stated evaluation focus)

| Evaluation Area | Acceptance Criteria |
|---|---|
| Rate engine correctness | Given any (zones, weight, order type, payment type) combination, the computed charge matches a hand-calculated expected value in test fixtures, with zero hardcoded rates in code. |
| Auto-assignment | Under a simulated burst of concurrent assignment calls, no agent is ever assigned past `max_capacity`. |
| Status lifecycle | Attempting an invalid transition (e.g. `DELIVERED → PICKED_UP`) returns HTTP 409 and writes no history row. Every valid transition writes exactly one new row. |
| Schema & modeling | `order_tracking_history` has no `UPDATE` statements anywhere in the codebase touching status fields. |
| API design | Preview and confirm both delegate to one shared pricing module; verified by code review / shared function reference. |
| Documentation | README + design doc allow a reviewer to set up the project from a clean clone using only `.env.example` and stated steps. |

---

## 8. Success Metrics (for this build, not a live business)

- All functional requirements (FR-1 to FR-30) demoable end-to-end.
- Rate engine unit tests pass for at least: intra-zone B2C, inter-zone B2C, intra-zone B2B, inter-zone B2B, COD surcharge on/off, volumetric > actual, actual > volumetric.
- Concurrency test on auto-assignment shows no capacity violation across N parallel requests.
- Hosted demo URL reachable, seed data present, all three roles usable without manual DB edits.

---

## 9. Risks & Open Questions

- **Geo precision**: if using pincode-only zone mapping (no live lat/lng for customers), "nearest agent" auto-assignment is necessarily zone-based, not true geodistance, unless agent lat/lng is also matched against a zone centroid. Documented as a deliberate simplification in the design doc.
- **Free-tier SMS providers** often gate on verified numbers/sandbox mode — acceptable for demo, called out in README.
- **Single rate card per (zone pair, order type)** assumed — no time-based/seasonal rate variation in v1.