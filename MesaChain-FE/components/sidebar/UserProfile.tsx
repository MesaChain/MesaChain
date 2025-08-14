import React, { useState } from 'react';
import { FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../lib/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface UserProfileProps {
  name: string;
  isCollapsed?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({
  name,
  isCollapsed = false
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="relative border-t-2">
      <button
        onClick={() => !isCollapsed && setIsDropdownOpen(!isDropdownOpen)}
        className={`
          flex items-center w-full p-3 hover:bg-gray-100 transition-colors
          ${isCollapsed ? 'justify-center' : ''}
        `}
      >
        <div className="w-8 h-8 bg-gray-300 rounded-full mr-3 flex items-center justify-center">
          <FaUser className="text-white" />
        </div>
        <div className={`${isCollapsed ? 'hidden' : 'block'}`}>
          <span className="text-sm font-medium text-gray-700 block">
            {name}
          </span>
          {user?.role && (
            <span className="text-xs text-gray-500 block">
              {user.role}
            </span>
          )}
        </div>
      </button>

      {!isCollapsed && isDropdownOpen && (
        <div className="absolute bottom-full left-0 w-full bg-white border rounded-md shadow-lg z-10">
          <div className="py-1">
            <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <FaUser className="mr-2" /> Profile
            </button>
            <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <FaCog className="mr-2" /> Settings
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              <FaSignOutAlt className="mr-2" /> Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;