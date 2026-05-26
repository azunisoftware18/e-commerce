"use client";

import React, { useState } from "react";

import CouponsTable from "@/components/table/CouponsTable";

import { useCoupons } from "@/lib/queries/useCoupon";

import Button from "@/components/ui/Button";

import AddCouponModal from "@/components/modals/AddCouponModal";

import { Plus } from "lucide-react";
import { useCreateCoupon, useUpdateCoupon } from "@/lib/mutations/useCoupon";
import toast from "react-hot-toast";

export default function Page() {
  // ==============================
  // MODAL STATE
  // ==============================

  const [openModal, setOpenModal] = useState(false);

  const [editData, setEditData] = useState(null);

  // ==============================
  // GET COUPONS
  // ==============================

  const { data: coupons = [], isLoading } = useCoupons();

  const { mutate: createCoupon } = useCreateCoupon();

  const { mutate: updateCoupon } = useUpdateCoupon();

  // ==============================
  // HANDLE EDIT
  // ==============================

  const handleEditCoupon = (coupon) => {
    setEditData(coupon);

    setOpenModal(true);
  };

  // ==============================
  // HANDLE CREATE
  // ==============================

  const handleCreateCoupon = () => {
    setEditData(null);

    setOpenModal(true);
  };

  const handleSubmitCoupon = (data) => {
    // FORCE NUMBER CONVERSION
    const formattedData = {
      ...data,

      discountValue: Number(data.discountValue),

      minOrderAmount: Number(data.minOrderAmount),

      maxDiscountAmount: data.maxDiscountAmount
        ? Number(data.maxDiscountAmount)
        : null,

      usageLimit: Number(data.usageLimit),

      expiryDate: new Date(data.expiryDate),
    };

    // ==============================
    // UPDATE
    // ==============================

    if (editData) {
      updateCoupon(
        {
          id: editData.id,
          data: formattedData,
        },
        {
          onSuccess: () => {
            toast.success("Coupon updated successfully");
            handleCloseModal();
          },

          onError: (error) => {
            toast.error(
              error?.response?.data?.message || "Failed to update coupon",
            );
          },
        },
      );

      return;
    }

    // ==============================
    // CREATE
    // ==============================

    createCoupon(formattedData, {
      onSuccess: () => {
        toast.success("Coupon created successfully");

        handleCloseModal();
      },

      onError: (error) => {
        toast.error(
          error?.response?.data?.message || "Failed to create coupon",
        );
      },
    });
  };

  // ==============================
  // CLOSE MODAL
  // ==============================

  const handleCloseModal = () => {
    setOpenModal(false);

    setEditData(null);
  };

  return (
    <div className="p-4 sm:p-6">
      {/* PAGE HEADER */}
      <div
        className="
          mb-6
          flex
          flex-col
          sm:flex-row
          sm:items-center
          sm:justify-between
          gap-4
        "
      >
        {/* LEFT */}
        <div>
          <h1
            className="
              text-2xl
              font-black
              text-slate-900
            "
          >
            Coupons
          </h1>

          <p
            className="
              text-sm
              text-slate-500
              mt-1
            "
          >
            Manage all discount coupons
          </p>
        </div>

        {/* RIGHT */}
        <Button
          text="Create Coupon"
          icon={<Plus size={18} />}
          onClick={handleCreateCoupon}
        />
      </div>

      {/* COUPONS TABLE */}
      <CouponsTable
        data={coupons}
        isLoading={isLoading}
        onEdit={handleEditCoupon}
      />

      {/* MODAL */}
      <AddCouponModal
        open={openModal}
        onClose={handleCloseModal}
        editData={editData}
        onSubmit={handleSubmitCoupon}
      />
    </div>
  );
}
