// src/components/forms/DateSelect.tsx
import { FormControl, FormLabel, Input, InputProps } from '@chakra-ui/react';

interface DateSelectProps extends InputProps {
  label: string;
  value: string;
  onChangeDate: (date: string) => void;
}

export const DateSelect = ({ label, value, onChangeDate, ...rest }: DateSelectProps) => {
  return (
    <FormControl isRequired={rest.isRequired}>
      <FormLabel>{label}</FormLabel>
      <Input
        type="date"
        value={value}
        onChange={(e) => onChangeDate(e.target.value)}
        sx={{
          '::-webkit-calendar-picker-indicator': {
            cursor: 'pointer',
            opacity: 0.6,
            transition: '0.2s',
            _hover: { opacity: 1 },
          },
        }}
        {...rest}
      />
    </FormControl>
  );
};