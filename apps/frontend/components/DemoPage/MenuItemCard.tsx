
// components/MenuItemCard.tsx
import Image from 'next/image';
import { useState } from 'react';
import { MenuItem, OrderItem } from '../../types/index';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToOrder: (item: OrderItem) => void;
}

export default function MenuItemCard({ item, onAddToOrder }: MenuItemCardProps) {
  const [quantity, setQuantity] = useState(1);
  
  const handleAddToOrder = () => {
    onAddToOrder({
      ...item,
      quantity,
    });
    setQuantity(1); 
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm h-64 flex flex-col">
      <div className="mb-2 text-center text-gray-600 text-sm">{item.category}</div>
      
      {/* Fixed height image container */}
      <div className="h-32 flex items-center justify-center mb-2">
        {item.image ? (
          <div className="relative w-full h-full flex justify-center">
            <Image 
              src={item.image} 
              alt={item.name} 
              width={100} 
              height={100}
              className="rounded-lg object-contain"
              style={{ maxHeight: "100%" }}
            />
          </div>
        ) : (
          <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>
      
      {/* Card content with flex-grow to push the button to the bottom */}
      <div className="flex-grow">
        <h3 className="font-medium truncate">{item.name}</h3>
        <div className="text-purple-600 font-medium mt-1">$ {item.price.toFixed(2)}</div>
      </div>
      
      <button 
        onClick={handleAddToOrder}
        className="mt-auto w-full py-2 bg-purple-600 text-white rounded-lg"
      >
        Add to Order
      </button>
    </div>
  );
}