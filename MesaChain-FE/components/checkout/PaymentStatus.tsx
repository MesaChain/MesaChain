import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ExternalLink,
  Download,
  Share2,
  AlertTriangle,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';

interface PaymentIntent {
  id: string;
  amount: number;
  xlmAmount: string;
  status: string;
  expiresAt: Date;
  stellarAddress?: string;
  destinationAddress?: string;
  transactionHash?: string;
}

interface PaymentStatusProps {
  intent: PaymentIntent;
  onRetry?: () => void;
}

export const PaymentStatus = ({ intent, onRetry }: PaymentStatusProps) => {
  const [timeLeft, setTimeLeft] = useState(0);
  // const { toast } = useToast();
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [failureModalOpen, setFailureModalOpen] = useState(false);

  // Show modals based on status
  useEffect(() => {
    const currentStatus = intent.status;
    if (currentStatus === 'confirmed') {
      setSuccessModalOpen(true);
    } else if (currentStatus === 'failed') {
      setFailureModalOpen(true);
    }
  }, [intent.status]);

  // Countdown timer for pending payments
  useEffect(() => {
    if (intent.status === 'pending' || intent.status === 'processing') {
      const timer = setInterval(() => {
        const remaining = Math.max(0, intent.expiresAt.getTime() - Date.now());
        setTimeLeft(remaining);

        if (remaining === 0) {
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [intent.status, intent.expiresAt]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast("Copied!", {
      description: `${label} copied to clipboard`,
    });
  };

  const getStatusConfig = () => {
    const currentStatus = intent.status;

    switch (currentStatus) {
      case 'pending':
        return {
          icon: <Clock className="w-6 h-6 text-warning" />,
          title: 'Waiting for Payment',
          description: 'Please confirm the transaction in your wallet',
          color: 'warning',
          progress: 25,
        };
      case 'processing':
        return {
          icon: <Loader2 className="w-6 h-6 text-primary animate-spin" />,
          title: 'Processing Payment',
          description: 'Transaction submitted to Stellar network',
          color: 'primary',
          progress: 75,
        };
      case 'confirmed':
        return {
          icon: <CheckCircle className="w-6 h-6 text-success" />,
          title: 'Payment Confirmed',
          description: 'Your XLM payment has been successfully processed',
          color: 'success',
          progress: 100,
        };
      case 'failed':
        return {
          icon: <XCircle className="w-6 h-6 text-destructive" />,
          title: 'Payment Failed',
          description: 'There was an issue processing your XLM payment',
          color: 'destructive',
          progress: 0,
        };
      default:
        return {
          icon: <Clock className="w-6 h-6 text-muted-foreground" />,
          title: 'Initializing',
          description: 'Setting up XLM payment...',
          color: 'muted',
          progress: 10,
        };
    }
  };

  const statusConfig = getStatusConfig();
  const currentStatus = intent.status;

  return (
    <div className="space-y-4">
      <Card className="w-full card-gradient">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {statusConfig.icon}
              {statusConfig.title}
            </CardTitle>
            <Badge variant="outline" className={`border-${statusConfig.color} text-${statusConfig.color}`}>
              {currentStatus.toUpperCase()}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {statusConfig.description}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress bar */}
          <div className="space-y-2">
            <Progress value={statusConfig.progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {statusConfig.progress}% Complete
            </p>
          </div>

          {/* Payment details */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span>Amount (USD)</span>
              <span className="font-semibold">${intent.amount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span>XLM Amount</span>
              <span className="font-semibold text-primary">{intent.xlmAmount} XLM</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span>Network Fee</span>
              <span className="text-muted-foreground">0.01 XLM</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span>Payment ID</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs">
                  {intent.id.slice(0, 8)}...{intent.id.slice(-8)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(intent.id, 'Payment ID')}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {intent.stellarAddress && (
              <div className="flex justify-between items-center text-sm">
                <span>From Wallet</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs">
                    {intent.stellarAddress.slice(0, 6)}...{intent.stellarAddress.slice(-6)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(intent.stellarAddress!, 'Wallet Address')}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}

            {intent.destinationAddress && (
              <div className="flex justify-between items-center text-sm">
                <span>To Restaurant</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs">
                    {intent.destinationAddress.slice(0, 6)}...{intent.destinationAddress.slice(-6)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(intent.destinationAddress!, 'Restaurant Address')}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}

            {intent.transactionHash && (
              <div className="flex justify-between items-center text-sm">
                <span>Transaction</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="link"
                    size="sm"
                    asChild
                    className="h-auto p-0 text-xs"
                  >
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${intent.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      View on Stellar Expert (Testnet)
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(intent.transactionHash!, 'Transaction Hash')}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Status-specific information */}
          {currentStatus === 'pending' && timeLeft > 0 && (
            <div className="text-center bg-warning/10 rounded-lg p-3 border border-warning/20">
              <div className="flex items-center justify-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <p className="text-sm font-medium text-warning">
                  Time remaining: {formatTime(timeLeft)}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Payment will expire if not completed
              </p>
            </div>
          )}

          {currentStatus === 'processing' && (
            <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm font-medium text-primary">
                  Confirming on Stellar Testnet
                </span>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                This usually takes 5-10 seconds
              </p>
            </div>
          )}

          {currentStatus === 'failed' && (
            <div className="bg-destructive/10 rounded-lg p-3 border border-destructive/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">
                  XLM Payment Failed
                </span>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Please check your XLM balance and try again
              </p>
            </div>
          )}

          {/* Connection status */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-success" />
            Connected to Stellar testnet
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            {currentStatus === 'failed' && onRetry && (
              <Button variant="default" onClick={onRetry} className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry XLM Payment
              </Button>
            )}

            {currentStatus === 'confirmed' && (
              <>
                <Button variant="secondary" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipt
                </Button>
                <Button variant="outline">
                  <Share2 className="w-4 h-4" />
                </Button>
              </>
            )}

            {(currentStatus === 'pending' || currentStatus === 'processing') && (
              <Button variant="outline" className="w-full" disabled>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing XLM Payment...
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Success Modal */}
      <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <DialogTitle className="text-xl font-semibold text-success text-center">
              XLM Payment Successful!
            </DialogTitle>
            <DialogDescription className="text-center">
              Your payment of {intent.xlmAmount} XLM has been confirmed on Stellar explorer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-center space-y-2">
                <p className="font-semibold">${intent.amount.toFixed(2)} USD</p>
                <p className="text-sm text-muted-foreground">≈ {intent.xlmAmount} XLM</p>
              </div>
            </div>

            {intent.transactionHash && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-2">Transaction ID:</p>
                <div className="flex items-center gap-2 bg-muted rounded p-2">
                  <code className="text-xs flex-1 break-all">
                    {intent.transactionHash}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(intent.transactionHash!, 'Transaction Hash')}
                    className="h-6 w-6 p-0 shrink-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                asChild
              >
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${intent.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on Explorer
                </a>
              </Button>
              <Button
                variant="default"
                className="flex-1"
                onClick={() => setSuccessModalOpen(false)}
              >
                Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Failure Modal */}
      <Dialog open={failureModalOpen} onOpenChange={setFailureModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <DialogTitle className="text-xl font-semibold text-destructive">
              XLM Payment Failed
            </DialogTitle>
            <DialogDescription className="text-center">
              There was an issue processing your payment. Please try again.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2 text-sm">Common issues:</h4>
              <ul className="text-muted-foreground space-y-1 text-xs">
                <li>• Insufficient XLM balance in wallet</li>
                <li>• Wallet not funded on Stellar testnet</li>
                <li>• Network connectivity issues</li>
                <li>• Transaction rejected by wallet</li>
              </ul>
              <p className="text-xs mt-2 text-blue-600">
                💡 Need testnet XLM? Visit{' '}
                <a
                  href="https://laboratory.stellar.org/#account-creator?network=test"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Stellar Laboratory
                </a>
                {' '}to fund your testnet account.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setFailureModalOpen(false)}
              >
                Cancel
              </Button>
              {onRetry && (
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={() => {
                    setFailureModalOpen(false);
                    onRetry();
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Payment
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};