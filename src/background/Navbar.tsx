import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-blue-700' : '';
  };

  const handleRestart = () => {
    chrome.runtime.reload();
  };

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <Link 
            to="/" 
            className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/')}`}
          >
            Music Understanding
          </Link>
          {/* <Link 
            to="/main" 
            className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/main')}`}
          >
            Settings
          </Link> */}
        </div>
        {/* <button 
          className="p-2 hover:bg-blue-700 rounded-md transition-colors"
          onClick={handleRestart}
          title="Restart Extension"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        </button> */}
      </div>
    </nav>
  );
};

export default Navbar;
