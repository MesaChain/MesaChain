import { z } from 'zod';

const configSchema = z.object({
  NEXT_PUBLIC_STELLAR_NETWORK: z.enum(['testnet', 'mainnet']).default('testnet'),
  NEXT_PUBLIC_HORIZON_URL: z.string().url().default('https://horizon-testnet.stellar.org'),
  NEXT_PUBLIC_API_BASE_URL_BACKEND: z.string().url().default('http://localhost:4000'),
  NEXT_PUBLIC_API_BASE_URL_FRONTEND: z.string().url().default('http://localhost:3000'),
});

let config;
try {
  config = configSchema.parse({
    NEXT_PUBLIC_STELLAR_NETWORK: process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet',
    NEXT_PUBLIC_HORIZON_URL: process.env.NEXT_PUBLIC_HORIZON_URL || 'https://horizon-testnet.stellar.org',
    NEXT_PUBLIC_API_BASE_URL_BACKEND: process.env.NEXT_PUBLIC_API_BASE_URL_BACKEND || 'http://localhost:4000',
    NEXT_PUBLIC_API_BASE_URL_FRONTEND: process.env.NEXT_PUBLIC_API_BASE_URL_FRONTEND || 'http://localhost:3000',
  });
} catch (error) {
  console.warn('Using default configuration values. Create a .env file for custom configuration.');
  // Use default values if validation fails
  config = {
    NEXT_PUBLIC_STELLAR_NETWORK: 'testnet',
    NEXT_PUBLIC_HORIZON_URL: 'https://horizon-testnet.stellar.org',
    NEXT_PUBLIC_API_BASE_URL_BACKEND: 'http://localhost:4000',
    NEXT_PUBLIC_API_BASE_URL_FRONTEND: 'http://localhost:3000',
  };
}

export const stellarNetwork = config.NEXT_PUBLIC_STELLAR_NETWORK;
export const horizonUrl = config.NEXT_PUBLIC_HORIZON_URL;
export const apiBaseUrlBackend = config.NEXT_PUBLIC_API_BASE_URL_BACKEND;
export const apiBaseUrlFrontend = config.NEXT_PUBLIC_API_BASE_URL_FRONTEND;

export const stellarNetworkPassphrase = stellarNetwork === 'testnet'
  ? 'Test SDF Network ; September 2015'
  : 'Public Global Stellar Network ; September 2015'; 
