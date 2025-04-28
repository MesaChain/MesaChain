"use client";

import { useState, useEffect } from 'react';
import Head from 'next/head';
import MenuItemCard from '@/components/DemoPage/MenuItemCard';
import OrderSummary from '@/components/DemoPage/OrderSummary';
import Calculator from '@/components/DemoPage/Calculator';
import PaymentModal from '@/components/DemoPage/PaymentModal';
import { MenuItem, OrderItem, PaymentMethod, Order } from '../../types/index';
import { calculateOrderTotals } from '../../utils/calculateTax';


const MENU_ITEMS: MenuItem[] = [
  { id: '1', name: 'Ice Tea', price: 2.53, category: 'Drinks', image: '/content-pixie-mAYaGExwdEo-unsplash.jpg' },
  { id: '2', name: 'Cola', price: 2.50, category: 'Drinks', image: '/tobi-4DJ6m_1V71o-unsplash.jpg' },
  { id: '3', name: 'Water', price: 1.50, category: 'Drinks', image: '/charlesdeluvio-edBR3b2JAuA-unsplash.jpg' },
  { id: '4', name: 'Burger', price: 8.99, category: 'Food', image: '/tareq-ismail-tEg7EK-ok3E-unsplash.jpg' },
  { id: '5', name: 'Fries', price: 3.50, category: 'Food', image: '/david-foodphototasty-E94j3rMcxlw-unsplash.jpg' },
  { id: '6', name: 'Salad', price: 7.99, category: 'Food', image: '/tania-melnyczuk-xeTv9N2FjXA-unsplash.jpg' },
];

export default function Page() {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Food' | 'Drinks'>('All');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [orderReceipt, setOrderReceipt] = useState<Order | null>(null);
  

  const { subtotal, tax, total } = calculateOrderTotals(orderItems);

  const filteredMenuItems = activeCategory === 'All' 
    ? MENU_ITEMS 
    : MENU_ITEMS.filter(item => item.category === activeCategory);

  
  const handleAddToOrder = (newItem: OrderItem) => {
    setOrderItems(prevItems => {
      
      const existingItemIndex = prevItems.findIndex(item => item.id === newItem.id);
      
      if (existingItemIndex >= 0) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + newItem.quantity
        };
        return updatedItems;
      } else {
       
        return [...prevItems, newItem];
      }
    });
  };


  const handleRemoveItem = (itemId: string) => {
    setOrderItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };


  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    
    setOrderItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleCompletePayment = (method: PaymentMethod, amountPaid: number) => {
    const receipt: Order = {
      items: orderItems,
      subtotal,
      tax,
      total,
      customerName,
      note: customerNote,
      paymentMethod: method
    };
    
    setOrderReceipt(receipt);
    setShowPaymentModal(false);
    setOrderCompleted(true);
    
    
    console.log('Order completed:', receipt);
    
 
    setTimeout(() => {
      setOrderItems([]);
      setCustomerName('');
      setCustomerNote('');
      setOrderCompleted(false);
      setOrderReceipt(null);
    }, 5000);
  };

  // Start a new order
  const handleNewOrder = () => {
    setOrderItems([]);
    setCustomerName('');
    setCustomerNote('');
    setOrderCompleted(false);
    setOrderReceipt(null);
  };

  return (
    <>
      <Head>
        <title>MesaChain Order</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            
            <div className="flex items-center space-x-4">
              {orderCompleted && (
                <button 
                  onClick={handleNewOrder}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  New Order
                </button>
              )}
              <div className="text-gray-600">
                <span className="font-medium">Alexa Laza</span>
              </div>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Menu Items */}
            <div className="lg:col-span-2">
              {orderCompleted ? (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-medium mb-4 text-green-600">Order Completed</h2>
                  {orderReceipt && (
                    <div className="border border-gray-200 p-4 rounded-lg">
                      <h3 className="text-lg font-medium mb-2">Receipt</h3>
                      <p>Payment Method: {orderReceipt.paymentMethod}</p>
                      <div className="my-4">
                        {orderReceipt.items.map(item => (
                          <div key={item.id} className="flex justify-between mb-1">
                            <span>{item.quantity}x {item.name}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>${orderReceipt.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax:</span>
                          <span>${orderReceipt.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Total:</span>
                          <span>${orderReceipt.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setActiveCategory('All')}
                        className={`px-4 py-2 rounded-lg ${
                          activeCategory === 'All' 
                            ? 'bg-gray-800 text-white' 
                            : 'bg-gray-200'
                        }`}
                      >
                        All
                      </button>
                      <button 
                        onClick={() => setActiveCategory('Food')}
                        className={`px-4 py-2 rounded-lg ${
                          activeCategory === 'Food' 
                            ? 'bg-gray-800 text-white' 
                            : 'bg-gray-200'
                        }`}
                      >
                        Food
                      </button>
                      <button 
                        onClick={() => setActiveCategory('Drinks')}
                        className={`px-4 py-2 rounded-lg ${
                          activeCategory === 'Drinks' 
                            ? 'bg-gray-800 text-white' 
                            : 'bg-gray-200'
                        }`}
                      >
                        Drinks
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredMenuItems.map(item => (
                      <MenuItemCard 
                        key={item.id} 
                        item={item} 
                        onAddToOrder={handleAddToOrder} 
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {/* Right Column: Order Summary and Calculator */}
            <div className="space-y-6">
              <OrderSummary 
                items={orderItems}
                subtotal={subtotal}
                tax={tax}
                total={total}
                onRemoveItem={handleRemoveItem}
                onUpdateQuantity={handleUpdateQuantity}
              />
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex mb-4">
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer Name"
                    className="flex-1 p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="mb-4">
                  <textarea
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    placeholder="Customer Note"
                    rows={2}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <button className="p-3 bg-gray-100 rounded-lg flex flex-col items-center">
                    <span className="text-sm text-gray-600">Bill</span>
                  </button>
                  <button className="p-3 bg-gray-100 rounded-lg flex flex-col items-center">
                    <span className="text-sm text-gray-600">Split</span>
                  </button>
                  <button className="p-3 bg-gray-100 rounded-lg flex flex-col items-center">
                    <span className="text-sm text-gray-600">Enter Code</span>
                  </button>
                </div>
                
                <button 
                  onClick={() => setShowPaymentModal(true)}
                  disabled={orderItems.length === 0}
                  className={`w-full py-3 text-center rounded-lg ${
                    orderItems.length === 0 
                      ? 'bg-gray-300 text-gray-500' 
                      : 'bg-purple-600 text-white'
                  }`}
                >
                  Payment
                </button>
              </div>
              
              <div className="bg-purple-600 text-white p-4 rounded-lg">
                <div className="text-center">
                  <h3 className="text-xl">Order</h3>
                  <p>
                    Drinks {orderItems.filter(i => i.category === 'Drinks').length} | 
                    Food {orderItems.filter(i => i.category === 'Food').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal 
          order={{ items: orderItems, subtotal, tax, total }}
          onClose={() => setShowPaymentModal(false)}
          onCompletePayment={handleCompletePayment}
        />
      )}
    </>
  );
}