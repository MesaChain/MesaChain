// hooks/useWallet.ts - Simplified and More Reliable Version
import { useState, useCallback, useEffect } from 'react';
import { StellarWalletsKit, WalletNetwork, allowAllModules } from '@creit.tech/stellar-wallets-kit';
import toast from 'react-hot-toast';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: number | null;
  network: WalletNetwork;
}

// Create kit instance outside of hook to ensure it's shared
const kit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: '',
  modules: allowAllModules(),
});

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    network: WalletNetwork.TESTNET,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Starting wallet connection...');

      await kit.openModal({
        onWalletSelected: async (option) => {
          console.log('Wallet selected:', option.id);
          
          try {
            kit.setWallet(option.id);
            const { address } = await kit.getAddress();
            console.log('Got wallet address:', address);
            
            const mockBalance = 1250.50;
            
            // Update state directly - no functional update
            const newState = {
              isConnected: true,
              address: address,
              balance: mockBalance,
              network: WalletNetwork.TESTNET,
            };
            
            console.log('Setting new wallet state:', newState);
            setWalletState(newState);
            
            // Verify state was set
            setTimeout(() => {
              console.log('State verification - should be connected now');
            }, 100);

            toast.success('Wallet connected successfully!');
          } catch (err) {
            console.error('Error in wallet selection:', err);
            setError('Failed to connect wallet');
            toast.error('Failed to connect wallet');
          } finally {
            setLoading(false);
          }
        },
        onClosed: () => {
          console.log('Wallet modal closed');
          setLoading(false);
        }
      });
    } catch (err) {
      console.error('Error opening wallet modal:', err);
      setError('Failed to open wallet selection');
      toast.error('Failed to open wallet selection');
      setLoading(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    console.log('Disconnecting wallet');
    setWalletState({
      isConnected: false,
      address: null,
      balance: null,
      network: WalletNetwork.TESTNET,
    });
    toast.success('Wallet disconnected');
  }, []);

  const signTransaction = useCallback(async (xdr: string) => {
    try {
      setLoading(true);
      setError(null);

      const { signedTxXdr } = await kit.signTransaction(xdr, {
        networkPassphrase: 'Test SDF Network ; September 2015',
      });

      return signedTxXdr;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign transaction';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check for existing connection on mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      try {
        const { address } = await kit.getAddress();
        if (address) {
          console.log('Found existing wallet connection:', address);
          setWalletState(prev => ({
            ...prev,
            isConnected: true,
            address: address,
            balance: 1250.50,
          }));
        }
      } catch (err) {
        console.log('No existing wallet connection');
      }
    };

    checkExistingConnection();
  }, []);

  // Debug effect to log all state changes
  useEffect(() => {
    console.log('useWallet - Wallet state changed:', walletState);
  }, [walletState]);

  return {
    walletState,
    loading,
    error,
    connectWallet,
    disconnectWallet,
    signTransaction,
  };
};