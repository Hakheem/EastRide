'use client'

import { ThemeToggle } from "@/components/general/ThemeToggle";
import { useState } from 'react';
import { SuperAdminSidebar } from "./superadmin/_components/Sidebar";
import { Menu, X } from 'lucide-react';

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    const [SuperAdminSidebarOpen, setSuperAdminSidebarOpen] = useState(false);

 const dealershipInfo = {
    name: 'East Africa Rides',
    address: '35/60 Nairobi Kenya',
  };

    return (
       <div className="min-h-screen ">
      {/* Mobile SuperAdminSidebar backdrop */}
      {SuperAdminSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSuperAdminSidebarOpen(false)}
        />
      )}

      {/* Mobile SuperAdminSidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
        ${SuperAdminSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:hidden
      `}>
        <SuperAdminSidebar 
          dealershipName={dealershipInfo.name}
          dealershipAddress={dealershipInfo.address}
        />
      </div>

      {/* Desktop SuperAdminSidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-40 w-64">
        <SuperAdminSidebar 
          dealershipName={dealershipInfo.name}
          dealershipAddress={dealershipInfo.address}
        />
      </div>

      {/* Main Content */}
      <div className="lg:pl-60">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background  px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSuperAdminSidebarOpen(!SuperAdminSidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {SuperAdminSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

            </div>
            
            {/* Theme Toggle */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="px-4 lg:px-6">
          {children}
        </div>
      </div>
    </div>
  );
}
 
