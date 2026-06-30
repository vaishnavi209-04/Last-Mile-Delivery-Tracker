// src/components/common/StatusBadge.tsx
import { Badge } from '@chakra-ui/react';
import { OrderStatus } from '../../types/models';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge = ({ status, size = 'md' }: StatusBadgeProps) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'PENDING':
        return { colorScheme: 'yellow', label: 'Pending' };
      case 'ASSIGNED':
        return { colorScheme: 'purple', label: 'Assigned' };
      case 'IN_TRANSIT':
        return { colorScheme: 'blue', label: 'In Transit' };
      case 'DELIVERED':
        return { colorScheme: 'green', label: 'Delivered' };
      case 'FAILED':
        return { colorScheme: 'red', label: 'Failed' };
      default:
        return { colorScheme: 'gray', label: status };
    }
  };

  const config = getBadgeConfig();

  return (
    <Badge 
      colorScheme={config.colorScheme} 
      px={2.5} 
      py={1} 
      borderRadius="full" 
      fontSize={size === 'sm' ? 'xs' : size === 'lg' ? 'md' : 'sm'}
      variant="subtle"
      textTransform="uppercase"
      letterSpacing="wide"
      fontWeight="bold"
    >
      {config.label}
    </Badge>
  );
};