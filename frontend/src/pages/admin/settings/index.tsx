// src/pages/Admin/Settings/index.tsx
import { useEffect, useState } from 'react';
import { Box, Heading, Card, CardBody, CardHeader, Tabs, TabList, TabPanels, Tab, TabPanel, FormControl, FormLabel, Input, Button, VStack, Flex } from '@chakra-ui/react';
import { adminApi } from '../../../api/services/admin';
import { useApiToast } from '../../../hooks/useApiToast';

export default function AdminSettings() {
  const { showSuccess, showError } = useApiToast();
  
  // COD State
  const [codFlatFee, setCodFlatFee] = useState('50');
  const [codPercentage, setCodPercentage] = useState('0');
  const [isSavingCod, setIsSavingCod] = useState(false);

  const handleSaveCod = async () => {
    setIsSavingCod(true);
    try {
      const type = Number(codPercentage) > 0 ? 'PERCENTAGE' : 'FLAT';
      const value = type === 'PERCENTAGE' ? Number(codPercentage) : Number(codFlatFee);
      
      await Promise.all([
        adminApi.configureCod({ orderType: 'B2C', type, value }),
        adminApi.configureCod({ orderType: 'B2B', type, value })
      ]);
      showSuccess('COD configuration updated');
    } catch (error) {
      showError(error);
    } finally {
      setIsSavingCod(false);
    }
  };

  return (
    <Box maxW="4xl">
      <Heading size="lg" mb={6}>Platform Settings</Heading>
      
      <Card variant="outline" bg="white" _dark={{ bg: 'gray.800' }}>
        <Tabs colorScheme="brand" size="lg">
          <TabList px={4} pt={4}>
            <Tab>Pricing & Rate Cards</Tab>
            <Tab>COD Configuration</Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={6}>
              {/* Note: Normally you'd list RateCards in a DataTable here with Edit buttons */}
              <Box color="gray.500" textAlign="center" py={10}>
                Global rate card overrides will appear here.
              </Box>
            </TabPanel>

            <TabPanel p={6}>
              <VStack align="stretch" spacing={6} maxW="md">
                <Box mb={2}>Configure the surcharges applied to Cash-on-Delivery orders.</Box>
                
                <FormControl>
                  <FormLabel>Flat Fee (₹)</FormLabel>
                  <Input type="number" value={codFlatFee} onChange={(e) => setCodFlatFee(e.target.value)} />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Additional Percentage (%)</FormLabel>
                  <Input type="number" value={codPercentage} onChange={(e) => setCodPercentage(e.target.value)} />
                </FormControl>
                
                <Flex pt={4}>
                  <Button colorScheme="brand" onClick={handleSaveCod} isLoading={isSavingCod}>
                    Save COD Rules
                  </Button>
                </Flex>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>
    </Box>
  );
}