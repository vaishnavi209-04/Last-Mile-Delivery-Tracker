// src/pages/Auth/Login.tsx
import { useState, FormEvent } from 'react';
import { 
  Box, Flex, Heading, Text, Input, Button, 
  VStack, FormControl, FormLabel, useColorModeValue 
} from '@chakra-ui/react';
import { Package, Truck, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/services/auth';
import { useAuth } from '../../hooks/useAuth';
import { useApiToast } from '../../hooks/useApiToast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const { showSuccess, showError } = useApiToast();
  const navigate = useNavigate();

  const bgColor = useColorModeValue('white', 'gray.900');

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });
      
      // The interceptor unwraps Axios response.data, and the backend
      // returns { token, user } directly — so `response` is already the payload.
      login(response.user, response.token);
      showSuccess('Welcome back!');
      
      // Redirect based on role
      const role = response.user.role.toLowerCase();
      navigate(`/${role}/dashboard`);
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minH="100vh">
      {/* Left Section - Showcase */}
      <Flex 
        flex={1} 
        bg="brand.500" 
        color="white" 
        p={10} 
        direction="column" 
        justify="center"
        display={{ base: 'none', lg: 'flex' }}
      >
        <Box mb={8}>
          <Package size={48} strokeWidth={1.5} />
        </Box>
        <Heading size="2xl" mb={4}>Speed. Reliability. Precision.</Heading>
        <Text fontSize="xl" mb={12}>
          The modern platform for managing last-mile deliveries with complete operational visibility.
        </Text>
        
        <VStack align="flex-start" spacing={6}>
           <Flex align="center" gap={4}>
             <Truck size={24} />
             <Text fontSize="lg">Real-time driver tracking</Text>
           </Flex>
           <Flex align="center" gap={4}>
             <Activity size={24} />
             <Text fontSize="lg">Instant status updates</Text>
           </Flex>
        </VStack>
      </Flex>

      {/* Right Section - Auth Panel */}
      <Flex flex={1} align="center" justify="center" bg={bgColor} p={8}>
        <Box w="full" maxW="md">
          <Heading size="lg" mb={2}>Welcome back</Heading>
          <Text color="gray.500" mb={8}>Enter your credentials to access your dashboard.</Text>

          <form onSubmit={handleLogin}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="name@company.com" 
                  size="lg"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  size="lg"
                />
              </FormControl>

              <Button 
                type="submit" 
                w="full" 
                size="lg" 
                isLoading={isLoading} 
                loadingText="Authenticating..."
                mt={4}
              >
                Sign In
              </Button>
            </VStack>
          </form>
        </Box>
      </Flex>
    </Flex>
  );
}