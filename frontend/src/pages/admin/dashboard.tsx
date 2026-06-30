// src/pages/Admin/Dashboard.tsx
import { useEffect, useState } from 'react';
import { Box, SimpleGrid, Heading, Flex, Text, Card, CardHeader, CardBody } from '@chakra-ui/react';
import { Package, Truck, Users, IndianRupee } from 'lucide-react';
import { ordersApi } from '../../api/services/orders';
import { agentsApi } from '../../api/services/agents';
import { useApiToast } from '../../hooks/useApiToast';
import { StatCard } from '../../components/common/statcard';
import { DataTable, Column } from '../../components/common/datatable';
import { StatusBadge } from '../../components/common/statusBadge';
import { Order } from '../../types/models';

export default function AdminDashboard() {
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({ totalOrders: 0, activeDeliveries: 0, revenue: 0, activeAgents: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const { showError } = useApiToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, agentsRes] = await Promise.all([
          ordersApi.getOrders({ limit: 100 }), // In a real app, use a dedicated stats endpoint
          agentsApi.getAgents()
        ]);

        const orders = ordersRes.orders || [];
        const agents = agentsRes.agents || [];

        setRecentOrders(orders.slice(0, 5));
        
        setStats({
          totalOrders: orders.length,
          activeDeliveries: orders.filter(o => o.status === 'IN_TRANSIT').length,
          revenue: orders.reduce((sum, o) => sum + o.totalCharge, 0),
          activeAgents: agents.filter(a => a.isAvailable).length
        });
      } catch (error) {
        showError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [showError]);

  const orderColumns: Column<Order>[] = [
    { key: 'trackingId', header: 'Tracking ID', render: (o) => <Text fontFamily="mono" fontWeight="bold">{o.trackingId}</Text> },
    { key: 'totalCharge', header: 'Value', render: (o) => `₹${o.totalCharge.toFixed(2)}` },
    { key: 'status', header: 'Status', render: (o) => <StatusBadge status={o.status} size="sm" /> }
  ];

  return (
    <Box>
      <Heading size="lg" mb={8}>Operations Overview</Heading>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <StatCard label="Total Orders" value={stats.totalOrders} icon={Package} trend="up" helpText="+12% this week" />
        <StatCard label="Active Deliveries" value={stats.activeDeliveries} icon={Truck} />
        <StatCard label="Available Agents" value={stats.activeAgents} icon={Users} />
        <StatCard label="Total Revenue" value={`₹${stats.revenue.toLocaleString()}`} icon={IndianRupee} trend="up" helpText="Platform volume" />
      </SimpleGrid>

      <Card variant="outline" bg="white" _dark={{ bg: 'gray.800' }}>
        <CardHeader pb={0}>
          <Heading size="md">Recent Activity</Heading>
        </CardHeader>
        <CardBody>
          <DataTable columns={orderColumns} data={recentOrders} isLoading={isLoading} />
        </CardBody>
      </Card>
    </Box>
  );
}