"use client";
import React, { useState } from "react";
import {
  FaHome,
  FaShoppingCart,
  FaBars,
  FaUsers,
  FaChartBar,
  FaHistory,
  FaCog,
  FaStar,
} from "react-icons/fa";
import SidebarItem from "./sidebar/SideBarItems";
import UserProfile from "./sidebar/UserProfile";
import { useSidebarStore } from "../store/useSidebarStore";
import { useAuth } from "../lib/hooks/useAuth";
import { UserRole, Permission } from "../types/auth";

const Sidebar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isCollapsed, toggleCollapse } = useSidebarStore();
  const { hasPermission, hasRole, user } = useAuth();

  // Define all possible sidebar items with their permission requirements
  const allSidebarItems = [
    { icon: FaHome, label: "Dashboard", href: "/", permission: null }, // Everyone can see dashboard
    { icon: FaShoppingCart, label: "Orders & Payments", href: "/demopage", permission: Permission.POS },
    { icon: FaBars, label: "Menu", href: "/menu", permission: Permission.MENU_MANAGEMENT },
    { icon: FaUsers, label: "Staff", href: "/staff", permission: Permission.STAFF_MANAGEMENT },
    { icon: FaShoppingCart, label: "Transactions", href: "/transactions", permission: Permission.PAYMENTS },
    { icon: FaChartBar, label: "Analytics", href: "/analytics", permission: Permission.REPORTS },
    { icon: FaHistory, label: "Orders History", href: "/orders-history", permission: Permission.ORDER_HISTORY },
    { icon: FaUsers, label: "Customers", href: "/customers", permission: Permission.CUSTOMERS },
    { icon: FaCog, label: "Settings", href: "/settings", permission: Permission.ADMIN },
    { icon: FaStar, label: "Loyalty", href: "/loyalty", permission: null },
  ];

  // Filter sidebar items based on user permissions
  const sidebarItems = allSidebarItems.filter(item => {
    if (!item.permission) return true; // No permission required
    return hasPermission(item.permission);
  });

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
              className={`${!isCollapsed ? "ml-8 mt-2" : "mt-2 ml-0"}`}
            >
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

          <UserProfile name={user?.name || "User"} isCollapsed={isCollapsed} />
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