"use client";
import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Define interface for data structure
interface RevenueData {
  date: string;
  revenue: number;
}

interface MockDataType {
  '7d': RevenueData[];
  '30d': RevenueData[];
  'all': RevenueData[];
}

// Mock data for different time ranges
const mockData: MockDataType = {
  '7d': [
    { date: '12/16', revenue: 1200 },
    { date: '12/17', revenue: 1800 },
    { date: '12/18', revenue: 1500 },
    { date: '12/19', revenue: 2200 },
    { date: '12/20', revenue: 2800 },
    { date: '12/21', revenue: 3200 },
    { date: '12/22', revenue: 2400 },
  ],
  '30d': [
    { date: '11/25', revenue: 8500 },
    { date: '12/02', revenue: 9200 },
    { date: '12/09', revenue: 7800 },
    { date: '12/16', revenue: 10500 },
  ],
  'all': [
    { date: 'Jan', revenue: 25000 },
    { date: 'Feb', revenue: 28000 },
    { date: 'Mar', revenue: 32000 },
    { date: 'Apr', revenue: 29000 },
    { date: 'May', revenue: 35000 },
    { date: 'Jun', revenue: 38000 },
    { date: 'Jul', revenue: 42000 },
    { date: 'Aug', revenue: 45000 },
    { date: 'Sep', revenue: 41000 },
    { date: 'Oct', revenue: 48000 },
    { date: 'Nov', revenue: 52000 },
    { date: 'Dec', revenue: 55000 },
  ],
};

const RevenueChart = () => {
  const [range, setRange] = useState<'7d' | '30d' | 'all'>('7d');

  const chartData = useMemo(() => mockData[range], [range]);

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Revenue Overview</h2>
        
        {/* Time range filter buttons */}
        <div className="flex space-x-2">
          <button
            aria-label="Show 7 days revenue data"
            aria-pressed={range === '7d'}
            onClick={() => setRange('7d')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              range === '7d'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            7D
          </button>
          <button
            aria-label="Show 30 days revenue data"
            aria-pressed={range === '30d'}
            onClick={() => setRange('30d')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              range === '30d'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            30D
          </button>
          <button
            aria-label="Show all time revenue data"
            aria-pressed={range === 'all'}
            onClick={() => setRange('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              range === 'all'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Chart container */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            aria-label={`Revenue chart for ${range === '7d' ? '7 days' : range === '30d' ? '30 days' : 'all time'}`}
            role="img"
            data={chartData}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#666"
              fontSize={12}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
              labelStyle={{ color: '#333' }}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart; 