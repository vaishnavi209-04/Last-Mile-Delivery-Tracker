// src/pages/Agent/ActiveRun.tsx
import { useEffect, useState } from 'react';
import { Box, Heading, VStack, Card, CardBody, Flex, Text, Button, Badge, Divider } from '@chakra-ui/react';
import { MapPin, Navigation, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ordersApi } from '../../api/services/orders';
import { useApiToast } from '../../hooks/useApiToast';
import { Order } from '../../types/models';
import { StatusBadge } from '../../components/common/statusBadge';

export default function ActiveRun() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showError } = useApiToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignedOrders = async () => {
      try {
        // In a real app, backend would filter by the current logged-in agent ID
        const response = await ordersApi.getOrders({ status: 'ASSIGNED,IN_TRANSIT' });
        setOrders(response.orders || []);
      } catch (error) {
        showError(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssignedOrders();
  }, [showError]);

  if (isLoading) return <Text>Loading your route...</Text>;

  return (
    <Box maxW="2xl" mx="auto">
      <Heading size="lg" mb={6}>Active Run</Heading>

      {orders.length === 0 ? (
        <Card p={8} textAlign="center" variant="outline">
          <Text color="gray.500">No active deliveries assigned right now.</Text>
        </Card>
      ) : (
        <VStack spacing={4} align="stretch">
          {orders.map((order) => (
            <Card key={order.id} shadow="sm" _hover={{ shadow: 'md' }} transition="all 0.2s">
              <CardBody>
                <Flex justify="space-between" mb={4}>
                  <Box>
                    <Text fontWeight="bold" fontSize="lg">{order.trackingId}</Text>
                    <Badge colorScheme={order.paymentType === 'COD' ? 'orange' : 'green'} mt={1}>
                      {order.paymentType === 'COD' ? `Collect ₹${order.totalCharge}` : 'Prepaid'}
                    </Badge>
                  </Box>
                  <StatusBadge status={order.status} />
                </Flex>
                
                <VStack align="stretch" spacing={3} mt={4}>
                  <Flex gap={3} align="flex-start">
                    <Box color="brand.500" mt={1}><MapPin size={18} /></Box>
                    <Box>
                      <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">Pickup</Text>
                      <Text fontSize="sm">{order.pickupAddress.line1}, {order.pickupAddress.city}</Text>
                    </Box>
                  </Flex>
                  
                  <Divider />
                  
                  <Flex gap={3} align="flex-start">
                    <Box color="green.500" mt={1}><Navigation size={18} /></Box>
                    <Box>
                      <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">Drop</Text>
                      <Text fontSize="sm">{order.dropAddress.line1}, {order.dropAddress.city}</Text>
                    </Box>
                  </Flex>
                </VStack>

                <Button 
                  w="full" 
                  mt={6} 
                  rightIcon={<ArrowRight size={18} />}
                  onClick={() => navigate(`/agent/orders/${order.id}`)}
                >
                  Update Status
                </Button>
              </CardBody>
            </Card>
          ))}
        </VStack>
      )}
    </Box>
  );
}