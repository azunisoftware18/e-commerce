"use client";

import { X, TicketPercent } from "lucide-react";
import CreateCouponForm from "../forms/CouponForm";

export default function AddCouponModal({ open, onClose, onSubmit, editData }) {
  if (!open) return null;

  return (
    <div
      className="
        fixed
        inset-0
        z-9999
        flex
        items-center
        justify-center
        p-4
      "
    >
      {/* BACKDROP */}
      <div
        className="
          absolute
          inset-0
          bg-slate-900/60
          backdrop-blur-sm
          transition-opacity
        "
        onClick={onClose}
      />

      {/* MODAL */}
      <div
        className="
          relative
          bg-white
          rounded-4xl
          shadow-2xl
          w-full
          max-w-3xl
          overflow-hidden
          flex
          flex-col
          max-h-[90vh]
          animate-in
          fade-in
          zoom-in
          duration-200
        "
      >
        {/* HEADER */}
        <div
          className="
            px-8
            py-6
            border-b
            border-slate-100
            flex
            justify-between
            items-center
            bg-[#2A4150]
            z-10
          "
        >
          <div className="flex items-center gap-4">
            {/* ICON */}
            <div
              className="
                w-12
                h-12
                rounded-2xl
                bg-white/10
                text-white
                flex
                items-center
                justify-center
                backdrop-blur-sm
              "
            >
              <TicketPercent size={24} />
            </div>

            {/* TEXT */}
            <div>
              <h2 className="text-xl font-bold text-white">
                {editData ? "Edit Coupon" : "Create Coupon"}
              </h2>

              <p className="text-xs text-slate-300 mt-0.5">
                Manage discount coupons for users
              </p>
            </div>
          </div>

          {/* CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="
              p-2
              rounded-full
              text-slate-300
              hover:text-white
              hover:bg-white/10
              transition-colors
            "
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM BODY */}
        <div
          className="
            overflow-y-auto
            custom-scrollbar
          "
        >
          <CreateCouponForm
            key={editData?.id || "add"}
            title=""
            submitText={editData ? "Update Coupon" : "Create Coupon"}
            onSuccess={onClose}
            onCancel={onClose}
            onSubmit={onSubmit}
            editData={editData}
          />
        </div>
      </div>
    </div>
  );
}
