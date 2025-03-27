"use client";
import dolar from '../images/dolar.png';
import bag from "../images/bag.png";
import user from "../images/user.png";
import card from "../images/card.png";
import trend from "../images/trend.png";

import React, { useState } from 'react';

const Dashboard = ({ isSidebarOpen }: { isSidebarOpen: boolean }) => {
  const [activeTab, setActiveTab] = useState('Overview');

  const tabs = ['Overview', 'Analytics', 'Reports', 'Notifications'];

  return (
    <main className={`flex flex-col p-6 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button className="bg-black text-white py-2 px-4 rounded-md">Download Report</button>
      </div>
      
      <div className="mb-4 bg-gray-100 p-1 rounded max-w-screen-md ml-0 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`py-2 px-3 text-sm font-medium rounded ${
              activeTab === tab
                ? 'bg-white text-black border border-gray-300'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center">
            <h2>Total Revenue</h2>
            <img src={dolar.src} alt="Dolar" className="h-6 w-6" />
          </div>
          <p className="text-2xl font-bold mt-3">$45,231.89</p>
          <p className="text-gray-500">+20.1% from last month</p>
          <div className="h-2 bg-green-200 rounded mt-4">
            <div className="h-full bg-green-600" style={{ width: '20%' }}></div>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center">
            <h2>Crypto Payments</h2>
            <img src={card.src} alt="Bag" className="h-6 w-6" />
          </div>
          <p className="text-2xl font-bold mt-3">$12,234.50</p>
          <p className="text-gray-500">+35.2% from last month</p>
          <div className="h-2 bg-purple-200 rounded mt-4">
            <div className="h-full bg-purple-600" style={{ width: '35.2%' }}></div>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center">
            <h2>Active Orders</h2>
            <img src={bag.src} alt="User" className="h-6 w-6" />
          </div>
          <p className="text-2xl font-bold mt-3">+573</p>
          <p className="text-gray-500">+12.4% from last month</p>
          <div className="h-2 bg-blue-200 rounded mt-4">
            <div className="h-full bg-blue-600" style={{ width: '12.4%' }}></div>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center">
            <h2>Active Customers</h2>
            <img src={user.src} alt="Card" className="h-6 w-6 mt-3" />
          </div>
          <p className="text-2xl font-bold">+2,350</p>
          <p className="text-gray-500">+18.1% from last month</p>
          <div className="h-2 bg-yellow-200 rounded mt-4">
            <div className="h-full bg-yellow-600" style={{ width: '18.1%' }}></div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white p-4 rounded shadow">
        <h2 className="text-2xl font-bold mt-8">Revenue Overview</h2>
        <div className="bg-gray-100 h-80 flex items-center justify-center rounded mt-4">
          <p>Revenue Chart Placeholder</p>
        </div>
      </div>

      <div className='mt-8 bg-white p-4 rounded shadow'>
        <h2 className="text-2xl font-bold">Recent Transactions</h2>
        <p className="mb-2 text-gray-500 mt-2">You made 265 sales this month.</p>
        <ul className="space-y-2">
          <li className="flex justify-between items-center bg-white p-4">
            <div className="flex items-center justify-center w-8 h-8 bg-green-300 rounded-full mr-2">
              <img src={trend.src} alt="Order" className="h-6 w-6" />
            </div>
            <div className="flex flex-col flex-1">
              <span>Table 12 - Lunch Order</span>
              <span className="text-gray-500">2 hours ago</span>
            </div>
            <span className="flex flex-col text-black">
              <span>+$125.00</span>
              <span className="text-green-600 text-sm text-right">Bitcoin</span>
            </span>
          </li>
          <li className="flex justify-between items-center bg-white p-4">
            <div className="flex items-center justify-center w-8 h-8 bg-green-300 rounded-full mr-2">
              <img src={trend.src} alt="Order" className="h-6 w-6" />
            </div>
            <div className="flex flex-col flex-1">
              <span>Table 5 - Dinner Order</span>
              <span className="text-gray-500">4 hours ago</span>
            </div>
            <span className="flex flex-col text-black">
              <span>+$89.50</span>
              <span className="text-green-600 text-sm text-right">Cash</span>
            </span>
          </li>
          <li className="flex justify-between items-center bg-white p-4">
            <div className="flex items-center justify-center w-8 h-8 bg-green-300 rounded-full mr-2">
              <img src={trend.src} alt="Order" className="h-6 w-6" />
            </div>
            <div className="flex flex-col flex-1">
              <span>Table 8 - Lunch Order</span>
              <span className="text-gray-500">6 hours ago</span>
            </div>
            <span className="flex flex-col text-black">
              <span>+$67.25</span>
              <span className="text-green-600 text-sm text-right">Ethereum</span>
            </span>
          </li>
        </ul>
      </div>
    </main>
  );
};

export default Dashboard;