// src/components/layout/DashboardLayout.tsx
import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { TopNav } from './topNav';

export default function DashboardLayout() {
  const bg = useColorModeValue('gray.50', 'gray.800');

  return (
    <Flex h="100vh" overflow="hidden" bg={bg}>
      {/* Sidebar - Desktop Only */}
      <Box display={{ base: 'none', md: 'block' }} zIndex={10}>
        <Sidebar />
      </Box>
      
      {/* Main Content Area */}
      <Flex flex={1} direction="column" overflow="hidden">
        <TopNav />
        
        <Box as="main" p={{ base: 4, md: 8 }} w="full" maxW="7xl" mx="auto" overflowY="auto" flex={1}>
          {/* This is where the specific page components will render */}
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
}