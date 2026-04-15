"use client";

import React, { useState } from "react";
import { 
  ArrowLeft, Mail, Phone, MapPin, Calendar, 
  CreditCard, ShoppingBag, UserCheck, Edit3, 
  Trash2, TrendingUp, Clock
} from "lucide-react";
import StatCard from "@/components/common/StatCard";
import LedgerTable from "@/components/table/LedgerTable";
import { useParams, useRouter } from "next/navigation";
import { useCustomer } from "@/lib/queries/useCustomers";

export default function AdminCustomerView() {
  const router = useRouter();
  const { id } = useParams();
  const { data: customer, isLoading } = useCustomer(id);
  const [activeTab, setActiveTab] = useState("transactions");

  // Format Join Date
  const joinDate = customer?.joinDate ? new Date(customer.joinDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  }) : "N/A";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#2A4150] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-semibold animate-pulse">Loading Customer Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] p-4 md:p-8 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Navigation Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <button 
              onClick={() => router.back()}
              className="group p-3 bg-white border border-slate-200 hover:border-[#2A4150] rounded-2xl shadow-sm transition-all"
            >
              <ArrowLeft size={22} className="text-slate-600 group-hover:text-[#2A4150]" />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold text-[#2A4150] tracking-tight">
                {customer?.name || "Customer Profile"}
              </h1>
              <p className="text-sm text-slate-500 font-medium flex items-center gap-2 mt-1">
                <span className="bg-slate-200 px-2 py-0.5 rounded text-[10px] text-slate-700">ADMIN VIEW</span>
                • Customer ID: <span className="font-mono text-[#2A4150]">{id}</span>
              </p>
            </div>
          </div>
          
         
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Customer Info Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-4xl border border-slate-200 shadow-sm overflow-hidden p-8">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-28 h-28 bg-linear-to-br from-slate-50 to-slate-100 rounded-4xl flex items-center justify-center text-[#2A4150] text-4xl font-black border-4 border-white shadow-xl">
                    {customer?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-white w-8 h-8 rounded-full shadow-lg flex items-center justify-center">
                    <UserCheck size={14} className="text-white" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-[#2A4150]">{customer?.name}</h2>
                <p className="text-slate-500 font-medium mb-4">{customer?.email}</p>
                <span className="px-4 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100 uppercase tracking-widest">
                  {customer?.status || "Active Customer"}
                </span>
              </div>

              <div className="mt-10 space-y-5 border-t border-slate-50 pt-8">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Customer Meta</h4>
                <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><Phone size={18} /></div>
                  {customer?.phone || "No phone added"}
                </div>
                <div className="flex items-start gap-4 text-sm font-medium text-slate-600">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0"><MapPin size={18} /></div>
                  <span className="leading-relaxed">{customer?.location || "No address provided"}</span>
                </div>
                <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><Calendar size={18} /></div>
                  Member since {joinDate}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Business Data */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* STATS SECTION - Desktop par ek line mein */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <StatCard 
                title="Total Spent" 
                value={customer?.totalSpent ? `₹${customer.totalSpent}` : "₹0"}
                icon={CreditCard} 
                trendValue="Lifetime" 
                isUp={true} 
              />
              <StatCard 
                title="Total Orders" 
                value={customer?.totalOrders || "0"}
                icon={ShoppingBag} 
                trendValue="Orders" 
                isUp={true} 
              />
              <StatCard 
                title="Last Activity" 
                value="Today" 
                icon={Clock} 
                trendValue="Online" 
                isUp={true} 
              />
            </div>

            {/* TABS & TABLES */}
            <div className="bg-white rounded-4xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex border-b border-slate-100 px-8 bg-slate-50/30">
                {["transactions", "logs"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-5 text-sm font-bold capitalize transition-all border-b-4 mr-10 ${
                      activeTab === tab 
                        ? "border-[#2A4150] text-[#2A4150]" 
                        : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-0">
                {activeTab === "transactions" && (
                  <div className="overflow-x-auto min-h-75">
                    {/* Yahan aap customer ka ledger data map karenge */}
                    <LedgerTable data={customer?.transactions || []} />
                  </div>
                )}
                {activeTab === "logs" && (
                  <div className="p-12 text-center">
                    <div className="inline-flex p-4 bg-slate-50 rounded-full mb-4">
                       <TrendingUp className="text-slate-300" size={32} />
                    </div>
                    <p className="text-slate-500 font-medium text-sm">No activity logs recorded yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}