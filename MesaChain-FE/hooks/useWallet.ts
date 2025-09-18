import { useState, useCallback, useEffect } from 'react';
import { StellarWalletsKit, WalletNetwork, allowAllModules } from '@creit.tech/stellar-wallets-kit';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: number | null;
  network: WalletNetwork;
}

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    network: WalletNetwork.TESTNET,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const kit = new StellarWalletsKit({
    network: WalletNetwork.TESTNET,
    selectedWalletId: 'freighter',
    modules: allowAllModules(),
  });

  const connectWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      await kit.openModal({
        onWalletSelected: async (option) => {
          kit.setWallet(option.id);
          const { address } = await kit.getAddress();
          
          // Simulate balance fetch
          const mockBalance = 1250.50; // Mock USDC balance
          
          setWalletState({
            isConnected: true,
            address: address,
            balance: mockBalance,
            network: WalletNetwork.TESTNET,
          });
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  }, [kit]);

  const disconnectWallet = useCallback(() => {
    setWalletState({
      isConnected: false,
      address: null,
      balance: null,
      network: WalletNetwork.TESTNET,
    });
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
      setError(err instanceof Error ? err.message : 'Failed to sign transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [kit]);

  // Check for existing wallet connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { address } = await kit.getAddress();
        if (address) {
          setWalletState(prev => ({
            ...prev,
            isConnected: true,
            address: address,
            balance: 1250.50, // Mock balance
          }));
        }
      } catch {
        // No existing connection
      }
    };

    checkConnection();
  }, [kit]);

  return {
    walletState,
    loading,
    error,
    connectWallet,
    disconnectWallet,
    signTransaction,
  };
};