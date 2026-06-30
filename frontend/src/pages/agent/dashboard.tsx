// src/pages/Agent/Dashboard.tsx
import { useState } from 'react';
import { Box, Flex, Heading, Button, SimpleGrid, Text, Card, CardBody } from '@chakra-ui/react';
import { Package, CheckCircle, Clock, Power, PowerOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useApiToast } from '../../hooks/useApiToast';
import { agentsApi } from '../../api/services/agents';
import { StatCard } from '../../components/common/statcard';
// If using the geolocation hook: import { useGeolocation } from '../../hooks/useGeolocation';

export default function AgentDashboard() {
  const { user } = useAuth();
  const { showSuccess, showError } = useApiToast();
  
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // useGeolocation(isClockedIn); // Automatically tracks location in background if true

  const toggleAvailability = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      if (isClockedIn) {
        await agentsApi.clockOut(user.id);
        showSuccess("You are now offline. Enjoy your rest!");
      } else {
        await agentsApi.clockIn(user.id);
        showSuccess("You are now online and ready for deliveries.");
      }
      setIsClockedIn(!isClockedIn);
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={8} wrap="wrap" gap={4}>
        <Heading size="lg">Agent Overview</Heading>
        
        <Button
          size="lg"
          colorScheme={isClockedIn ? 'red' : 'green'}
          leftIcon={isClockedIn ? <PowerOff size={20} /> : <Power size={20} />}
          onClick={toggleAvailability}
          isLoading={isLoading}
          loadingText="Updating..."
          boxShadow="md"
        >
          {isClockedIn ? 'Go Offline (Clock Out)' : 'Go Online (Clock In)'}
        </Button>
      </Flex>

      {!isClockedIn && (
        <Card bg="yellow.50" border="1px" borderColor="yellow.200" mb={8}>
          <CardBody>
            <Text color="yellow.700" fontWeight="medium">
              You are currently offline. Go online to receive delivery assignments and track your route.
            </Text>
          </CardBody>
        </Card>
      )}

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        <StatCard label="Assigned Tasks" value="4" icon={Package} />
        <StatCard label="Completed Today" value="12" icon={CheckCircle} />
        <StatCard label="Hours Active" value="5.5h" icon={Clock} />
      </SimpleGrid>
    </Box>
  );
}