// src/components/common/DataTable.tsx
import { 
  Table, Thead, Tbody, Tr, Th, Td, TableContainer, 
  Box, Flex, Button, Text, Spinner 
} from '@chakra-ui/react';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  isLoading = false,
  onRowClick,
  currentPage = 1,
  totalPages = 1,
  onPageChange
}: DataTableProps<T>) {
  
  if (isLoading) {
    return (
      <Flex justify="center" align="center" py={12}>
        <Spinner size="xl" color="brand.500" thickness="4px" />
      </Flex>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Flex direction="column" align="center" justify="center" py={12} color="gray.500">
        <Inbox size={48} strokeWidth={1} style={{ marginBottom: '16px' }} />
        <Text fontSize="lg">No records found</Text>
      </Flex>
    );
  }

  return (
    <Box>
      <TableContainer>
        <Table variant="simple" size="md">
          <Thead bg="gray.50" _dark={{ bg: 'gray.800' }}>
            <Tr>
              {columns.map((col) => (
                <Th key={col.key} color="gray.500" fontSize="xs" textTransform="uppercase">
                  {col.header}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {data.map((row) => (
              <Tr 
                key={row.id} 
                _hover={onRowClick ? { bg: 'gray.50', _dark: { bg: 'gray.700' }, cursor: 'pointer' } : {}}
                onClick={() => onRowClick && onRowClick(row)}
                transition="background 0.2s"
              >
                {columns.map((col) => (
                  <Td key={`${row.id}-${col.key}`} borderColor="gray.100" _dark={{ borderColor: 'gray.700' }}>
                    {col.render ? col.render(row) : (row as any)[col.key]}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Pagination Controls */}
      {totalPages > 1 && onPageChange && (
        <Flex justify="space-between" align="center" mt={6} px={4}>
          <Text fontSize="sm" color="gray.500">
            Page {currentPage} of {totalPages}
          </Text>
          <Flex gap={2}>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onPageChange(currentPage - 1)}
              isDisabled={currentPage === 1}
              leftIcon={<ChevronLeft size={16} />}
            >
              Previous
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onPageChange(currentPage + 1)}
              isDisabled={currentPage === totalPages}
              rightIcon={<ChevronRight size={16} />}
            >
              Next
            </Button>
          </Flex>
        </Flex>
      )}
    </Box>
  );
}