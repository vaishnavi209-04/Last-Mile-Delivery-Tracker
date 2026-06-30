// src/pages/Customer/OrderHistory.tsx
import { useEffect, useState } from 'react';
import { Box, Flex, Heading, Input, Select, InputGroup, InputLeftElement, Card } from '@chakra-ui/react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ordersApi } from '../../api/services/orders';
import { useApiToast } from '../../hooks/useApiToast';
import { Order } from '../../types/models';
import { DataTable, Column } from '../../components/common/datatable';
import { StatusBadge } from '../../components/common/statusBadge';

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  
  const { showError } = useApiToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const params = statusFilter ? { status: statusFilter } : {};
        const response = await ordersApi.getOrders(params);
        setOrders(response.orders || []);
      } catch (error) {
        showError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [statusFilter, showError]);

  const columns: Column<Order>[] = [
    { 
      key: 'trackingId', 
      header: 'Tracking ID',
      render: (order) => <Box fontWeight="bold" fontFamily="mono">{order.trackingId}</Box>
    },
    { 
      key: 'createdAt', 
      header: 'Date',
      render: (order) => new Date(order.createdAt).toLocaleDateString()
    },
    { 
      key: 'dropAddress', 
      header: 'Destination',
      render: (order) => `${order.dropAddress.city}, ${order.dropAddress.state}`
    },
    { 
      key: 'totalCharge', 
      header: 'Amount',
      render: (order) => `₹${order.totalCharge.toFixed(2)}`
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (order) => <StatusBadge status={order.status} />
    }
  ];

  return (
    <Box>
      <Heading size="lg" mb={6}>Order History</Heading>

      <Card p={4} mb={6} variant="outline" bg="white" _dark={{ bg: 'gray.800' }}>
        <Flex gap={4} flexDir={{ base: 'column', md: 'row' }}>
          <InputGroup maxW={{ md: '400px' }}>
            <InputLeftElement pointerEvents="none" color="gray.400">
              <Search size={18} />
            </InputLeftElement>
            <Input 
              placeholder="Search tracking ID..." 
              bg="gray.50" 
              _dark={{ bg: 'gray.900' }}
            />
          </InputGroup>
          
          <Select 
            maxW={{ md: '200px' }} 
            bg="gray.50" 
            _dark={{ bg: 'gray.900' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="DELIVERED">Delivered</option>
            <option value="FAILED">Failed</option>
          </Select>
        </Flex>
      </Card>

      <Card overflow="hidden" variant="outline" bg="white" _dark={{ bg: 'gray.800' }}>
        <DataTable
          columns={columns}
          data={orders}
          isLoading={isLoading}
          onRowClick={(order) => navigate(`/customer/orders/${order.id}`)}
        />
      </Card>
    </Box>
  );
}