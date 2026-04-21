"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import DashboardNavbar from "@/components/DashboardNavbar";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { user, isAuthenticated, isAuthChecked } = useSelector(
    (state) => state.auth
  );

  const router = useRouter();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    // ✅ Jab tak auth check complete nahi hua tab tak kuch mat karo
    if (!isAuthChecked) return;

    // ❌ Unauthorized
    if (!isAuthenticated || user?.role !== "Admin") {
      router.push("/");
    }
  }, [isAuthenticated, user, isAuthChecked]);

  // ✅ Loading state
  if (!isAuthChecked) {
    return <div className="p-5">Loading...</div>;
  }

  // ❌ Access denied UI (optional)
  if (!isAuthenticated || user?.role !== "Admin") {
    return null;
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex flex-col flex-1 min-w-0">
        <DashboardNavbar toggleSidebar={toggleSidebar} />

        <main className="w-full overflow-y-auto scrollbar-hide">
          <div>{children}</div>
        </main>
      </div>
    </div>
  );
}