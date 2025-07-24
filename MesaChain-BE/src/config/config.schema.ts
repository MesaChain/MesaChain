import { z } from 'zod';

export const configSchema = z.object({
  STELLAR_NETWORK: z.enum(['testnet', 'mainnet']),
  HORIZON_URL: z.string().url(),
  API_BASE_URL_BACKEND: z.string().url(),
  API_BASE_URL_FRONTEND: z.string().url(),
});

export type ConfigSchema = z.infer<typeof configSchema>;
