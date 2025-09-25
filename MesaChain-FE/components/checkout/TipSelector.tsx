import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TipSelectorProps {
  subtotal: number;
  onTipChange: (tipAmount: number, tipPercentage: number) => void;
}

const PRESET_TIPS = [
  { label: 'No Tip', percentage: 0 },
  { label: '15%', percentage: 15 },
  { label: '18%', percentage: 18 },
  { label: '20%', percentage: 20 },
  { label: '25%', percentage: 25 },
];

export const TipSelector = ({ subtotal, onTipChange }: TipSelectorProps) => {
  const [selectedTip, setSelectedTip] = useState(18); // Default 18%
  const [customTip, setCustomTip] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const handlePresetTip = (percentage: number) => {
    setSelectedTip(percentage);
    setIsCustom(false);
    setCustomTip('');
    const tipAmount = (subtotal * percentage) / 100;
    onTipChange(tipAmount, percentage);
  };

  const handleCustomTip = (value: string) => {
    setCustomTip(value);
    setIsCustom(true);
    const amount = parseFloat(value) || 0;
    const percentage = (amount / subtotal) * 100;
    onTipChange(amount, percentage);
  };

  const currentTipAmount = isCustom 
    ? parseFloat(customTip) || 0 
    : (subtotal * selectedTip) / 100;

  return (
    <Card className="w-full card-gradient">
      <CardHeader>
        <CardTitle className="text-lg">Add Tip</CardTitle>
        <p className="text-sm text-muted-foreground">
          Show appreciation for great service
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Preset tip buttons */}
        <div className="grid grid-cols-3 gap-2">
          {PRESET_TIPS.map((tip) => (
            <Button
              key={tip.percentage}
              variant={!isCustom && selectedTip === tip.percentage ? "default" : "secondary"}
              size="sm"
              onClick={() => handlePresetTip(tip.percentage)}
              className={`h-12 flex flex-col`}
            >
              <span className="font-semibold">{tip.label}</span>
              {tip.percentage > 0 && (
                <span className="text-xs opacity-75">
                  ${((subtotal * tip.percentage) / 100).toFixed(2)}
                </span>
              )}
            </Button>
          ))}
          
          {/* Custom tip button */}
          <Button
            variant={isCustom ? "default" : "secondary"}
            size="sm"
            onClick={() => setIsCustom(true)}
            className="h-12"
          >
            Custom
          </Button>
        </div>

        {/* Custom tip input */}
        {isCustom && (
          <div className="space-y-2">
            <Label htmlFor="custom-tip">Custom Tip Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="custom-tip"
                type="number"
                placeholder="0.00"
                value={customTip}
                onChange={(e) => handleCustomTip(e.target.value)}
                className="pl-8"
                step="0.01"
                min="0"
              />
            </div>
          </div>
        )}

        {/* Tip summary */}
        <div className="bg-primary/5 rounded-lg p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>
              Tip {isCustom 
                ? `($${customTip || '0.00'})` 
                : `(${selectedTip}%)`
              }
            </span>
            <span>${currentTipAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold border-t border-border/50 pt-2">
            <span>Total with Tip</span>
            <span className="gradient-text">
              ${(subtotal + currentTipAmount).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Tip impact message */}
        {selectedTip > 0 || currentTipAmount > 0 ? (
          <div className="text-center p-3 bg-success/10 rounded-lg border border-success/20">
            <p className="text-sm text-success font-medium">
              Thank you for supporting our team! 
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};