import { useState } from 'react';

interface CalculatorProps {
  onValueEntered: (value: number) => void;
  label?: string; 
  initialValue?: string;
}

export default function Calculator({ 
  onValueEntered, 
  label = "Enter Amount", 
  initialValue = ""
}: CalculatorProps) {
  const [displayValue, setDisplayValue] = useState(initialValue);
  
  const handleNumberPress = (num: number | string) => {
    
    if (num === '.' && displayValue.includes('.')) return;
    
    
    if (displayValue.includes('.') && displayValue.split('.')[1]?.length >= 2 && num !== 'C') return;
    
    // Handle clearing
    if (num === 'C') {
      setDisplayValue('');
      return;
    }
    
    const newValue = displayValue + num;
    setDisplayValue(newValue);
  };
  
  const handleSubmit = () => {
    const numericValue = parseFloat(displayValue || '0');
    onValueEntered(numericValue);
    setDisplayValue('');
  };

  const buttons = [
    '1', '2', '3', '4',
    '5', '6', '7', '8',
    '9', '0', '.', 'C'
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="mb-2 text-gray-600">{label}</h3>
      
      <div className="bg-gray-100 p-3 rounded-md text-right text-2xl mb-4">
        {displayValue || '0'}
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {buttons.map((btn) => (
          <button 
            key={btn}
            onClick={() => handleNumberPress(btn)}
            className={`py-3 rounded-md text-lg font-medium 
              ${btn === 'C' ? 'bg-red-100 text-red-600' : 'bg-gray-100'}`}
          >
            {btn}
          </button>
        ))}
        <button 
          onClick={handleSubmit}
          className="col-span-4 bg-purple-600 text-white py-3 rounded-md text-lg mt-2"
        >
          Enter
        </button>
      </div>
    </div>
  );
}

