"use client"
import { QRCodeGenerator } from '@/components/checkout/QRCodeGenerator';

const Index = () => {
    return (
        <div className="min-h-screen bg-background p-4 flex items-center">
            <div className="container mx-auto max-w-4xl">
                <div className="">
                    <div className="space-y-6">
                        <QRCodeGenerator
                            orderId="order_123456"
                            tableNumber={12}
                        />

                        <div className="text-center space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Or access directly:
                            </p>
                            <a
                                href={`/checkout/order_123456`}
                                className="inline-block px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
                            >
                                Open Checkout
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Index;