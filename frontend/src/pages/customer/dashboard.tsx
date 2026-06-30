// src/pages/Customer/Dashboard.tsx
import { useEffect, useState } from 'react';
import { Box, SimpleGrid, Heading, Table, Thead, Tbody, Tr, Th, Td, Card, Button, Flex } from '@chakra-ui/react';
import { Package, Truck, CheckCircle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ordersApi } from '../../api/services/orders';
import { Order } from '../../types/models';
import { useApiToast } from '../../hooks/useApiToast';
import { StatCard } from '../../components/common/statcard';
import { StatusBadge } from '../../components/common/statusBadge';

export default function CustomerDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showError } = useApiToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await ordersApi.getOrders({ limit: 5 });
        setOrders(response.orders || []);
      } catch (error: any) {
        showError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [showError]);

  const activeOrders = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'FAILED').length;

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={8}>
        <Heading size="lg">Dashboard</Heading>
        <Button 
          leftIcon={<Plus size={18} />} 
          onClick={() => navigate('/customer/orders/create')}
        >
          Create Order
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <StatCard label="Total Orders" value={orders.length} icon={Package} />
        <StatCard label="Active Deliveries" value={activeOrders} icon={Truck} />
        <StatCard label="Successfully Delivered" value={orders.length - activeOrders} icon={CheckCircle} />
      </SimpleGrid>

      <Card p={0} overflowX="auto">
        <Box p={5} borderBottom="1px" borderColor="gray.100">
          <Heading size="md">Recent Activity</Heading>
        </Box>
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>Tracking ID</Th>
              <Th>Date</Th>
              <Th>Charge</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <Tr><Td colSpan={4} textAlign="center">Loading...</Td></Tr>
            ) : orders.length === 0 ? (
              <Tr><Td colSpan={4} textAlign="center">No orders found.</Td></Tr>
            ) : (
              orders.map((order) => (
                <Tr key={order.id} _hover={{ bg: 'gray.50' }} cursor="pointer" onClick={() => navigate(`/customer/orders/${order.id}`)}>
                  <Td fontWeight="medium">{order.trackingId}</Td>
                  <Td>{new Date(order.createdAt).toLocaleDateString()}</Td>
                  <Td>₹{order.totalCharge.toFixed(2)}</Td>
                  <Td><StatusBadge status={order.status} /></Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Card>
    </Box>
  );
}