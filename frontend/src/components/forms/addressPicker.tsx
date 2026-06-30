// src/components/forms/AddressPicker.tsx
import { VStack, FormControl, FormLabel, Input, Grid, GridItem } from '@chakra-ui/react';
import { Address } from '../../types/models';

interface AddressPickerProps {
  label: string;
  value: Address;
  onChange: (address: Address) => void;
  isRequired?: boolean;
}

export const AddressPicker = ({ label, value, onChange, isRequired = false }: AddressPickerProps) => {
  const handleChange = (field: keyof Address, val: string) => {
    onChange({ ...value, [field]: val });
  };

  return (
    <VStack align="stretch" spacing={4} bg="gray.50" _dark={{ bg: 'gray.800' }} p={4} borderRadius="lg" borderWidth="1px">
      <FormLabel fontWeight="bold" mb={0}>{label}</FormLabel>
      
      <FormControl isRequired={isRequired}>
        <Input 
          placeholder="Street Address (Line 1)" 
          value={value.line1}
          onChange={(e) => handleChange('line1', e.target.value)}
          bg="white"
          _dark={{ bg: 'gray.900' }}
        />
      </FormControl>

      <FormControl>
        <Input 
          placeholder="Apartment, suite, etc. (Optional)" 
          value={value.line2 || ''}
          onChange={(e) => handleChange('line2', e.target.value)}
          bg="white"
          _dark={{ bg: 'gray.900' }}
        />
      </FormControl>

      <Grid templateColumns="repeat(3, 1fr)" gap={4}>
        <GridItem colSpan={1}>
          <FormControl isRequired={isRequired}>
            <Input 
              placeholder="City" 
              value={value.city}
              onChange={(e) => handleChange('city', e.target.value)}
              bg="white"
              _dark={{ bg: 'gray.900' }}
            />
          </FormControl>
        </GridItem>
        <GridItem colSpan={1}>
          <FormControl isRequired={isRequired}>
            <Input 
              placeholder="State" 
              value={value.state}
              onChange={(e) => handleChange('state', e.target.value)}
              bg="white"
              _dark={{ bg: 'gray.900' }}
            />
          </FormControl>
        </GridItem>
        <GridItem colSpan={1}>
          <FormControl isRequired={isRequired}>
            <Input 
              placeholder="Pincode" 
              value={value.pincode}
              onChange={(e) => handleChange('pincode', e.target.value)}
              bg="white"
              _dark={{ bg: 'gray.900' }}
              maxLength={6}
            />
          </FormControl>
        </GridItem>
      </Grid>
    </VStack>
  );
};