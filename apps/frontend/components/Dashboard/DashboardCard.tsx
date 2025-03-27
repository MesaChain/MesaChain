"use client";
import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string;
  percentageChange: string;
  icon: string; // URL del icono
  color: string; // Color para la barra de progreso
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, percentageChange, icon, color }) => {
  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{title}</h2>
        <img src={icon} alt={title} className="h-8 w-8" />
      </div>
      <p className="text-3xl font-bold mt-3">{value}</p>
      <p className="text-gray-500">{percentageChange}</p>
      <div className="h-2 bg-gray-200 rounded mt-4">
        <div className={`h-full ${color}`} style={{ width: Math.min(parseFloat(percentageChange.replace(/[^0-9]/g, '')), 100) + '%' }}></div>
      </div>
    </div>
  );
};

export default DashboardCard;
