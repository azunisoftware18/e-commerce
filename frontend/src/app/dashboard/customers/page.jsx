"use client";

import StatCard from "@/components/common/StatCard";
import AddCustomerModal from "@/components/modals/AddCustomerModal";
import CustomerTable from "@/components/table/CustomerTable";
import Button from "@/components/ui/Button";
import {
  useCreateCustomer,
  useDeleteCustomer,
  useUpdateCustomer,
} from "@/lib/mutations/useCustomers";
import { useCustomers } from "@/lib/queries/useCustomers";
import { Users, UserCheck, UserMinus, UserPlus } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

export default function Customers() {
  const [open, setOpen] = useState(false);
  const { data: customerData = [], isLoading } = useCustomers();
  const createCustomer = useCreateCustomer();
  const { mutate: deleteCustomer } = useDeleteCustomer();
  const { mutate: updateCustomer } = useUpdateCustomer();
  const [editCustomer, setEditCustomer] = useState(null);
  if (isLoading) {
    return <div className="p-6">Loading customers...</div>;
  }

  const formattedData = customerData.map((item) => ({
    id: item.id,
    customer: item.name,
    contact: item.phone,
    status: item.status,
    joinDate: item.joinDate?.split("T")[0],
  }));

  const handleAddCustomer = (data) => {
    createCustomer.mutate(data, {
      onSuccess: () => {
        toast.success("Customer added successfully");
        setOpen(false);
      },
    });
  };

  const handleDelete = (id) => {
  if (!confirm("Delete this customer?")) return;

  deleteCustomer(id, {
    onSuccess: () => toast.success("Customer deleted"),
    onError: () => toast.error("Delete failed"),
  });
};

  const handleEdit = (row) => {
  const original = customerData.find((c) => c.id === row.id);
  setEditCustomer(original);
};

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 w-full bg-white min-h-screen">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#2A4150]">
            Customers
          </h1>
          <p className="text-sm md:text-base text-slate-500">
            Manage and monitor your customer database and their activities.
          </p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          text="Add Customer"
          icon={<UserPlus size={18} />}
        />
      </header>

      {/* Stats Grid - Mobile par 1, Tablet par 2, aur Laptop/PC par 4 cards ek hi row mein */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 w-full max-w-400">
        <StatCard
          title="Total Customers"
          value="1,250"
          icon={Users}
          trendValue="+12.5"
          isUp={true}
        />
        <StatCard
          title="Active Now"
          value="42"
          icon={UserCheck}
          trendValue="+5.2"
          isUp={true}
        />
        <StatCard
          title="New This Month"
          value="156"
          icon={Users}
          trendValue="-2.4"
          isUp={false}
        />
        <StatCard
          title="Churn Rate"
          value="1.2%"
          icon={UserMinus}
          trendValue="-0.5"
          isUp={true}
        />
      </section>

      <section className="mt-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-semibold text-[#2A4150]">All Customers</h2>
        </div>

        <div className="overflow-x-auto w-full scrollbar-hide">
          <div className="inline-block min-w-full align-middle">
            <CustomerTable
              data={formattedData}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </section>
      <AddCustomerModal
  open={open}
  onClose={() => setOpen(false)}
  onSubmit={handleAddCustomer}
/>
<AddCustomerModal
  open={!!editCustomer}
  onClose={() => setEditCustomer(null)}
  defaultValues={editCustomer}
  onSubmit={(data) => {
    updateCustomer(
      { id: editCustomer.id, data },
      {
        onSuccess: () => {
          toast.success("Customer updated");
          setEditCustomer(null);
        },
        onError: (err) => {
          console.log(err.response?.data);
          toast.error("Update failed");
        },
      }
    );
  }}
/>
    </div>
  );
}
