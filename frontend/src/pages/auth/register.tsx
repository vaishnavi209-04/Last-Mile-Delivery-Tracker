// src/pages/Auth/Register.tsx
import { useState, FormEvent } from 'react';
import { 
  Box, Flex, Heading, Text, Input, Button, 
  VStack, FormControl, FormLabel, useColorModeValue, Link 
} from '@chakra-ui/react';
import { Package, Map, ShieldCheck } from 'lucide-react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { authApi } from '../../api/services/auth';
import { useApiToast } from '../../hooks/useApiToast';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const { showSuccess, showError } = useApiToast();
  const navigate = useNavigate();

  const bgColor = useColorModeValue('white', 'gray.900');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      showError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      await authApi.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      
      showSuccess('Account created successfully! Please log in.');
      navigate('/login');
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
        bg="brand.900" 
        color="white" 
        p={10} 
        direction="column" 
        justify="center"
        display={{ base: 'none', lg: 'flex' }}
      >
        <Box mb={8}>
          <Package size={48} strokeWidth={1.5} color="var(--chakra-colors-brand-200)" />
        </Box>
        <Heading size="2xl" mb={4}>Join the Network.</Heading>
        <Text fontSize="xl" mb={12} color="brand.100">
          Create an account to start shipping instantly with transparent pricing and real-time tracking.
        </Text>
        
        <VStack align="flex-start" spacing={6} color="brand.50">
           <Flex align="center" gap={4}>
             <Map size={24} />
             <Text fontSize="lg">Nationwide zone coverage</Text>
           </Flex>
           <Flex align="center" gap={4}>
             <ShieldCheck size={24} />
             <Text fontSize="lg">Secure and insured deliveries</Text>
           </Flex>
        </VStack>
      </Flex>

      {/* Right Section - Auth Panel */}
      <Flex flex={1} align="center" justify="center" bg={bgColor} p={8}>
        <Box w="full" maxW="md">
          <Heading size="lg" mb={2}>Create an account</Heading>
          <Text color="gray.500" mb={8}>
            Already have an account?{' '}
            <Link as={RouterLink} to="/login" color="brand.500" fontWeight="bold">
              Sign in
            </Link>
          </Text>

          <form onSubmit={handleRegister}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Full Name</FormLabel>
                <Input 
                  name="name"
                  type="text" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="John Doe" 
                  size="lg"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input 
                  name="email"
                  type="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="name@company.com" 
                  size="lg"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input 
                  name="password"
                  type="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  placeholder="••••••••" 
                  size="lg"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <Input 
                  name="confirmPassword"
                  type="password" 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                  placeholder="••••••••" 
                  size="lg"
                />
              </FormControl>

              <Button 
                type="submit" 
                w="full" 
                size="lg" 
                isLoading={isLoading} 
                loadingText="Creating account..."
                mt={4}
              >
                Register
              </Button>
            </VStack>
          </form>
        </Box>
      </Flex>
    </Flex>
  );
}