// src/utils/currency.ts

/**
 * Formats a number to Indian Rupee (INR) standard presentation.
 * @param amount The numerical amount to format
 * @returns Formatted string (e.g., "₹1,250.00")
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};