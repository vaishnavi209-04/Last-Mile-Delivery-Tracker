// src/pages/Admin/Zones/index.tsx
import { useEffect, useState } from 'react';
import { Box, Heading, Card, Button, Flex, Badge, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, FormControl, FormLabel } from '@chakra-ui/react';
import { Plus } from 'lucide-react';
import { adminApi } from '../../../api/services/admin';
import { useApiToast } from '../../../hooks/useApiToast';
import { Zone } from '../../../types/models';
import { DataTable, Column } from '../../../components/common/datatable';

export default function AdminZones() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newZoneName, setNewZoneName] = useState('');
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { showSuccess, showError } = useApiToast();

  const fetchZones = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getZones();
      setZones(response.zones || []);
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchZones(); }, []);

  const handleCreateZone = async () => {
    try {
      await adminApi.createZone({ name: newZoneName, isActive: true });
      showSuccess('Zone created successfully');
      onClose();
      fetchZones();
    } catch (error) {
      showError(error);
    }
  };

  const columns: Column<Zone>[] = [
    { key: 'id', header: 'Zone ID' },
    { key: 'name', header: 'Zone Name', render: (z) => <Box fontWeight="bold">{z.name}</Box> },
    { key: 'isActive', header: 'Status', render: (z) => <Badge colorScheme={z.isActive ? 'green' : 'red'}>{z.isActive ? 'Active' : 'Inactive'}</Badge> }
  ];

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Delivery Zones</Heading>
        <Button leftIcon={<Plus size={16} />} onClick={onOpen}>Create Zone</Button>
      </Flex>
      
      <Card variant="outline" bg="white" _dark={{ bg: 'gray.800' }}>
        <DataTable columns={columns} data={zones} isLoading={isLoading} />
      </Card>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Zone</ModalHeader>
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Zone Name (e.g., North District)</FormLabel>
              <Input value={newZoneName} onChange={(e) => setNewZoneName(e.target.value)} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
            <Button colorScheme="brand" onClick={handleCreateZone} isDisabled={!newZoneName}>Save Zone</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}