import { useState } from 'react';
import { 
  Box, Card, CardBody, CardHeader, Heading, VStack, HStack, 
  FormControl, FormLabel, Input, Select, Button, Text, Divider,
  Step, StepDescription, StepIcon, StepIndicator, StepNumber, 
  Stepper, StepStatus, StepTitle, StepSeparator, useSteps, Flex
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check, IndianRupee } from 'lucide-react';
import { ordersApi } from '../../../api/services/orders';
import { useApiToast } from '../../../hooks/useApiToast';

const steps = [
  { title: 'Addresses', description: 'Pickup & Drop' },
  { title: 'Package', description: 'Details & Options' },
  { title: 'Preview', description: 'Confirm Pricing' },
];

export default function CreateOrder() {
  const navigate = useNavigate();
  const { showError, showSuccess } = useApiToast();
  const { activeStep, goToNext, goToPrevious } = useSteps({
    index: 0,
    count: steps.length,
  });

  // Form State
  const [formData, setFormData] = useState({
    pickupAddress: '',
    pickupPincode: '',
    dropAddress: '',
    dropPincode: '',
    actualWeight: '',
    lengthCm: '10',
    breadthCm: '10',
    heightCm: '10',
    orderType: 'B2C',
    paymentType: 'PREPAID',
  });

  // Pricing State
  const [pricing, setPricing] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePreview = async () => {
    setIsLoading(true);
    try {
      // Convert weight and dimensions to numbers for the backend
      const payload = { 
        ...formData, 
        actualWeightKg: Number(formData.actualWeight),
        lengthCm: Number(formData.lengthCm),
        breadthCm: Number(formData.breadthCm),
        heightCm: Number(formData.heightCm)
      };
      const response = await ordersApi.previewPricing(payload);
      
      setPricing(response.breakdown);
      goToNext(); // Move to step 3 only on success
    } catch (error: any) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmOrder = async () => {
    setIsLoading(true);
    try {
      const payload = { 
        ...formData, 
        actualWeightKg: Number(formData.actualWeight),
        lengthCm: Number(formData.lengthCm),
        breadthCm: Number(formData.breadthCm),
        heightCm: Number(formData.heightCm)
      };
      const response = await ordersApi.confirmOrder(payload);
      
      showSuccess(`Order created successfully! Tracking ID: ${response.order.trackingId}`);
      navigate(`/customer/orders/${response.order.id}`);
    } catch (error: any) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="3xl" mx="auto">
      <Heading size="lg" mb={8}>Create New Delivery</Heading>

      {/* Stepper Navigation */}
      <Stepper index={activeStep} colorScheme="brand" mb={10}>
        {steps.map((step, index) => (
          <Step key={index}>
            <StepIndicator>
              <StepStatus
                complete={<StepIcon />}
                incomplete={<StepNumber />}
                active={<StepNumber />}
              />
            </StepIndicator>
            <Box flexShrink="0">
              <StepTitle>{step.title}</StepTitle>
              <StepDescription>{step.description}</StepDescription>
            </Box>
            <StepSeparator />
          </Step>
        ))}
      </Stepper>

      <Card>
        <CardBody p={8}>
          
          {/* STEP 1: Addresses */}
          {activeStep === 0 && (
            <VStack spacing={6} align="stretch">
              <HStack spacing={6}>
                <FormControl isRequired>
                  <FormLabel>Pickup Address</FormLabel>
                  <Input 
                    name="pickupAddress" 
                    value={formData.pickupAddress} 
                    onChange={handleInputChange} 
                    placeholder="Complete pickup location" 
                    size="lg"
                  />
                </FormControl>
                <FormControl isRequired maxW="150px">
                  <FormLabel>Pincode</FormLabel>
                  <Input 
                    name="pickupPincode" 
                    value={formData.pickupPincode} 
                    onChange={handleInputChange} 
                    placeholder="e.g. 110001" 
                    size="lg"
                  />
                </FormControl>
              </HStack>

              <HStack spacing={6}>
                <FormControl isRequired>
                  <FormLabel>Drop Address</FormLabel>
                  <Input 
                    name="dropAddress" 
                    value={formData.dropAddress} 
                    onChange={handleInputChange} 
                    placeholder="Complete destination address" 
                    size="lg"
                  />
                </FormControl>
                <FormControl isRequired maxW="150px">
                  <FormLabel>Pincode</FormLabel>
                  <Input 
                    name="dropPincode" 
                    value={formData.dropPincode} 
                    onChange={handleInputChange} 
                    placeholder="e.g. 110002" 
                    size="lg"
                  />
                </FormControl>
              </HStack>

              <Flex justify="flex-end" pt={4}>
                <Button 
                  rightIcon={<ArrowRight size={18} />} 
                  onClick={goToNext}
                  isDisabled={!formData.pickupAddress || !formData.dropAddress || !formData.pickupPincode || !formData.dropPincode}
                >
                  Next Details
                </Button>
              </Flex>
            </VStack>
          )}

          {/* STEP 2: Package Details */}
          {activeStep === 1 && (
            <VStack spacing={6} align="stretch">
              <HStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Weight (kg)</FormLabel>
                  <Input 
                    name="actualWeight" 
                    type="number"
                    step="0.1"
                    value={formData.actualWeight} 
                    onChange={handleInputChange} 
                    placeholder="e.g. 2.5" 
                    size="lg"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Length (cm)</FormLabel>
                  <Input 
                    name="lengthCm" 
                    type="number"
                    value={formData.lengthCm} 
                    onChange={handleInputChange} 
                    placeholder="L" 
                    size="lg"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Breadth (cm)</FormLabel>
                  <Input 
                    name="breadthCm" 
                    type="number"
                    value={formData.breadthCm} 
                    onChange={handleInputChange} 
                    placeholder="B" 
                    size="lg"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Height (cm)</FormLabel>
                  <Input 
                    name="heightCm" 
                    type="number"
                    value={formData.heightCm} 
                    onChange={handleInputChange} 
                    placeholder="H" 
                    size="lg"
                  />
                </FormControl>
              </HStack>

              <HStack spacing={6}>
                <FormControl isRequired>
                  <FormLabel>Order Type</FormLabel>
                  <Select name="orderType" value={formData.orderType} onChange={handleInputChange} size="lg">
                    <option value="B2C">B2C (Business to Consumer)</option>
                    <option value="B2B">B2B (Business to Business)</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Payment Method</FormLabel>
                  <Select name="paymentType" value={formData.paymentType} onChange={handleInputChange} size="lg">
                    <option value="PREPAID">Prepaid</option>
                    <option value="COD">Cash on Delivery (COD)</option>
                  </Select>
                </FormControl>
              </HStack>

              <Flex justify="space-between" pt={4}>
                <Button variant="ghost" leftIcon={<ArrowLeft size={18} />} onClick={goToPrevious}>
                  Back
                </Button>
                <Button 
                  rightIcon={<ArrowRight size={18} />} 
                  onClick={handlePreview}
                  isLoading={isLoading}
                  loadingText="Calculating..."
                  isDisabled={!formData.actualWeight}
                >
                  Preview Pricing
                </Button>
              </Flex>
            </VStack>
          )}

          {/* STEP 3: Preview & Confirm */}
          {activeStep === 2 && pricing && (
            <VStack spacing={6} align="stretch">
              <Box bg="gray.50" p={6} borderRadius="lg" border="1px" borderColor="gray.100">
                <Heading size="sm" color="gray.500" mb={4} textTransform="uppercase">Pricing Breakdown</Heading>
                
                <VStack spacing={3} align="stretch">
                  <Flex justify="space-between">
                    <Text color="gray.600">Base Charge (per kg)</Text>
                    <Text fontWeight="medium">₹{pricing.baseCharge}</Text>
                  </Flex>
                  
                  {pricing.codSurcharge > 0 && (
                    <Flex justify="space-between">
                      <Text color="gray.600">COD Surcharge</Text>
                      <Text fontWeight="medium">₹{pricing.codSurcharge}</Text>
                    </Flex>
                  )}

                  <Flex justify="space-between">
                    <Text color="gray.600">Billable Weight</Text>
                    <Text fontWeight="medium">{pricing.billableWeight} kg</Text>
                  </Flex>

                  <Divider my={2} />

                  <Flex justify="space-between" align="center">
                    <Text fontSize="lg" fontWeight="bold">Total Amount</Text>
                    <Flex align="center" color="brand.600">
                      <IndianRupee size={20} />
                      <Text fontSize="2xl" fontWeight="bold">{pricing.total}</Text>
                    </Flex>
                  </Flex>
                </VStack>
              </Box>

              <Flex justify="space-between" pt={4}>
                <Button variant="ghost" leftIcon={<ArrowLeft size={18} />} onClick={goToPrevious} isDisabled={isLoading}>
                  Edit Details
                </Button>
                <Button 
                  rightIcon={<Check size={18} />} 
                  onClick={handleConfirmOrder}
                  isLoading={isLoading}
                  loadingText="Confirming..."
                  size="lg"
                >
                  Confirm Order
                </Button>
              </Flex>
            </VStack>
          )}

        </CardBody>
      </Card>
    </Box>
  );
}