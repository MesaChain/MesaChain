'use client';

import { useState, useRef } from 'react';
import { Table, TableStatus } from '@/types/tableLayout';
import { getTableScale } from './tableConfig';
import { Utensils } from 'lucide-react';

interface TableComponentProps {
  table: Table;
  isSelected: boolean;
  onClick: () => void;
  isDragging?: boolean;
  onDragStart?: (e: React.MouseEvent) => void;
}

const getStatusColor = (status: TableStatus) => {
  switch (status) {
    case 'available':
      return 'bg-green-500';
    case 'reserved':
      return 'bg-yellow-500';
    case 'occupied':
      return 'bg-red-500';
    case 'out-of-service':
      return 'bg-gray-500';
    default:
      return 'bg-gray-400';
  }
};

const getStatusText = (status: TableStatus) => {
  switch (status) {
    case 'available':
      return 'Available';
    case 'reserved':
      return 'Reserved';
    case 'occupied':
      return 'Occupied';
    case 'out-of-service':
      return 'Out of Service';
    default:
      return 'Unknown';
  }
};

export function TableComponent({ table, isSelected, onClick, isDragging = false, onDragStart }: TableComponentProps) {
  if (!table.isVisible) {
    return null;
  }
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const [dragStarted, setDragStarted] = useState(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const statusColor = getStatusColor(table.status);
  const statusText = getStatusText(table.status);

  const handleMouseEnter = () => {
    if (!isDragging) {
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setHasMoved(false);
    setDragStarted(false);
    startPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (startPosRef.current) {
      const deltaX = Math.abs(e.clientX - startPosRef.current.x);
      const deltaY = Math.abs(e.clientY - startPosRef.current.y);
      
      if (deltaX > 5 || deltaY > 5) {
        setHasMoved(true);
        
        if (!dragStarted && onDragStart) {
          setDragStarted(true);
          onDragStart(e);
        }
      }
    }
  };

  const handleMouseUp = () => {
    if (!hasMoved && !isDragging) {
      onClick();
    }
    startPosRef.current = null;
    setDragStarted(false);
  };

  const { visual: visualScale, counter: counterScale } = getTableScale(table.capacity, table.shape);

  return (
    <div
      className={`relative w-full h-full cursor-move transition-all duration-200 ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2 z-10' : 'hover:ring-1 hover:ring-gray-300'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div
        className={`w-full h-full flex flex-col items-center justify-center ${
          table.shape === 'round' ? 'rounded-full' : 'rounded-lg'
        } ${statusColor} text-white shadow-lg hover:shadow-xl transition-shadow duration-200`}
        style={{
          transform: `scale(${visualScale})`,
          transformOrigin: 'center',
        }}
      >
        <div className="text-center" style={{
          transform: `scale(${counterScale})`,
          transformOrigin: 'center',
        }}>
          <div className="mb-1">
            <Utensils className="w-6 h-6 mx-auto" style={{
              filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.5))'
            }} />
          </div>
          <div className="text-[11px] font-medium text-white" style={{
            textShadow: `
              -0.5px -0.5px 0 #000,
              0.5px -0.5px 0 #000,
              -0.5px 0.5px 0 #000,
              0.5px 0.5px 0 #000
            `
          }}>
            {table.capacity} Seats
          </div>
        </div>
      </div>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-md shadow-lg z-50 whitespace-nowrap">
          <div className="font-medium">{table.name}</div>
          <div className="text-gray-300">{statusText}</div>
          {table.bookings && table.bookings.length > 0 && (
            <div className="text-blue-300">
              {table.bookings.length} Booking{table.bookings.length > 1 ? 's' : ''}
            </div>
          )}
          {table.orders && table.orders.length > 0 && (
            <div className="text-purple-300">
              {table.orders.length} Order{table.orders.length > 1 ? 's' : ''}
            </div>
          )}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
} 