import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface QRCodeGeneratorProps {
  orderId: string;
  tableNumber: number;
  onScan?: () => void;
}

export const QRCodeGenerator = ({ orderId, tableNumber }: QRCodeGeneratorProps) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const generateQR = async () => {
    try {
      setLoading(true);
      const checkoutUrl = `${window.location.origin}/checkout/${orderId}`;
      const dataUrl = await QRCode.toDataURL(checkoutUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1e293b',
          light: '#ffffff',
        },
      });
      setQrDataUrl(dataUrl);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateQR();
  }, [orderId]);

  return (
    <Card className="w-full max-w-md mx-auto card-gradient">
      <CardHeader className="text-center">
        <CardTitle className="gradient-text text-2xl">
          Table {tableNumber} Checkout
        </CardTitle>
        <p className="text-muted-foreground">
          Scan with your phone to pay with crypto
        </p>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6">
        <div className="p-4 bg-white rounded-xl shadow-card">
          {loading ? (
            <div className="w-64 h-64 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <img 
              src={qrDataUrl} 
              alt="QR Code for checkout" 
              className="w-64 h-64"
            />
          )}
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Order ID: <span className="font-mono font-medium">{orderId}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};