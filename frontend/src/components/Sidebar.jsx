"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Box,
  Layers,
  Notebook,
  X,
  Salad,
  ClipboardPlus,
  TicketPercent,
  Globe,
  MailCheckIcon,
} from "lucide-react";

export const MENU_ITEMS = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Audit Logs", icon: Globe, path: "/dashboard/audit-logs" },
  { name: "Ledger", icon: Notebook, path: "/dashboard/ledger" },
  { name: "Categories", icon: Layers, path: "/dashboard/categories" },
  { name: "Products", icon: Box, path: "/dashboard/products" },
  { name: "Customers", icon: Users, path: "/dashboard/customers" },
  { name: "Coupons", icon: TicketPercent, path: "/dashboard/coupons" },
  { name: "Orders", icon: ShoppingCart, path: "/dashboard/orders" },
  { name: "Diet Plans", icon: Salad , path: "/dashboard/diet-plans" },
  { name: "Consultations", icon: ClipboardPlus, path: "/dashboard/consultations" },
  { name: "News Letter", icon: MailCheckIcon, path: "/dashboard/news-letter" },
];

export default function Sidebar({ isOpen, toggleSidebar }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={toggleSidebar}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#e0e0e0] transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6 flex items-center justify-between">
          <span className="text-xl font-bold text-[#2A4150] tracking-tight">
            AdminPanel
          </span>
          <button onClick={toggleSidebar} className="md:hidden text-[#2A4150]">
            <X size={24} />
          </button>
        </div>

        <nav className="mt-4 px-4 flex-1">
          <div className="space-y-1">
            {MENU_ITEMS.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={() => isOpen && toggleSidebar()} // Close on click for mobile
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                    ${isActive
                        ? "bg-[#2A4150] text-white shadow-lg shadow-[#2A4150]/20"
                        : "text-[#2A4150]/70 hover:bg-[#e0e0e0] hover:text-[#2A4150]"
                    }
                  `}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
}