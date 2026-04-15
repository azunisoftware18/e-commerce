"use client";

import { useState } from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      
      {/* Sidebar - Pass state and toggle function */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0">
        
        {/* Navbar - Pass toggle function */}
        <DashboardNavbar toggleSidebar={toggleSidebar} />

        {/* Page Content */}
        <main className="w-full overflow-y-auto scrollbar-hide">
          <div className="">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}