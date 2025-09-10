
import React, { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-800">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex flex-col flex-1 w-full">
        {/* Mobile header */}
        <header className="md:hidden z-10 py-4 bg-white shadow-md dark:bg-gray-900">
          <div className="container flex items-center justify-between h-full px-6 mx-auto text-gray-600 dark:text-gray-300">
            <a className="text-lg font-bold text-gray-800 dark:text-gray-200" href="#">
                Devansh Infra
            </a>
            <button
              className="p-1 rounded-md md:hidden focus:outline-none focus:shadow-outline-indigo"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Menu"
            >
              <span className="material-icons text-2xl">menu</span>
            </button>
          </div>
        </header>
        <main className="p-4 md:p-8">
            {children}
        </main>
      </div>
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 z-20 bg-black opacity-50 md:hidden"
          aria-hidden="true"
        ></div>
      )}
    </div>
  );
};

export default AdminLayout;
