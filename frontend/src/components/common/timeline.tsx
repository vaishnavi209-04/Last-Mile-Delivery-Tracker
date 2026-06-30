// src/components/common/Timeline.tsx
import { Box, Flex, Text, VStack, Circle, Icon, useColorModeValue } from '@chakra-ui/react';
import { Package, Truck, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { TimelineEvent, OrderStatus } from '../../types/models';
import { StatusBadge } from './statusBadge';

interface TimelineProps {
  events: TimelineEvent[];
}

export const Timeline = ({ events }: TimelineProps) => {
  const lineColor = useColorModeValue('gray.200', 'gray.700');
  
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING': return { icon: Clock, bg: 'yellow.100', color: 'yellow.600' };
      case 'ASSIGNED': return { icon: Package, bg: 'purple.100', color: 'purple.600' };
      case 'IN_TRANSIT': return { icon: Truck, bg: 'blue.100', color: 'blue.600' };
      case 'DELIVERED': return { icon: CheckCircle, bg: 'green.100', color: 'green.600' };
      case 'FAILED': return { icon: AlertCircle, bg: 'red.100', color: 'red.600' };
      default: return { icon: Package, bg: 'gray.100', color: 'gray.600' };
    }
  };

  if (!events || events.length === 0) {
    return <Text color="gray.500">No tracking history available.</Text>;
  }

  // Sort events so the newest is at the top
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <VStack spacing={0} align="stretch" w="full">
      {sortedEvents.map((event, index) => {
        const isLast = index === sortedEvents.length - 1;
        const style = getStatusIcon(event.status);

        return (
          <Flex key={event.id} position="relative" pb={isLast ? 0 : 8}>
            {/* Vertical Connecting Line */}
            {!isLast && (
              <Box 
                position="absolute" 
                left="19px" 
                top="40px" 
                bottom="-8px" 
                w="2px" 
                bg={lineColor} 
                zIndex={0}
              />
            )}

            {/* Status Node */}
            <Circle 
              size="40px" 
              bg={style.bg} 
              color={style.color} 
              zIndex={1}
              boxShadow="0 0 0 4px var(--chakra-colors-chakra-body-bg)"
            >
              <Icon as={style.icon} size={20} />
            </Circle>

            {/* Event Details */}
            <Box ml={6} pt={1} flex={1}>
              <Flex justify="space-between" align="center" mb={1} wrap="wrap" gap={2}>
                <StatusBadge status={event.status} size="sm" />
                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                  {new Date(event.createdAt).toLocaleString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </Text>
              </Flex>
              
              <Text fontSize="sm" color="gray.700" mt={2}>
                {event.notes || `Order status updated to ${event.status.replace('_', ' ')}.`}
              </Text>
              
              {event.actorId && (
                <Text fontSize="xs" color="gray.400" mt={1}>
                  Updated by: {event.actorId}
                </Text>
              )}
            </Box>
          </Flex>
        );
      })}
    </VStack>
  );
};