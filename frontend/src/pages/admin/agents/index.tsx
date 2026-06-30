// src/pages/Admin/Agents/index.tsx
import { useEffect, useState } from 'react';
import { Box, Heading, Card, Badge, Progress, Flex, Text } from '@chakra-ui/react';
import { agentsApi } from '../../../api/services/agents';
import { useApiToast } from '../../../hooks/useApiToast';
import { Agent } from '../../../types/models';
import { DataTable, Column } from '../../../components/common/datatable';

export default function AdminAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showError } = useApiToast();

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await agentsApi.getAgents();
        setAgents(response.agents || []);
      } catch (error) {
        showError(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAgents();
  }, [showError]);

  const columns: Column<Agent>[] = [
    { key: 'name', header: 'Name', render: (a) => <Text fontWeight="bold">{a.name}</Text> },
    { key: 'phone', header: 'Contact' },
    { 
      key: 'status', 
      header: 'Status', 
      render: (a) => (
        <Badge colorScheme={a.isAvailable ? 'green' : 'gray'}>
          {a.isAvailable ? 'Online' : 'Offline'}
        </Badge>
      )
    },
    { 
      key: 'workload', 
      header: 'Current Load', 
      render: (a) => (
        <Box w="100px">
          <Flex justify="space-between" fontSize="xs" mb={1} color="gray.500">
            <span>{a.activeDeliveries}</span>
            <span>Max {a.capacity}</span>
          </Flex>
          <Progress 
            value={(a.activeDeliveries / a.capacity) * 100} 
            size="sm" 
            colorScheme={a.activeDeliveries >= a.capacity ? 'red' : 'brand'} 
            borderRadius="full" 
          />
        </Box>
      )
    }
  ];

  return (
    <Box>
      <Heading size="lg" mb={6}>Fleet Management</Heading>
      <Card variant="outline" bg="white" _dark={{ bg: 'gray.800' }}>
        <DataTable columns={columns} data={agents} isLoading={isLoading} />
      </Card>
    </Box>
  );
}