import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconType } from 'react-icons';

interface SidebarItemProps {
  icon: IconType;
  label: string;
  href: string;
  isCollapsed?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon: Icon, 
  label, 
  href, 
  isCollapsed = false
}) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  
 
  const handleClick = (e: React.MouseEvent) => {
    if (isActive) {
      e.preventDefault();
    }
  };

  return (
    <Link 
      href={href}
      onClick={handleClick}
      className={`
        flex items-center p-3 hover:bg-green-50 transition-colors mt-5
        ${isActive ? 'bg-green-100 text-green-600' : 'text-gray-600'}
        ${isCollapsed ? 'justify-center' : ''}
      `}
      aria-label={isCollapsed ? label : undefined}
    >
      <Icon className={`${isCollapsed ? 'mx-auto' : 'mr-3'} w-8 h-8`} />
      <span className={`
        text-sm font-medium 
        ${isCollapsed ? 'hidden' : 'block'}
      `}>
        {label}
      </span>
    </Link>
  );
};

export default SidebarItem;