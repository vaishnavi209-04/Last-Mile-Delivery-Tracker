const fs = require('fs');

const replaces = [
  { file: 'admin/agents/index.tsx', from: 'setAgents(response.data);', to: 'setAgents(response.agents || []);' },
  { file: 'admin/dashboard.tsx', from: 'const orders = ordersRes.data;', to: 'const orders = ordersRes.orders || [];' },
  { file: 'admin/dashboard.tsx', from: 'const agents = agentsRes.data;', to: 'const agents = agentsRes.agents || [];' },
  { file: 'admin/orders/index.tsx', from: 'setOrders(response.data);', to: 'setOrders(response.orders || []);' },
  { file: 'admin/orders/index.tsx', from: 'res => setAgents(res.data)', to: 'res => setAgents(res.agents || [])' },
  { file: 'admin/zones/index.tsx', from: 'setZones(response.data);', to: 'setZones(response.zones || []);' },
  { file: 'agent/activeRun.tsx', from: 'setOrders(response.data);', to: 'setOrders(response.orders || []);' },
  { file: 'agent/assignedOrders.tsx', from: 'setOrders(response.data);', to: 'setOrders(response.orders || []);' },
  { file: 'agent/orderTracking.tsx', from: 'setOrder(response.data);', to: 'setOrder(response.order);' },
  { file: 'agent/orderTracking.tsx', from: 'setOrder(response.data);\n      showSuccess', to: 'setOrder(prev => prev ? { ...prev, status: newStatus as any } : null);\n      showSuccess' },
  { file: 'customer/createOrder/index.tsx', from: 'setPricing(response.data);', to: 'setPricing(response.breakdown);' },
  { file: 'customer/createOrder/index.tsx', from: 'response.data.trackingId', to: 'response.order.trackingId' },
  { file: 'customer/createOrder/index.tsx', from: 'response.data.id', to: 'response.order.id' },
  { file: 'customer/dashboard.tsx', from: 'setOrders(response.data);', to: 'setOrders(response.orders || []);' },
  { file: 'customer/orderHistory.tsx', from: 'setOrders(response.data);', to: 'setOrders(response.orders || []);' },
  { file: 'customer/trackingDetails.tsx', from: 'setOrder(orderRes.data);', to: 'setOrder(orderRes.order);' },
  { file: 'customer/trackingDetails.tsx', from: 'setEvents(timelineRes.data);', to: 'setEvents(timelineRes.timeline || []);' }
];

for (const rep of replaces) {
  const p = 'src/pages/' + rep.file;
  if (fs.existsSync(p)) {
    let c = fs.readFileSync(p, 'utf-8');
    c = c.split(rep.from).join(rep.to);
    fs.writeFileSync(p, c);
    console.log('Patched ' + p);
  }
}
