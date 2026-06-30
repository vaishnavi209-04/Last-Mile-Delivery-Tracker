// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import App from './app';
import theme from './theme';

// Ensure the root element exists to satisfy TypeScript
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element. Ensure index.html has a <div id="root"></div>');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);