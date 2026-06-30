// src/components/layout/TopNav.tsx
import { Flex, IconButton, useColorMode, Menu, MenuButton, MenuList, MenuItem, Avatar, Text, Box } from '@chakra-ui/react';
import { Moon, Sun, User, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const TopNav = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, logout } = useAuth();

  return (
    <Flex 
      px={8} 
      py={4} 
      align="center" 
      justify="flex-end" 
      bg="white" 
      _dark={{ bg: 'gray.900', borderColor: 'gray.700' }}
      borderBottom="1px" 
      borderColor="gray.100"
    >
      <Flex align="center" gap={4}>
        <IconButton
          aria-label="Toggle Theme"
          icon={colorMode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          onClick={toggleColorMode}
          variant="ghost"
          rounded="full"
        />

        <Menu placement="bottom-end">
          <MenuButton>
            <Flex align="center" gap={3} p={1} rounded="full" _hover={{ bg: 'gray.50', _dark: { bg: 'gray.800' } }}>
              <Avatar size="sm" name={user?.name} bg="brand.500" color="white" />
              <Box display={{ base: 'none', md: 'block' }} textAlign="left">
                <Text fontSize="sm" fontWeight="bold" lineHeight="1">{user?.name}</Text>
                <Text fontSize="xs" color="gray.500" textTransform="capitalize">{user?.role?.toLowerCase()}</Text>
              </Box>
            </Flex>
          </MenuButton>
          <MenuList shadow="lg" borderRadius="xl">
            <MenuItem icon={<User size={16} />}>Profile</MenuItem>
            <MenuItem icon={<LogOut size={16} />} color="red.500" onClick={logout}>
              Sign Out
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Flex>
  );
};