// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Define your environment variables here
  readonly VITE_API_BASE_URL: string;
  
  // Example of other variables you might add later:
  // readonly VITE_MAPS_API_KEY: string;
  // readonly VITE_ENVIRONMENT: 'development' | 'production' | 'staging';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}