"use client";

import React, { useMemo } from "react";
import { IndianRupee, ShoppingBag, Package, Users } from "lucide-react";
import StatCard from "@/components/common/StatCard";
import LedgerTable from "@/components/table/LedgerTable";
import { useOrders } from "@/lib/queries/useOrders";
import { useProducts } from "@/lib/queries/useProducts";

export default function Ledger() {
  const { data: orders = [], isLoading } = useOrders();
  const { data: products = [] } = useProducts();
  const ledgerData = useMemo(() => {
  return orders.map((order) => ({
    date: order.date || null,

    orderId: order.id,
    customer: order.customer?.name || "N/A",

    // ⚠️ yaha bhi small fix
    amount: order.totalAmount || order.total || 0,

    // ⚠️ backend field "payment" hota hai
    status: order.payment || order.status || "Pending",

    // 🔥 ADD THESE (main fix)
    razorpayPaymentId: order.razorpayPaymentId || null,
    razorpayOrderId: order.razorpayOrderId || null,
    paymentMode: order.paymentMode || null,
  }));
}, [orders]);

  const totalPendingRevenue = orders
  .filter(
    (o) => (o.payment || o.paymentStatus || o.status || "").toLowerCase() === "pending"
  )
  .reduce((sum, o) => sum + Number(o.totalAmount || o.total || 0), 0);

const formattedPendingRevenue = new Intl.NumberFormat("en-IN").format(
  totalPendingRevenue
);

  const totalPaidRevenue = orders
  .filter((o) =>
    ["paid", "success"].includes(
      (o.payment || o.paymentStatus || o.status || "").toLowerCase()
    )
  )
  .reduce((sum, o) => sum + Number(o.totalAmount || o.total || 0), 0);

  const totalOrders = orders.length;

  const totalCustomers = new Set(orders.map((o) => o.customer?.id)).size;

 const totalRevenue = orders.reduce(
  (sum, o) => sum + Number(o.totalAmount || o.total || 0),
  0
);

const formattedTotalRevenue = new Intl.NumberFormat("en-IN").format(
  totalRevenue
);

  const formattedRevenue = new Intl.NumberFormat("en-IN").format(
  totalPaidRevenue
);

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

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 w-full max-w-400">
  <StatCard
    title="Total Paid Revenue"
    value={`₹${formattedRevenue}`}
    icon={IndianRupee}
  />

  <StatCard
    title="Total Revenue"
    value={`₹${formattedTotalRevenue}`}
    icon={IndianRupee}
  />

  <StatCard
  title="Pending Revenue"
  value={`₹${formattedPendingRevenue}`}
  icon={ShoppingBag}
/>

  <StatCard
    title="Customers"
    value={totalCustomers}
    icon={Users}
  />
</section>

      <section className="mt-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-semibold text-[#2A4150]">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto w-full">
          <div className="inline-block min-w-full align-middle">
            <LedgerTable data={ledgerData} />
          </div>
        </div>
      </section>
    </div>
  );
}
