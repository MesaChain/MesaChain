'use client';

import { Table, TableStatus } from '@/types/tableLayout';

interface TableComponentProps {
  table: Table;
  isSelected: boolean;
  onClick: () => void;
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

export function TableComponent({ table, isSelected, onClick }: TableComponentProps) {
  const statusColor = getStatusColor(table.status);
  const statusText = getStatusText(table.status);

  return (
    <div
      className={`relative w-full h-full cursor-move transition-all duration-200 ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2 z-10' : 'hover:ring-1 hover:ring-gray-300'
      }`}
      onClick={onClick}
    >
      {/* Table Shape */}
      <div
        className={`w-full h-full flex flex-col items-center justify-center ${
          table.shape === 'round' ? 'rounded-full' : 'rounded-lg'
        } ${statusColor} text-white shadow-lg hover:shadow-xl transition-shadow duration-200`}
      >
        {/* Table Icon with fork and knife */}
        <div className="text-center">
          <div className="mb-1">
            <svg className="w-6 h-6 mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
            </svg>
          </div>
          <div className="text-sm font-medium">{table.capacity} Seats</div>
          <div className="text-xs opacity-90">{table.name}</div>
        </div>

        {/* Status Badge */}
        <div className="absolute top-1 right-1">
          <div className="bg-white text-gray-800 text-xs px-2 py-1 rounded-full font-medium shadow-sm">
            {statusText}
          </div>
        </div>

        {/* Booking/Order Indicators */}
        {table.bookings && table.bookings.length > 0 && (
          <div className="absolute bottom-1 left-1">
            <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-sm">
              {table.bookings.length} Booking{table.bookings.length > 1 ? 's' : ''}
            </div>
          </div>
        )}

        {table.orders && table.orders.length > 0 && (
          <div className="absolute bottom-1 right-1">
            <div className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full shadow-sm">
              {table.orders.length} Order{table.orders.length > 1 ? 's' : ''}
            </div>
          </div>
        )}

        {/* Drag indicator */}
        <div className="absolute top-1 left-1 opacity-50">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
          </svg>
        </div>
      </div>
    </div>
  );
} 