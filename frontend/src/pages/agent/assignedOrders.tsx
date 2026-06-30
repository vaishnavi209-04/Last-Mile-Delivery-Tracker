// src/pages/Agent/AssignedOrders.tsx
import { useEffect, useState } from 'react';
import { Box, Heading, VStack, Card, CardBody, Flex, Text, Button, Divider, Spinner, Center } from '@chakra-ui/react';
import { MapPin, Navigation, ArrowRight, PackageOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ordersApi } from '../../api/services/orders';
import { useApiToast } from '../../hooks/useApiToast';
import { Order } from '../../types/models';
import { StatusBadge } from '../../components/common/statusBadge';

export default function AssignedOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showError } = useApiToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignedOrders = async () => {
      try {
        // Fetch only orders strictly in 'ASSIGNED' state for this agent
        const response = await ordersApi.getOrders({ status: 'ASSIGNED' });
        setOrders(response.orders || []);
      } catch (error) {
        showError(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssignedOrders();
  }, [showError]);

  if (isLoading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="brand.500" thickness="4px" />
      </Center>
    );
  }

  return (
    <Box maxW="2xl" mx="auto" pb={8}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Assigned to You</Heading>
        <Text color="gray.500" fontWeight="bold">{orders.length} Tasks</Text>
      </Flex>

      {orders.length === 0 ? (
        <Card p={10} textAlign="center" variant="outline" bg="gray.50" _dark={{ bg: 'gray.800' }}>
          <Center flexDirection="column" gap={4} color="gray.400">
            <PackageOpen size={48} strokeWidth={1.5} />
            <Text fontSize="lg">Your queue is currently empty.</Text>
          </Center>
        </Card>
      ) : (
        <VStack spacing={4} align="stretch">
          {orders.map((order) => (
            <Card key={order.id} shadow="sm" border="1px" borderColor="gray.100" _dark={{ borderColor: 'gray.700' }}>
              <CardBody>
                <Flex justify="space-between" align="center" mb={4}>
                  <Text fontWeight="bold" fontSize="lg" fontFamily="mono">
                    {order.trackingId}
                  </Text>
                  <StatusBadge status={order.status} />
                </Flex>
                
                <VStack align="stretch" spacing={3} mt={4}>
                  <Flex gap={3} align="flex-start">
                    <Box color="brand.500" mt={1}><MapPin size={18} /></Box>
                    <Box>
                      <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">Pickup From</Text>
                      <Text fontSize="sm" fontWeight="medium">{order.pickupAddress.line1}</Text>
                      <Text fontSize="xs" color="gray.600">{order.pickupAddress.city}, {order.pickupAddress.pincode}</Text>
                    </Box>
                  </Flex>
                  
                  <Divider my={1} />
                  
                  <Flex gap={3} align="flex-start">
                    <Box color="blue.500" mt={1}><Navigation size={18} /></Box>
                    <Box>
                      <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">Deliver To</Text>
                      <Text fontSize="sm" fontWeight="medium">{order.dropAddress.line1}</Text>
                      <Text fontSize="xs" color="gray.600">{order.dropAddress.city}, {order.dropAddress.pincode}</Text>
                    </Box>
                  </Flex>
                </VStack>

                <Flex mt={6} gap={3}>
                  <Button 
                    w="full" 
                    colorScheme="brand"
                    rightIcon={<ArrowRight size={18} />}
                    onClick={() => navigate(`/agent/orders/${order.id}`)}
                  >
                    Start Run
                  </Button>
                </Flex>
              </CardBody>
            </Card>
          ))}
        </VStack>
      )}
    </Box>
  );
}