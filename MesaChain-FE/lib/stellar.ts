import { 
  Asset, 
  Horizon, 
  Operation, 
  TransactionBuilder,
  Transaction
} from 'stellar-sdk';
import { STELLAR_CONFIG } from '@/config/stellar';

const XLM_ASSET = Asset.native();

export async function createPaymentTransaction(
  sourcePublicKey: string,
  destinationPublicKey: string,
  amount: string
): Promise<string> {
  try {
    console.log('Creating XLM payment transaction:', {
      from: sourcePublicKey,
      to: destinationPublicKey,
      amount: `${amount} XLM`
    });

    const server = new Horizon.Server(STELLAR_CONFIG.HORIZON_URL);
    
    // Load the source account
    const sourceAccount = await server.loadAccount(sourcePublicKey);
    console.log('Source account loaded successfully');

    // Build the transaction
    const transaction = new TransactionBuilder(sourceAccount, {
      fee: STELLAR_CONFIG.DEFAULT_FEE,
      networkPassphrase: STELLAR_CONFIG.NETWORK_PASSPHRASE,
    })
      .addOperation(
        Operation.payment({
          destination: destinationPublicKey,
          asset: XLM_ASSET, // Native XLM
          amount: amount,
        })
      )
      .setTimeout(STELLAR_CONFIG.TRANSACTION_TIMEOUT)
      .build();

    const xdr = transaction.toXDR();
    console.log('XLM transaction XDR created successfully');
    return xdr;

  } catch (error) {
    console.error('Error creating XLM payment transaction:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('account_not_found')) {
        throw new Error('Wallet account not found on Stellar testnet. Please fund your wallet first.');
      } else if (error.message.includes('op_underfunded')) {
        throw new Error('Insufficient XLM balance. You need more XLM in your wallet.');
      }
    }
    
    throw new Error('Failed to create XLM payment transaction');
  }
}

export async function submitTransaction(signedTransactionXDR: string): Promise<string> {
  try {
    console.log('Submitting signed XLM transaction to Stellar testnet...');

    const server = new Horizon.Server(STELLAR_CONFIG.HORIZON_URL);
    
    // Parse the signed transaction
    const transaction = new Transaction(signedTransactionXDR, STELLAR_CONFIG.NETWORK_PASSPHRASE);
    
    // Submit to the testnet
    const result = await server.submitTransaction(transaction);
    
    console.log('XLM transaction submitted successfully:', result.hash);
    return result.hash;

  } catch (error) {
    console.error('Error submitting XLM transaction:', error);
    
    // Handle Stellar-specific errors
    if (error instanceof Error && 'response' in error) {
      const stellarError = error as any;
      
      if (stellarError.response?.data?.extras?.result_codes) {
        const resultCodes = stellarError.response.data.extras.result_codes;
        console.error('Stellar result codes:', resultCodes);
        
        if (resultCodes.transaction === 'tx_insufficient_fee') {
          throw new Error('Transaction fee too low');
        } else if (resultCodes.transaction === 'tx_no_source_account') {
          throw new Error('Source account not found');
        } else if (resultCodes.transaction === 'tx_bad_seq') {
          throw new Error('Invalid sequence number');
        } else if (resultCodes.operations?.includes('op_underfunded')) {
          throw new Error('Insufficient XLM balance');
        } else if (resultCodes.operations?.includes('op_no_destination')) {
          throw new Error('Destination account not found');
        }
      }
    }
    
    throw new Error('Failed to submit XLM transaction to testnet');
  }
}

export async function getXLMBalance(publicKey: string): Promise<string> {
  try {
    console.log('Fetching XLM balance for:', publicKey);

    const server = new Horizon.Server(STELLAR_CONFIG.HORIZON_URL);
    const account = await server.loadAccount(publicKey);

    // Find native XLM balance
    const xlmBalance = account.balances.find((balance) => {
      return balance.asset_type === 'native';
    });

    const balance = xlmBalance ? xlmBalance.balance : '0';
    console.log('XLM balance:', balance);
    return balance;

  } catch (error) {
    console.error(`Error fetching XLM balance for ${publicKey}:`, error);
    return '0';
  }
}

export async function checkAccountExists(publicKey: string): Promise<boolean> {
  try {
    const server = new Horizon.Server(STELLAR_CONFIG.HORIZON_URL);
    await server.loadAccount(publicKey);
    return true;
  } catch (error) {
    return false;
  }
}

// XLM doesn't need trustlines since it's the native asset
export async function checkAccountFunded(publicKey: string): Promise<boolean> {
  try {
    const balance = await getXLMBalance(publicKey);
    // Check if account has more than base reserve (0.5 XLM)
    return parseFloat(balance) > parseFloat(STELLAR_CONFIG.BASE_RESERVE);
  } catch (error) {
    console.error('Error checking account funding:', error);
    return false;
  }
}

// Helper function to validate Stellar addresses
export function isValidStellarAddress(address: string): boolean {
  return /^G[A-Z0-9]{55}$/.test(address);
}

// Helper function to format Stellar amounts (remove trailing zeros)
export function formatStellarAmount(amount: string | number): string {
  return parseFloat(amount.toString()).toString();
}

// Helper function to convert USD amount to XLM (mock conversion rate)
export function convertUSDToXLM(usdAmount: number): string {
  // Mock conversion rate: 1 USD = 10 XLM (you should use real rates from an API)
  const XLM_PER_USD = 10;
  const xlmAmount = usdAmount * XLM_PER_USD;
  return formatStellarAmount(xlmAmount.toFixed(7)); // XLM supports 7 decimal places
}

// Get testnet XLM from friendbot (for testing)
export async function fundTestnetAccount(publicKey: string): Promise<boolean> {
  try {
    console.log('Funding testnet account:', publicKey);
    const response = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
    const result = await response.json();
    console.log('Friendbot response:', result);
    return response.ok;
  } catch (error) {
    console.error('Error funding testnet account:', error);
    return false;
  }
}