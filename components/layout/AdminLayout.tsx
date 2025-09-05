
import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    // Changed to min-h-screen and removed overflow-hidden to allow the page to scroll naturally.
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-800">
      <Sidebar />
      {/* Removed overflow-y-auto from the content wrapper */}
      <div className="flex flex-col flex-1 w-full">
        <main className="p-4 md:p-8">
            {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
