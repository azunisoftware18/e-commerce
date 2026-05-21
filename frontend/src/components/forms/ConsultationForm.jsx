"use client";

import React from "react";
import { useForm } from "react-hook-form";
import Button from "../ui/Button";
import InputField from "../ui/InputField";

export default function ConsultationForm({
  title = "Book a Consultation",
  showSubmitButton = true,
  onSubmitForm,
  isSubmitting = false,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      healthIssues: [],
    },
  });

  const onSubmit = async (data) => {
    if (onSubmitForm) {
      await onSubmitForm(data);
    }
    reset();
  };

  return (
    /* Box padding badha kar p-8 sm:p-10 kiya gaya hai design ko breath karne ke liye */
    <div className="w-full max-w-3xl mx-auto bg-white p-8 sm:p-10 border border-slate-100 rounded-4xl shadow-xl overflow-hidden">
      {title && (
        <h1 className="text-3xl font-bold mb-8 text-[#2A4150] tracking-tight border-b border-slate-100 pb-4">
          {title}
        </h1>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
        id="checkout-form"
      >
        {/* Name Row - Gap badha kar 6 kiya hai */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="First Name"
            placeholder="Enter your first name"
            isRequired
            error={errors.firstName?.message}
            className="rounded-xl border-slate-200 focus:border-[#2A4150] h-11 text-sm"
            {...register("firstName", {
              required: "First name is required",
            })}
          />

          <InputField
            label="Last Name"
            placeholder="Enter your last name"
            isRequired
            error={errors.lastName?.message}
            className="rounded-xl border-slate-200 focus:border-[#2A4150] h-11 text-sm"
            {...register("lastName", {
              required: "Last name is required",
            })}
          />
        </div>

        {/* Age & Weight Row - Isko grid me daal diya taaki desktop par vertical space bache */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Age"
            placeholder="Enter your age"
            type="number"
            isRequired
            error={errors.age?.message}
            className="rounded-xl border-slate-200 focus:border-[#2A4150] h-11 text-sm"
            {...register("age", {
              required: "Age is required",
              min: { value: 1, message: "Invalid age" },
            })}
          />

          <InputField
            label="Weight (in kg)"
            placeholder="Enter your weight"
            type="number"
            isRequired
            error={errors.weight?.message}
            className="rounded-xl border-slate-200 focus:border-[#2A4150] h-11 text-sm"
            {...register("weight", {
              required: "Weight is required",
            })}
          />
        </div>

        {/* Phone - Clean Label aur Natural Placeholder */}
        <InputField
          label="Phone Number"
          placeholder="Enter your phone number"
          isRequired
          error={errors.phone?.message}
          className="rounded-xl border-slate-200 focus:border-[#2A4150] h-11 text-sm"
          {...register("phone", {
            required: "Phone number is required",
            pattern: {
              value: /^[0-9+() \-]+$/,
              message: "Please enter a valid phone number",
            },
          })}
        />

        {/* Email */}
        <InputField
          label="Email Address"
          placeholder="Enter your email address"
          error={errors.email?.message}
          className="rounded-xl border-slate-200 focus:border-[#2A4150] h-11 text-sm"
          {...register("email", {
            pattern: {
              value: /^\S+@\S+$/i,
              message: "Invalid email address",
            },
          })}
        />

        {/* Health Issues */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700 ml-1">
            Health Issues <span className="text-xs font-normal text-slate-500">(Select at least one)</span> *
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            {[
              "Thyroid",
              "Weight gain",
              "Hormonal issues",
              "Hair Fall",
              "Pigmentation",
              "Others: Not sure about the exact issue",
            ].map((issue) => (
              <label key={issue} className="flex items-center gap-3 px-2 py-1.5 cursor-pointer hover:bg-slate-100/50 rounded-lg transition-colors text-sm text-slate-600 font-medium">
                <input
                  type="checkbox"
                  value={issue}
                  className="w-4 h-4 rounded border-slate-300 text-[#2A4150] focus:ring-[#2A4150]"
                  {...register("healthIssues", {
                    validate: (value) =>
                      value?.length > 0 || "Please select at least one issue",
                  })}
                />
                {issue}
              </label>
            ))}
          </div>

          {errors.healthIssues && (
            <p className="text-red-500 text-xs font-semibold ml-1 mt-1">
              {errors.healthIssues.message}
            </p>
          )}
        </div>

        {/* Submit Button - Premium Gradient added to match login page */}
        {showSubmitButton && (
          <div className="pt-2">
            <Button
              type="submit"
              text={isSubmitting ? "Submitting..." : "Submit Form"}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-[#2A4150] to-[#1a3340] 
                text-white hover:from-[#1a3340] hover:to-[#2A4150] font-bold text-sm
                transition-all duration-300 shadow-lg shadow-[#2A4150]/10 active:scale-[0.98]"
              form="checkout-form"
            />
          </div>
        )}
      </form>
    </div>
  );
}