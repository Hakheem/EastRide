// app/(admin)/layout.tsx
"use client";

import { useState } from 'react';
import { Sidebar } from "./admin/_components/Sidebar";
import { ThemeToggle } from "@/components/general/ThemeToggle";
import { Menu, X } from 'lucide-react';

export default function AdminLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const dealershipInfo = {
    name: 'East Africa Rides',
    address: '35/60 Nairobi Kenya',
  };

  return (
    <div className="min-h-screen ">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:hidden
      `}>
        <Sidebar 
          dealershipName={dealershipInfo.name}
          dealershipAddress={dealershipInfo.address}
        />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-40 w-64">
        <Sidebar 
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
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
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

