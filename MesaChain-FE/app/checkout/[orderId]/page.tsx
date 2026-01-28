'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useOrder } from '@/hooks/useOrder';
import { useWallet } from '@/hooks/useWallet';
import { usePaymentIntent } from '@/hooks/usePaymentIntent';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { WalletConnection } from '@/components/checkout/WalletConnection';
import { TipSelector } from '@/components/checkout/TipSelector';
import { BillSplitter, PayerSplit } from '@/components/checkout/BillSplitter';
import { PaymentStatus } from '@/components/checkout/PaymentStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    ArrowLeft,
    CreditCard,
    Users,
    Receipt,
    AlertCircle,
    Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { convertUSDToXLM } from '@/lib/stellar';

export default function Checkout() {
    const params = useParams();
    const router = useRouter();
    const orderId = params?.orderId as string;

    const { order, loading: orderLoading, error: orderError } = useOrder(orderId || null);
    const { intent, createPaymentIntent, processPayment, loading: paymentLoading } = usePaymentIntent();

    const [currentStep, setCurrentStep] = useState(0);
    const walletHook = useWallet();
    const { walletState, loading: walletLoading, connectWallet, disconnectWallet, signTransaction } = walletHook;
    const [tipAmount, setTipAmount] = useState(0);
    const [_tipPercentage, setTipPercentage] = useState(18);
    const [billSplits, setBillSplits] = useState<PayerSplit[]>([]);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [stepTransitionComplete, setStepTransitionComplete] = useState(false);


    // Test effect to monitor wallet state directly
    useEffect(() => {
    }, [walletState]);

    const steps = [
        { id: 0, label: 'Review Order', icon: Receipt },
        { id: 1, label: 'Connect Wallet', icon: CreditCard },
        { id: 2, label: 'Add Tip & Split', icon: Users },
        { id: 3, label: 'Pay & Confirm', icon: CreditCard },
    ];

    const totalAmount = order ? order.total + tipAmount : 0;
    const myAmount = billSplits.length > 0
        ? billSplits.find(split => split.id === 'payer-1')?.amount || totalAmount
        : totalAmount;

    // Initialize tip amount when order loads
    useEffect(() => {
        if (order) {
            const defaultTip = (order.subtotal * 18) / 100;
            setTipAmount(defaultTip);
            console.log('Order loaded, default tip set to:', defaultTip);
        }
    }, [order]);

    // Handle wallet connection state changes - simplified
    useEffect(() => {
        if (currentStep === 1 && walletState.isConnected && walletState.address && !stepTransitionComplete) {
            setStepTransitionComplete(true);

            setTimeout(() => {
                setCurrentStep(2);
                toast.success('Wallet connected! Proceeding to tip & split...');
                setStepTransitionComplete(false);
            }, 1000);
        }
    }, [walletState.isConnected, walletState.address, currentStep, stepTransitionComplete]);

    useEffect(() => {
        setStepTransitionComplete(false);
    }, [currentStep]);

    // Wallet connection handler - this can be used as backup or for manual triggering
    const handleWalletConnected = useCallback(() => {
        if (currentStep === 1 && !stepTransitionComplete) {
            setStepTransitionComplete(true);
            setTimeout(() => {
                setCurrentStep(2);
                toast.success('Wallet connected! Proceeding to tip & split...');
                setTimeout(() => setStepTransitionComplete(false), 1000);
            }, 500);
        }
    }, [currentStep, stepTransitionComplete]);

    const handleTipChange = useCallback((amount: number, percentage: number) => {
        setTipAmount(amount);
        setTipPercentage(percentage);
    }, []);

    const handleSplitChange = useCallback((splits: PayerSplit[]) => {
        setBillSplits(splits);
    }, []);

    const handlePayment = async () => {
        if (!order || !walletState.isConnected || !walletState.address) {
            console.log('Payment conditions not met:', {
                hasOrder: !!order,
                isConnected: walletState.isConnected,
                hasAddress: !!walletState.address
            });
            toast.error('Please ensure your wallet is connected');
            return;
        }

        try {
            setProcessingPayment(true);

            // Step 1: Create payment intent
            await createPaymentIntent(order.id, myAmount);

            await processPayment(walletState.address, signTransaction);
            setCurrentStep(3);
            toast.success('Payment completed successfully!');

        } catch (error) {
            console.error('Payment failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Payment failed. Please try again.';

            // Show more specific error messages
            if (errorMessage.includes('User rejected')) {
                toast.error('Payment cancelled by user');
            } else if (errorMessage.includes('insufficient')) {
                toast.error('Insufficient balance in wallet');
            } else if (errorMessage.includes('network')) {
                toast.error('Network error. Please try again.');
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setProcessingPayment(false);
        }
    };

    const handlePaymentRetry = async () => {
        console.log('Retrying payment...');
        await handlePayment();
    };

    const handleStepNavigation = useCallback((step: number) => {
        console.log('Manual step navigation to:', step);
        setCurrentStep(step);
    }, []);

    // Loading state
    if (orderLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto" />
                    <p className="text-muted-foreground">Loading your order...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (orderError || !order) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6 text-center space-y-4">
                        <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
                        <h2 className="text-xl font-semibold">Order Not Found</h2>
                        <p className="text-muted-foreground">
                            {orderError || 'The order you\'re looking for doesn\'t exist or has expired.'}
                        </p>
                        <Button onClick={() => router.push('/')} variant="outline">
                            <ArrowLeft className="w-4 h-4" />
                            Go Back
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-500/5">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" onClick={() => router.push('/')}>
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold gradient-text">
                            Crypto Checkout
                        </h1>
                        <p className="text-muted-foreground">
                            Table {order.tableNumber} • Order #{order.id.split('-').pop()}
                        </p>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center space-x-4">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = currentStep === step.id;
                            const isCompleted = currentStep > step.id;

                            return (
                                <div key={step.id} className="flex items-center">
                                    <div
                                        className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 cursor-pointer
                      ${isActive
                                                ? 'border-purple-500 bg-purple-500 text-white scale-110'
                                                : isCompleted
                                                    ? 'border-success bg-success text-white'
                                                    : 'border-muted bg-background text-muted-foreground hover:border-purple-500/50'
                                            }
                    `}
                                        onClick={() => {
                                            // Allow navigation to completed steps or current step
                                            if (isCompleted || isActive) {
                                                handleStepNavigation(step.id);
                                            }
                                        }}
                                    >
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className={`
                      w-16 h-0.5 mx-2 transition-all duration-300
                      ${isCompleted ? 'bg-success' : 'bg-muted'}
                    `} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

              

                {/* Main Content */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column - Order Summary (Always Visible) */}
                    <div className="space-y-6">
                        <OrderSummary order={order} />

                        {/* Current split info */}
                        {billSplits.length > 0 && (
                            <Card className="card-gradient">
                                <CardContent className="pt-6">
                                    <h3 className="font-semibold mb-3">Your Payment</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Your share (USD)</span>
                                            <span>${myAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-purple-500 font-medium">
                                            <span>XLM equivalent</span>
                                            <span>{intent?.xlmAmount || '0'} XLM</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-muted-foreground">
                                            <span>Network fee</span>
                                            <span>0.01 XLM</span>
                                        </div>
                                        <div className="flex justify-between font-semibold border-t pt-2">
                                            <span>Total to pay</span>
                                            <span className="gradient-text">
                                                {intent?.xlmAmount || convertUSDToXLM(myAmount)} XLM
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Current Step */}
                    <div className="space-y-6">
                        {currentStep === 0 && (
                            <Card className="card-gradient">
                                <CardContent className="pt-6 text-center space-y-4">
                                    <Receipt className="w-12 h-12 text-purple-500 mx-auto" />
                                    <h2 className="text-xl font-semibold">Review Your Order</h2>
                                    <p className="text-muted-foreground">
                                        Please review your order details before proceeding to payment.
                                    </p>
                                    <Button
                                        variant="default"
                                        onClick={() => handleStepNavigation(1)}
                                        className="w-full bg-purple-500 hover:bg-purple-600"
                                    >
                                        Continue to Payment
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {currentStep === 1 && (
                            <WalletConnection
                                walletState={walletState}
                                loading={walletLoading}
                                connectWallet={connectWallet}
                                disconnectWallet={disconnectWallet}
                                onConnected={handleWalletConnected}
                            />
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <TipSelector
                                    subtotal={order.subtotal}
                                    onTipChange={handleTipChange}
                                />

                                <BillSplitter
                                    order={order}
                                    tipAmount={tipAmount}
                                    onSplitChange={handleSplitChange}
                                />

                                <Button
                                    variant="default"
                                    onClick={handlePayment}
                                    disabled={processingPayment || !walletState.isConnected || paymentLoading}
                                    className="w-full h-12 bg-purple-500 hover:bg-purple-600"
                                >
                                    {processingPayment || paymentLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            Processing XLM Payment...
                                        </>
                                    ) : !walletState.isConnected ? (
                                        'Connect Wallet First'
                                    ) : (
                                        <>
                                            Pay {intent?.xlmAmount || convertUSDToXLM(myAmount)} XLM
                                            <span className="text-xs ml-2 opacity-70">
                                                (~${myAmount.toFixed(2)})
                                            </span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}

                        {currentStep === 3 && intent && (
                            <PaymentStatus
                                intent={intent}
                                onRetry={handlePaymentRetry}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
