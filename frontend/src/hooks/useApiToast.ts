// src/hooks/useApiToast.ts
import { useToast, UseToastOptions } from "@chakra-ui/react";
import { ApiError } from "../types/api";

export const useApiToast = () => {
  const toast = useToast();

  const defaultOptions: UseToastOptions = {
    duration: 5000,
    isClosable: true,
    position: "top-right",
    variant: "left-accent", // Looks more modern/SaaS-like
  };

  const showSuccess = (message: string, title: string = "Success") => {
    toast({
      ...defaultOptions,
      title,
      description: message,
      status: "success",
    });
  };

  const showError = (error: ApiError | string | unknown, title: string = "Error") => {
    let description = "An unexpected error occurred.";

    if (typeof error === 'string') {
      description = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      // Safely extract the message from our custom ApiError object
      description = (error as ApiError).message;
      
      // Optionally append specific validation errors if they exist
      const apiError = error as ApiError;
      if (apiError.errors && apiError.errors.length > 0) {
        description += ` (${apiError.errors.join(', ')})`;
      }
    }

    toast({
      ...defaultOptions,
      title,
      description,
      status: "error",
      duration: 7000, // Keep errors on screen a bit longer
    });
  };

  const showInfo = (message: string, title: string = "Information") => {
    toast({
      ...defaultOptions,
      title,
      description: message,
      status: "info",
    });
  };

  return { showSuccess, showError, showInfo };
};