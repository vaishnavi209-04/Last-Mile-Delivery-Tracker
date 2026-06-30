// src/pages/Customer/TrackingDetails.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Grid, GridItem, Card, CardBody, CardHeader, Heading, 
  Text, VStack, Flex, Divider, Button, Alert, AlertIcon, AlertDescription 
} from '@chakra-ui/react';
import { PackageOpen, MapPin, Calendar, CreditCard, RefreshCw } from 'lucide-react';
import { ordersApi } from '../../api/services/orders';
import { useApiToast } from '../../hooks/useApiToast';
import { Order, TimelineEvent } from '../../types/models';
import { StatusBadge } from '../../components/common/statusBadge';
import { Timeline } from '../../components/common/timeline';

export default function TrackingDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useApiToast();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRescheduling, setIsRescheduling] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const fetchOrderData = async () => {
      setIsLoading(true);
      try {
        // Fetch order details and timeline in parallel
        const [orderRes, timelineRes] = await Promise.all([
          ordersApi.getOrderDetails(id),
          ordersApi.getOrderTimeline(id)
        ]);
        
        setOrder(orderRes.order);
        setEvents(timelineRes.timeline || []);
      } catch (error) {
        showError(error);
        navigate('/customer/orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderData();
  }, [id, showError, navigate]);

  const handleReschedule = async () => {
    if (!id) return;
    setIsRescheduling(true);
    try {
      // Assuming a simple reschedule payload for now, could open a modal with a DateSelect
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      await ordersApi.rescheduleOrder(id, { date: tomorrow.toISOString() });
      showSuccess('Delivery successfully rescheduled for tomorrow.');
      
      // Refresh data
      const [orderRes, timelineRes] = await Promise.all([
        ordersApi.getOrderDetails(id),
        ordersApi.getOrderTimeline(id)
      ]);
      setOrder(orderRes.order);
      setEvents(timelineRes.timeline || []);
    } catch (error) {
      showError(error);
    } finally {
      setIsRescheduling(false);
    }
  };

  if (isLoading || !order) {
    return <Text p={8} color="gray.500">Loading tracking details...</Text>;
  }

  return (
    <Box maxW="6xl" mx="auto">
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <Box>
          <Text fontSize="sm" color="gray.500" textTransform="uppercase" fontWeight="bold">Tracking ID</Text>
          <Heading size="lg" fontFamily="mono">{order.trackingId}</Heading>
        </Box>
        <StatusBadge status={order.status} size="lg" />
      </Flex>

      {order.status === 'FAILED' && (
        <Alert status="error" borderRadius="lg" mb={6} variant="left-accent">
          <AlertIcon />
          <Box flex="1">
            <Text fontWeight="bold">Delivery Attempt Failed</Text>
            <AlertDescription fontSize="sm">
              We were unable to deliver your package. You can schedule another attempt below.
            </AlertDescription>
          </Box>
          <Button 
            colorScheme="red" 
            size="sm" 
            leftIcon={<RefreshCw size={16} />}
            isLoading={isRescheduling}
            onClick={handleReschedule}
          >
            Reschedule Attempt
          </Button>
        </Alert>
      )}

      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
        {/* Left Column: Details */}
        <GridItem>
          <VStack spacing={6} align="stretch">
            
            {/* Location Card */}
            <Card variant="outline" bg="white" _dark={{ bg: 'gray.800' }}>
              <CardHeader pb={0}>
                <Heading size="md" display="flex" alignItems="center" gap={2}>
                  <MapPin size={20} /> Route Information
                </Heading>
              </CardHeader>
              <CardBody>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                  <Box>
                    <Text fontSize="sm" color="gray.500" fontWeight="bold" textTransform="uppercase" mb={2}>Pickup</Text>
                    <Text fontWeight="medium">{order.pickupAddress.line1}</Text>
                    {order.pickupAddress.line2 && <Text>{order.pickupAddress.line2}</Text>}
                    <Text>{order.pickupAddress.city}, {order.pickupAddress.state} {order.pickupAddress.pincode}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500" fontWeight="bold" textTransform="uppercase" mb={2}>Destination</Text>
                    <Text fontWeight="medium">{order.dropAddress.line1}</Text>
                    {order.dropAddress.line2 && <Text>{order.dropAddress.line2}</Text>}
                    <Text>{order.dropAddress.city}, {order.dropAddress.state} {order.dropAddress.pincode}</Text>
                  </Box>
                </Grid>
              </CardBody>
            </Card>

            {/* Package & Payment Card */}
            <Card variant="outline" bg="white" _dark={{ bg: 'gray.800' }}>
              <CardHeader pb={0}>
                <Heading size="md" display="flex" alignItems="center" gap={2}>
                  <PackageOpen size={20} /> Package & Payment
                </Heading>
              </CardHeader>
              <CardBody>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                  <Box>
                    <VStack align="stretch" spacing={3}>
                      <Flex justify="space-between">
                        <Text color="gray.500">Order Type</Text>
                        <Text fontWeight="medium">{order.orderType}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.500">Billable Weight</Text>
                        <Text fontWeight="medium">{order.billableWeight} kg</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.500">Date Created</Text>
                        <Flex align="center" gap={2} fontWeight="medium">
                          <Calendar size={14} />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </Flex>
                      </Flex>
                    </VStack>
                  </Box>
                  
                  <Box>
                    <VStack align="stretch" spacing={3}>
                      <Flex justify="space-between">
                        <Text color="gray.500">Payment Type</Text>
                        <Text fontWeight="medium">{order.paymentType}</Text>
                      </Flex>
                      <Divider />
                      <Flex justify="space-between" align="center">
                        <Text color="gray.500" fontWeight="bold">Total Amount</Text>
                        <Flex align="center" gap={1} color="brand.600" fontWeight="bold" fontSize="lg">
                          <CreditCard size={18} />
                          ₹{order.totalCharge.toFixed(2)}
                        </Flex>
                      </Flex>
                    </VStack>
                  </Box>
                </Grid>
              </CardBody>
            </Card>

          </VStack>
        </GridItem>

        {/* Right Column: Tracking Timeline */}
        <GridItem>
          <Card variant="outline" bg="white" _dark={{ bg: 'gray.800' }} h="100%">
            <CardHeader pb={0}>
              <Heading size="md">Tracking Timeline</Heading>
            </CardHeader>
            <CardBody>
              <Timeline events={events} />
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  );
}