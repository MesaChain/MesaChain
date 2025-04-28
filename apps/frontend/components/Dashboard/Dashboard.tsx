"use client";
 import { DollarSign, CreditCard, ShoppingBag, User, TrendingUp } from 'lucide-react';
 import DashboardCard from './DashboardCard';
 import TransactionItem from './TransactionItem';

 import React, { useState } from 'react';

 const Dashboard = () => {
   const [activeTab, setActiveTab] = useState('Overview');

   const tabs = ['Overview', 'Analytics', 'Reports', 'Notifications'];

   const cardData = [
     {
       title: 'Total Revenue',
       value: '$45,231.89',
       percentageChange: '+20.1% from last month',
       icon: DollarSign,
       color: 'bg-green-600',
     },
     {
       title: 'Crypto Payments',
       value: '$12,234.50',
       percentageChange: '+35.2% from last month',
       icon: CreditCard,
       color: 'bg-purple-600',
     },
     {
       title: 'Active Orders',
       value: '+573',
       percentageChange: '+12.4% from last month',
       icon: ShoppingBag,
       color: 'bg-blue-600',
     },
     {
       title: 'Active Customers',
       value: '+2,350',
       percentageChange: '+18.1% from last month',
       icon: User,
       color: 'bg-yellow-600',
     },
   ];

   const transactionData = [
     {
       table: 'Table 12 - Lunch Order',
       time: '2 hours ago',
       amount: '+$125.00',
       paymentMethod: 'Bitcoin',
       icon: TrendingUp,
     },
     {
       table: 'Table 5 - Dinner Order',
       time: '4 hours ago',
       amount: '+$89.50',
       paymentMethod: 'Cash',
       icon: TrendingUp,
     },
     {
       table: 'Table 8 - Lunch Order',
       time: '6 hours ago',
       amount: '+$67.25',
       paymentMethod: 'Ethereum',
       icon: TrendingUp,
     },
   ];

   return (
     <main className="flex flex-col p-10 transition-all duration-300 mx-auto max-w-7xl">
       <div className="flex justify-between items-center mb-8">
         <h1 className="text-3xl font-bold">Dashboard</h1>
         <button className="bg-black text-white py-2 px-6 rounded-md">Download Report</button>
       </div>

       <div className="mb-6 bg-gray-100 p-2 rounded max-w-screen-md ml-0 w-fit">
         {tabs.map((tab) => (
           <button
             key={tab}
             className={`py-3 px-4 text-base font-medium rounded ${
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

       <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
         {cardData.map((card, index) => (
           <DashboardCard
             key={index}
             title={card.title}
             value={card.value}
             percentageChange={card.percentageChange}
             icon={React.createElement(card.icon) as React.ReactNode}
             color={card.color}
           />
         ))}
       </div>

       <div className="mt-10 bg-white p-6 rounded shadow">
         <h2 className="text-2xl font-bold mt-8">Revenue Overview</h2>
         <div className="bg-gray-100 h-80 flex items-center justify-center rounded mt-4">
           <p>Revenue Chart Placeholder</p>
         </div>
       </div>

       <div className='mt-10 bg-white p-6 rounded shadow'>
         <h2 className="text-2xl font-bold">Recent Transactions</h2>
         <p className="mb-2 text-gray-500 mt-2">You made 265 sales this month.</p>
         <ul className="space-y-4">
           {transactionData.map((transaction, index) => (
             <TransactionItem
               key={index}
               table={transaction.table}
               time={transaction.time}
               amount={transaction.amount}
               paymentMethod={transaction.paymentMethod}
               icon={React.createElement(transaction.icon) as React.ReactNode}
             />
           ))}
         </ul>
       </div>
     </main>
   );
 };

 export default Dashboard;