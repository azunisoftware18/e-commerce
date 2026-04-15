'use client';

import React, { useMemo } from 'react'
import { IndianRupee, ShoppingBag, Package, Users } from 'lucide-react'
import StatCard from '@/components/common/StatCard'
import LedgerTable from '@/components/table/LedgerTable'
import {  useOrders } from '@/lib/queries/useOrders';
import { useProducts } from '@/lib/queries/useProducts';

export default function Ledger() {
  const { data: orders = [], isLoading } = useOrders();
  const { data: products = [] } = useProducts();
  const ledgerData = useMemo(() => {
  return orders.map((order) => ({
    date: order.createdAt
      ? new Date(order.createdAt).toLocaleDateString()
      : "-",

    orderId: order.id,

    customer: order.customer?.name || "N/A",

    amount: order.totalAmount || 0, // ✅ FIXED

    status: order.paymentStatus || order.status || "Pending", // ✅ FIXED
  }));
}, [orders]);

const totalRevenue = orders.reduce(
  (sum, o) => sum + Number(o.totalAmount || o.total || 0),
  0
);

const totalOrders = orders.length;

const totalCustomers = new Set(
  orders.map((o) => o.customer?.id)
).size;

const formattedRevenue = new Intl.NumberFormat("en-IN").format(totalRevenue);

if (isLoading) {
  return <div className="p-6">Loading ledger...</div>;
}

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 w-full bg-white min-h-screen">
      {/* Header Section */}
      <header className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#2A4150]">
          Ledger
        </h1>
        <p className="text-sm md:text-base text-slate-500">
          Monitor your revenue, orders, and inventory performance.
        </p>
      </header>

      {/* Stats Grid - Mobile/Tablet par 1, Laptop par 2 cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 w-full max-w-400">
       <StatCard 
  title="Total Revenue" 
  value={`₹${formattedRevenue}`} 
  icon={IndianRupee} 
  trendValue="+8.2%" 
  isUp={true} 
/>

<StatCard 
  title="Orders" 
  value={totalOrders} 
  icon={ShoppingBag} 
  trendValue="+5.2%" 
  isUp={true} 
/>

<StatCard 
  title="Products" 
  value={products.length}
  icon={Package} 
  trendValue="--" 
  isUp={true} 
/>

<StatCard 
  title="Customers" 
  value={totalCustomers} 
  icon={Users} 
  trendValue="+2.1%" 
  isUp={true} 
/>
      </section>

      {/* Table Section - Tablet aur Mobile dono par scrollable */}
<section className="mt-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
  <div className="p-4 border-b border-slate-100">
    <h2 className="font-semibold text-[#2A4150]">Recent Transactions</h2>
  </div>
  
  {/* 1. overflow-x-auto: Side scroll enable karta hai.
      2. w-full: Container ki poori width leta hai.
  */}
  <div className="overflow-x-auto w-full">
    <div className="inline-block min-w-full align-middle">
      <LedgerTable  data={ledgerData} />
    </div>
  </div>
</section>
    </div>
  )
}