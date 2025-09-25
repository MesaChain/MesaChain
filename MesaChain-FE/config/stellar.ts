export const STELLAR_CONFIG = {
  HORIZON_URL: 'https://horizon-testnet.stellar.org',
  NETWORK_PASSPHRASE: 'Test SDF Network ; September 2015',
  
  NATIVE_ASSET: 'native', // XLM
  
  // Restaurant's receiving wallet (replace with your actual testnet wallet)
  RESTAURANT_STELLAR_ADDRESS: 'GBERU7A7FTE5USXDCXF2UJCDXQIWACLLIEFETHU23DWVTVJKVKZWKEJV',
  
  // Transaction Configuration
  DEFAULT_FEE: '100000', 
  TRANSACTION_TIMEOUT: 30, 
  

  BASE_RESERVE: '0.5', 
};

// For production mainnet (when ready)
export const STELLAR_MAINNET_CONFIG = {
  HORIZON_URL: 'https://horizon.stellar.org',
  NETWORK_PASSPHRASE: 'Public Global Stellar Network ; September 2015',
  DEFAULT_FEE: '100000', 
  RESTAURANT_STELLAR_ADDRESS: 'YOUR_MAINNET_WALLET_ADDRESS',
};