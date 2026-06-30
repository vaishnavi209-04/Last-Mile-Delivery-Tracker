// src/pages/Admin/Orders/index.tsx
import { useEffect, useState } from 'react';
import { 
  Box, Heading, Card, Button, Flex, Select, useDisclosure, 
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton
} from '@chakra-ui/react';
import { Zap, UserPlus } from 'lucide-react';
import { ordersApi } from '../../../api/services/orders';
import { agentsApi } from '../../../api/services/agents';
import { useApiToast } from '../../../hooks/useApiToast';
import { Order, Agent } from '../../../types/models';
import { DataTable, Column } from '../../../components/common/datatable';
import { StatusBadge } from '../../../components/common/statusBadge';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { showSuccess, showError } = useApiToast();

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await ordersApi.getOrders();
      setOrders(response.orders || []);
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Pre-fetch agents for the assignment modal
    agentsApi.getAgents().then(res => setAgents(res.agents || [])).catch(console.error);
  }, []);

  const handleOpenAssignModal = (order: Order) => {
    setSelectedOrder(order);
    setSelectedAgentId('');
    onOpen();
  };

  const handleManualAssign = async () => {
    if (!selectedOrder || !selectedAgentId) return;
    setIsAssigning(true);
    try {
      await ordersApi.assignAgent(selectedOrder.id, { agentId: selectedAgentId });
      showSuccess('Agent assigned successfully');
      onClose();
      fetchOrders();
    } catch (error) {
      showError(error);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleAutoAssign = async (orderId: string) => {
    try {
      await ordersApi.autoAssignAgent(orderId);
      showSuccess('Order auto-assigned to best available agent');
      fetchOrders();
    } catch (error) {
      showError(error);
    }
  };

  const columns: Column<Order>[] = [
    { key: 'trackingId', header: 'Tracking ID', render: (o) => <Box fontFamily="mono">{o.trackingId}</Box> },
    { key: 'createdAt', header: 'Date', render: (o) => new Date(o.createdAt).toLocaleDateString() },
    { key: 'status', header: 'Status', render: (o) => <StatusBadge status={o.status} /> },
    { 
      key: 'actions', 
      header: 'Actions', 
      render: (o) => o.status === 'PENDING' ? (
        <Flex gap={2}>
          <Button size="sm" leftIcon={<UserPlus size={14} />} onClick={() => handleOpenAssignModal(o)}>Assign</Button>
          <Button size="sm" colorScheme="brand" leftIcon={<Zap size={14} />} onClick={() => handleAutoAssign(o.id)}>Auto</Button>
        </Flex>
      ) : (
        <Box color="gray.500" fontSize="sm">{o.agentId || 'Assigned'}</Box>
      )
    }
  ];

  return (
    <Box>
      <Heading size="lg" mb={6}>Order Management</Heading>
      <Card variant="outline" bg="white" _dark={{ bg: 'gray.800' }}>
        <DataTable columns={columns} data={orders} isLoading={isLoading} />
      </Card>

      {/* Assignment Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Assign Delivery Agent</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Select 
              placeholder="Select available agent" 
              value={selectedAgentId} 
              onChange={(e) => setSelectedAgentId(e.target.value)}
            >
              {agents.filter(a => a.isAvailable).map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} (Load: {agent.activeDeliveries}/{agent.capacity})
                </option>
              ))}
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
            <Button colorScheme="brand" onClick={handleManualAssign} isLoading={isAssigning} isDisabled={!selectedAgentId}>
              Confirm Assignment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}