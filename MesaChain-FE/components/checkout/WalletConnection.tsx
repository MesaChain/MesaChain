// components/checkout/WalletConnection.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet, CheckCircle, Copy, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface WalletConnectionProps {
  walletState: any;
  loading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  onConnected?: (address: string) => void;
}

export const WalletConnection = ({ walletState, loading, connectWallet, disconnectWallet, onConnected }: WalletConnectionProps) => {
  const [copied, setCopied] = useState(false);
  const [isAutoProceeding, setIsAutoProceeding] = useState(false);

  useEffect(() => {
    if (walletState.isConnected && walletState.address && onConnected && !isAutoProceeding) {
      setIsAutoProceeding(true);
      const timer = setTimeout(() => {
        onConnected(walletState.address!);
        setIsAutoProceeding(false);
      }, 500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [walletState.isConnected, walletState.address, onConnected, isAutoProceeding]);

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const copyAddress = async () => {
    if (walletState.address) {
      await navigator.clipboard.writeText(walletState.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Address copied to clipboard');
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  if (walletState.isConnected) {
    return (
      <Card className="w-full card-gradient border-success/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success" />
            <CardTitle className="text-lg text-success">Wallet Connected</CardTitle>
          </div>
          {isAutoProceeding && (
            <p className="text-sm text-success animate-pulse">
              Wallet connected! Proceeding to next step...
            </p>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-success/10 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Address</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAddress}
                  className="h-8 px-2"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="h-8 px-2"
                >
                  <a 
                    href={`https://stellar.expert/explorer/testnet/account/${walletState.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>
            <p className="font-mono text-sm bg-background/50 rounded px-2 py-1">
              {formatAddress(walletState.address!)}
            </p>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">USDC Balance</span>
              <span className="font-semibold text-lg">
                ${walletState.balance?.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Show continue button if auto-proceed fails or is slow */}
          {!isAutoProceeding && (
            <Button 
              variant="default" 
              onClick={() => onConnected?.(walletState.address!)}
              className="w-full"
              disabled={!walletState.isConnected}
            >
              Continue to Tip & Split
            </Button>
          )}

          <Button 
            variant="outline" 
            onClick={disconnectWallet}
            className="w-full"
          >
            Disconnect Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full card-gradient">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Connect Wallet
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Connect your Stellar wallet to pay with USDC
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Optionally show error if passed as prop */}

        <Button 
          variant="default" 
          onClick={handleConnect}
          disabled={loading}
          className="w-full h-12 bg-purple-500 hover:bg-purple-600"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4 mr-2" />
              Choose Stellar Wallet
            </>
          )}
        </Button>

        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            Supports Freighter, Albedo, WalletConnect & more
          </p>
        </div>
      </CardContent>
    </Card>
  );
};