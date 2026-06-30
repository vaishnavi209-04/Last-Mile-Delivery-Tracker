// src/components/layout/Sidebar.tsx
import { Box, VStack, Flex, Text, Icon, useColorModeValue } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Map, Users, Settings, Activity } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar = () => {
  const { user } = useAuth();
  const bg = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.100', 'gray.700');

  const getLinks = () => {
    switch (user?.role?.toUpperCase()) {
      case 'ADMIN':
        return [
          { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
          { name: 'Orders', icon: Package, path: '/admin/orders' },
          { name: 'Agents', icon: Users, path: '/admin/agents' },
          { name: 'Zones', icon: Map, path: '/admin/zones' },
          { name: 'Settings', icon: Settings, path: '/admin/settings' },
        ];
      case 'CUSTOMER':
        return [
          { name: 'Dashboard', icon: LayoutDashboard, path: '/customer/dashboard' },
          { name: 'New Delivery', icon: Package, path: '/customer/orders/create' },
        ];
      case 'AGENT':
        return [
          { name: 'My Tasks', icon: LayoutDashboard, path: '/agent/dashboard' },
          { name: 'Active Run', icon: Activity, path: '/agent/active' },
        ];
      default:
        return [];
    }
  };

  return (
    <Box w="64" bg={bg} borderRight="1px" borderColor={borderColor} h="full" py={6}>
      <VStack align="stretch" spacing={6} h="full">
        {/* Brand Logo Area */}
        <Flex px={6} align="center" gap={3}>
          <Flex bg="brand.500" color="white" p={2} borderRadius="lg">
            <Package size={24} />
          </Flex>
          <Text fontSize="xl" fontWeight="black" letterSpacing="tight">
            Tracker
          </Text>
        </Flex>
        
        {/* Navigation Links */}
        <VStack align="stretch" spacing={1} px={3} flex={1}>
          {getLinks().map((link) => (
            <Flex
              as={NavLink}
              key={link.name}
              to={link.path}
              align="center"
              p={3}
              borderRadius="lg"
              color="gray.600"
              _dark={{ color: 'gray.400' }}
              _hover={{ bg: 'brand.50', color: 'brand.600', _dark: { bg: 'whiteAlpha.100', color: 'brand.200' } }}
              _activeLink={{ 
                bg: 'brand.50', 
                color: 'brand.600', 
                fontWeight: 'bold',
                _dark: { bg: 'brand.900', color: 'brand.100' }
              }}
              transition="all 0.2s"
            >
              <Icon as={link.icon} mr={3} size={20} />
              <Text>{link.name}</Text>
            </Flex>
          ))}
        </VStack>
      </VStack>
    </Box>
  );
};