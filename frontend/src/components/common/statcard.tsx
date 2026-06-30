// src/components/common/StatCard.tsx
import { Card, CardBody, Stat, StatLabel, StatNumber, StatHelpText, Flex, Icon, useColorModeValue } from '@chakra-ui/react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  helpText?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral'; // Optional: for Admin revenue/volume trends
}

export const StatCard = ({ label, value, helpText, icon, trend }: StatCardProps) => {
  const iconBg = useColorModeValue('brand.50', 'brand.900');
  const iconColor = useColorModeValue('brand.600', 'brand.200');
  const valueColor = useColorModeValue('gray.800', 'white');
  const labelColor = useColorModeValue('gray.500', 'gray.400');

  return (
    <Card transition="transform 0.2s" _hover={{ transform: 'translateY(-2px)' }}>
      <CardBody>
        <Flex justify="space-between" align="flex-start">
          <Stat>
            <StatLabel color={labelColor} fontSize="sm" fontWeight="medium" mb={1}>
              {label}
            </StatLabel>
            <StatNumber fontSize="3xl" fontWeight="bold" color={valueColor}>
              {value}
            </StatNumber>
            {helpText && (
              <StatHelpText mb={0} mt={1} fontSize="xs" color={trend === 'up' ? 'green.500' : trend === 'down' ? 'red.500' : 'gray.500'}>
                {helpText}
              </StatHelpText>
            )}
          </Stat>
          <Flex bg={iconBg} p={3} borderRadius="xl" color={iconColor}>
            <Icon as={icon} size={24} strokeWidth={2} />
          </Flex>
        </Flex>
      </CardBody>
    </Card>
  );
};