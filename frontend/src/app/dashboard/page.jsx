"use client";

import React, { useMemo } from "react";
import { useOrders } from "@/lib/queries/useOrders";
import { IndianRupee, ShoppingBag, TrendingUp, Loader2 } from "lucide-react";
import StatCard from "@/components/common/StatCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// --- Custom Tooltip Component ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-lg">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-sm font-semibold text-slate-900">
          Revenue: <span className="text-blue-600">₹{new Intl.NumberFormat("en-IN").format(payload[0].value)}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { data: orders = [], isLoading } = useOrders();

  // 1. Calculations for Stat Cards
  const totalOrders = orders.length;
  
  const totalRevenue = orders.reduce(
    (sum, o) => sum + Number(o.totalAmount || o.total || 0), 
    0
  );

  const formattedRevenue = new Intl.NumberFormat("en-IN").format(totalRevenue);

  const pendingOrders = orders.filter(
    (o) => o.status?.toLowerCase() === "pending"
  ).length;

  const completedOrders = orders.filter(
    (o) => o.status?.toLowerCase() === "delivered" || o.status?.toLowerCase() === "completed"
  ).length;

  // 2. Optimized & Fixed Monthly Data Logic
  const monthlyData = useMemo(() => {
    const monthsMap = {};
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    orders.forEach((order) => {
      const dateValue = order.createdAt || order.date;
      if (!dateValue) return;

      const date = new Date(dateValue);
      
      // Check for Invalid Date
      if (isNaN(date.getTime())) return;

      const month = date.toLocaleString("default", { month: "short" });
      const year = date.getFullYear();
      const label = `${month} ${year}`;

      if (!monthsMap[label]) {
        monthsMap[label] = {
          label: label,
          revenue: 0,
          monthIndex: date.getMonth(),
          year: year
        };
      }
      monthsMap[label].revenue += Number(order.totalAmount || order.total || 0);
    });

    // Sort by Year then by Month Index
    return Object.values(monthsMap)
      .sort((a, b) => a.year - b.year || a.monthIndex - b.monthIndex)
      .map(item => ({
        month: item.label,
        revenue: item.revenue
      }));
  }, [orders]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-slate-500 font-medium animate-pulse">Loading Analytics...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 w-full bg-white min-h-screen">
      
      {/* --- HEADER SECTION --- */}
      <header className="space-y-1">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#2A4150]">
            Dashboard Overview
          </h1>
          <p className="text-slate-500 mt-1">Track and manage your business growth and orders.</p>
        </div>
        
      </header>

      {/* --- STATS CARDS SECTION --- */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Total Orders" value={totalOrders} icon={ShoppingBag}  />
        <StatCard title="Total Revenue" value={`₹${formattedRevenue}`} icon={IndianRupee}  />
        <StatCard title="Pending Orders" value={pendingOrders} icon={ShoppingBag}  />
        <StatCard title="Completed" value={completedOrders} icon={ShoppingBag}  />
      </section>

      {/* --- CHART SECTION --- */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#2A4150]">Monthly Revenue</h2>
            <p className="text-sm text-slate-400 font-medium italic">Revenue distribution over time</p>
          </div>
          
          {/* <div className="flex gap-2">
            <select className="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg px-3 py-2 outline-none cursor-pointer hover:bg-slate-100 transition-colors">
              <option>Current Year</option>
              <option>Previous Year</option>
            </select>
          </div> */}
        </div>

       <div className="w-full h-80">
  {monthlyData.length > 0 ? (
    <ResponsiveContainer width="100%" height="100%" minHeight={300}>
      <BarChart
        data={monthlyData}
        margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
      >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={1} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0.8} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#F1F5F9" />
              
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }}
                dy={12}
              />
              
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748B', fontSize: 12 }}
                tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000).toFixed(1) + "k" : value}`}
              />

              <Tooltip 
                cursor={{ fill: '#F8FAFC', radius: 6 }} 
                content={<CustomTooltip />} 
              />

              <Bar 
                dataKey="revenue" 
                fill="url(#barGradient)" 
                radius={[6, 6, 0, 0]} 
                barSize={32}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">
      No data available
    </div>
  )}
        </div>
      </section>
    </div>
  );
}