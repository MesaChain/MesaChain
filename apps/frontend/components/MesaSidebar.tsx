"use client";
import React, { useState, useEffect } from "react";
import {
  FaHome,
  FaShoppingCart,
  FaBars,
  FaUsers,
  FaChartBar,
  FaHistory,
  FaCog,
} from "react-icons/fa";
import SidebarItem from "./sidebar/SideBarItems";
import UserProfile from "./sidebar/UserProfile";

const Sidebar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isReady, setIsReady] = useState(false);

  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('sidebarCollapsed');
      setIsCollapsed(savedState === 'true');
      setIsReady(true);
    }
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
  };


  if (!isReady) {
    return null;
  }

  const sidebarItems = [
    { icon: FaHome, label: "Dashboard", href: "./" },
    { icon: FaShoppingCart, label: "Orders & Payments", href: "/demopage" },
    { icon: FaBars, label: "Menu", href: "/menu" },
    { icon: FaUsers, label: "Staff", href: "/staff" },
    { icon: FaShoppingCart, label: "Transactions", href: "/transactions" },
    { icon: FaChartBar, label: "Analytics", href: "/analytics" },
    { icon: FaHistory, label: "Orders History", href: "/orders-history" },
    { icon: FaUsers, label: "Customers", href: "/customers" },
    { icon: FaCog, label: "Settings", href: "/settings" },
  ];

  const ToggleCollapseButton = () => (
    <button
     
      className="text-gray-600 hover:text-green-600 transition-colors"
      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      <FaBars className="w-8 h-8 border-2 border-gray-500 rounded-md" />
    </button>
  );

  return (
    <>
      {/* Mobile Hamburger */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-green-500 text-white rounded"
      >
        <FaBars />
      </button>

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full bg-white shadow-lg transform 
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 transition-all duration-300 z-40
          ${isCollapsed ? "w-20" : "w-64"}
        `}
        style={{
          transitionProperty: 'transform, width',
          transitionDuration: '300ms',
          transitionTimingFunction: 'ease-in-out'
        }}
      >
        <div className="flex flex-col h-full relative">
          <div className="flex items-center flex-row border-b p-6">
            {/* Logo/Brand */}
            <div className="flex items-center justify-center">
              <h1
                className={`
                  text-2xl font-bold text-green-600 
                  ${isCollapsed ? "hidden" : "block"}
                `}
              >
                MesaChain
              </h1>
              <h1
                className={`text-sm text-green-500 font-bold ${isCollapsed ? "flex text-xl" : "hidden"}`}
              >
                M
              </h1>
            </div>
            <div 
             onClick={toggleCollapse}
            className={`${!isCollapsed ? "ml-8 mt-2" : "mt-2 ml-0"}`}>
              <ToggleCollapseButton />
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto mt-5">
            {sidebarItems.map((item, index) => (
              <SidebarItem
                key={index}
                {...item}
                isCollapsed={isCollapsed}
              />
            ))}
          </nav>

          <UserProfile name="Alexa Laza" isCollapsed={isCollapsed} />
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black opacity-50 z-30 lg:hidden"
        />
      )}
    </>
  );
};

export default Sidebar;