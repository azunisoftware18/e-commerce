"use client";

import React from "react";

import { useForm } from "react-hook-form";

import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";

import {
  TicketPercent,
  Percent,
  IndianRupee,
  Hash,
  Calendar,
} from "lucide-react";

export default function CreateCouponForm({ editData, onSubmit }) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      code: "",
      discountType: "percentage",
      discountValue: "",
      minOrderAmount: "",
      maxDiscountAmount: "",
      usageLimit: "",
      expiryDate: "",
    },
  });

  const discountType = watch("discountType");
  React.useEffect(() => {
  if (editData) {
    reset({
      code: editData.code || "",

      discountType:
        editData.discountType ||
        "percentage",

      discountValue:
        editData.discountValue || "",

      minOrderAmount:
        editData.minOrderAmount || "",

      maxDiscountAmount:
        editData.maxDiscountAmount || "",

      usageLimit:
        editData.usageLimit || "",

      expiryDate: editData.expiryDate
        ? new Date(editData.expiryDate)
            .toISOString()
            .split("T")[0]
        : "",
    });
  }
}, [editData, reset]);

  return (
    <div
      className="
        bg-white
        rounded-3xl
        
        shadow-sm
        p-5
        sm:p-6
      "
    >
      {/* FORM */}
      <form
        onSubmit={handleSubmit((data) => onSubmit?.(data))}
        className="space-y-5"
      >
        {/* ROW 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* COUPON CODE */}
          <InputField
            label="Coupon Code"
            placeholder="WELCOME10"
            icon={TicketPercent}
            isRequired
            error={errors.code?.message}
            {...register("code", {
              required: "Coupon code is required",
            })}
          />

          {/* DISCOUNT TYPE */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Discount Type
            </label>

            <select
              className="
                w-full
                border
                border-slate-300
                rounded-md
                px-3
                py-2
                text-sm
                outline-none
                focus:border-[#2A4150]
                focus:ring-2
                focus:ring-[#2A4150]/10
              "
              {...register("discountType")}
            >
              <option value="percentage">Percentage</option>

              <option value="flat">Flat</option>
            </select>
          </div>
        </div>

        {/* ROW 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* DISCOUNT VALUE */}
          <InputField
            label={
              discountType === "percentage"
                ? "Discount Percentage"
                : "Flat Discount"
            }
            type="number"
            placeholder={discountType === "percentage" ? "10" : "200"}
            icon={discountType === "percentage" ? Percent : IndianRupee}
            isRequired
            error={errors.discountValue?.message}
            {...register("discountValue", {
  required: "Discount value is required",
  valueAsNumber: true,
})}
          />

          {/* MIN ORDER */}
          <InputField
            label="Minimum Order Amount"
            type="number"
            placeholder="500"
            icon={IndianRupee}
            error={errors.minOrderAmount?.message}
            {...register("minOrderAmount", {
  valueAsNumber: true,
})}
          />
        </div>

        {/* ROW 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* MAX DISCOUNT */}
          <InputField
            label="Maximum Discount Amount"
            type="number"
            placeholder="300"
            icon={IndianRupee}
            error={errors.maxDiscountAmount?.message}
            {...register("maxDiscountAmount", {
  valueAsNumber: true,
})}
          />

          {/* USAGE LIMIT */}
          <InputField
            label="Usage Limit"
            type="number"
            placeholder="100"
            icon={Hash}
            isRequired
            error={errors.usageLimit?.message}
            {...register("usageLimit", {
  required: "Usage limit is required",
  valueAsNumber: true,
})}
          />
        </div>

        {/* ROW 4 */}
        <div className="grid grid-cols-1 gap-5">
          {/* EXPIRY DATE */}
          <InputField
            label="Expiry Date"
            type="date"
            icon={Calendar}
            isRequired
            error={errors.expiryDate?.message}
            {...register("expiryDate", {
              required: "Expiry date is required",
            })}
          />
        </div>

        {/* BUTTONS */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <Button
            type="button"
            text="Reset"
            variant="outline"
            onClick={() => reset()}
          />

          <Button
            type="submit"
            text={editData ? "Edit Coupon" : "Create Coupon"}
          />
        </div>
      </form>
    </div>
  );
}
