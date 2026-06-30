// src/pages/Agent/OrderTracking.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Card, CardBody, Heading, VStack, Text, Button, Flex, Divider } from '@chakra-ui/react';
import { CheckCircle, AlertTriangle, Truck } from 'lucide-react';
import { ordersApi } from '../../api/services/orders';
import { useApiToast } from '../../hooks/useApiToast';
import { Order } from '../../types/models';
import { StatusBadge } from '../../components/common/statusBadge';

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useApiToast();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchDetails = async () => {
      try {
        const response = await ordersApi.getOrderDetails(id);
        setOrder(response.order);
      } catch (error) {
        showError(error);
        navigate('/agent/active');
      }
    };
    fetchDetails();
  }, [id, showError, navigate]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!id) return;
    setIsUpdating(true);
    try {
      const response = await ordersApi.updateStatus(id, { status: newStatus });
      setOrder(response.order);
      showSuccess(`Status updated to ${newStatus.replace('_', ' ')}`);
      
      if (newStatus === 'DELIVERED' || newStatus === 'FAILED') {
        setTimeout(() => navigate('/agent/active'), 1500);
      }
    } catch (error) {
      showError(error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!order) return <Text p={8}>Loading order details...</Text>;

  return (
    <Box maxW="2xl" mx="auto">
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="md">Order {order.trackingId}</Heading>
        <StatusBadge status={order.status} />
      </Flex>

      <Card mb={6}>
        <CardBody>
          <VStack align="stretch" spacing={4}>
            <Box>
              <Text fontSize="sm" color="gray.500">Delivery Address</Text>
              <Text fontWeight="medium">{order.dropAddress.line1}</Text>
              <Text>{order.dropAddress.city}, {order.dropAddress.state} {order.dropAddress.pincode}</Text>
            </Box>
            
            <Divider />
            
            <Flex justify="space-between">
              <Box>
                <Text fontSize="sm" color="gray.500">Weight</Text>
                <Text fontWeight="medium">{order.actualWeight} kg</Text>
              </Box>
              <Box textAlign="right">
                <Text fontSize="sm" color="gray.500">To Collect (COD)</Text>
                <Text fontWeight="bold" color="brand.600" fontSize="lg">
                  {order.paymentType === 'COD' ? `₹${order.totalCharge}` : 'Prepaid (₹0)'}
                </Text>
              </Box>
            </Flex>
          </VStack>
        </CardBody>
      </Card>

      <Heading size="sm" mb={4} color="gray.600">Update Status</Heading>
      <VStack spacing={4}>
        {order.status === 'ASSIGNED' && (
          <Button 
            w="full" size="lg" colorScheme="blue" 
            leftIcon={<Truck />} isLoading={isUpdating}
            onClick={() => handleUpdateStatus('IN_TRANSIT')}
          >
            Mark as In Transit
          </Button>
        )}

        {order.status === 'IN_TRANSIT' && (
          <>
            <Button 
              w="full" size="lg" colorScheme="green" 
              leftIcon={<CheckCircle />} isLoading={isUpdating}
              onClick={() => handleUpdateStatus('DELIVERED')}
            >
              Mark as Delivered
            </Button>
            
            <Button 
              w="full" size="lg" colorScheme="red" variant="outline"
              leftIcon={<AlertTriangle />} isLoading={isUpdating}
              onClick={() => handleUpdateStatus('FAILED')}
            >
              Mark as Failed Attempt
            </Button>
          </>
        )}

        {(order.status === 'DELIVERED' || order.status === 'FAILED') && (
          <Text textAlign="center" color="gray.500" w="full" py={4}>
            This delivery is complete. No further updates can be made.
          </Text>
        )}
      </VStack>
    </Box>
  );
}