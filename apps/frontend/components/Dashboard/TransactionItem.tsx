"use client";
import React from 'react';

interface TransactionItemProps {
  table: string;
  time: string;
  amount: string;
  paymentMethod: string;
  icon: string; // URL del icono
}

const TransactionItem: React.FC<TransactionItemProps> = ({ table, time, amount, paymentMethod, icon }) => {
  return (
    <li className="flex justify-between items-center bg-white p-4">
      <div className="flex items-center justify-center w-10 h-10 bg-green-300 rounded-full mr-2">
        <img src={icon} alt="Order" className="h-6 w-6" />
      </div>
      <div className="flex flex-col flex-1">
        <span>{table}</span>
        <span className="text-gray-500">{time}</span>
      </div>
      <span className="flex flex-col text-black">
        <span>{amount}</span>
        <span className="text-green-600 text-sm text-right">{paymentMethod}</span>
      </span>
    </li>
  );
};

export default TransactionItem;
