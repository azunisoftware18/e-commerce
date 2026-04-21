"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import Button from "../ui/Button";
import TextAreaField from "../ui/TextAreaField";
import InputField from "../ui/InputField";

export default function ConsultationForm({
  title = "",
  showSubmitButton = true,
  onSubmitForm,
  isSubmitting = false,
}) {
  const {
    register,
    handleSubmit,
    watch,
    unregister,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      healthIssues: [],
    },
  });

  const selectedIssues = watch("healthIssues") || [];

  const onSubmit = async (data) => {
  if (onSubmitForm) {
    await onSubmitForm(data); 
  }

  reset(); 
};

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">
      <h1 className="text-3xl font-bold mb-6">{title}</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        id="checkout-form"
      >
        {/* Name Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="First Name"
            placeholder="First Name"
            isRequired
            error={errors.firstName?.message}
            {...register("firstName", {
              required: "First name is required",
            })}
          />

          <InputField
            label="Last Name"
            placeholder="Last Name"
            isRequired
            error={errors.lastName?.message}
            {...register("lastName", {
              required: "Last name is required",
            })}
          />
        </div>

        {/* Age */}
        <InputField
          label="Age"
          placeholder="Ex. 22"
          type="number"
          isRequired
          error={errors.age?.message}
          {...register("age", {
            required: "Age is required",
            min: { value: 1, message: "Invalid age" },
          })}
        />

        {/* Weight */}
        <InputField
          label="Weight (in kg)"
          placeholder="Ex. 45"
          type="number"
          isRequired
          error={errors.weight?.message}
          {...register("weight", {
            required: "Weight is required",
          })}
        />

        {/* Phone */}
        <InputField
          label="Phone/Mobile (With Country Code)"
          placeholder="917750824146"
          isRequired
          error={errors.phone?.message}
          {...register("phone", {
            required: "Phone is required",
            pattern: {
              value: /^[0-9]+$/,
              message: "Only numbers allowed",
            },
          })}
        />

        {/* Email */}
        <InputField
          label="Email"
          placeholder="Email Address"
          error={errors.email?.message}
          {...register("email", {
            pattern: {
              value: /^\S+@\S+$/i,
              message: "Invalid email",
            },
          })}
        />

        {/* Health Issues */}
        <div>
          <label className="text-sm font-medium text-slate-700">
            Health Issues (Select At least One) *
          </label>

          <div className="mt-2 space-y-2">
            {[
              "Thyroid",
              "Weight gain",
              "Hormonal issues",
              "Hair Fall",
              "Pigmentation",
              "Others: Not sure about the exact issue",
            ].map((issue) => (
              <label key={issue} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={issue}
                  {...register("healthIssues", {
                    validate: (value) =>
                      value?.length > 0 || "Select at least one issue",
                  })}
                />
                {issue}
              </label>
            ))}
          </div>

          {errors.healthIssues && (
            <p className="text-red-500 text-sm mt-1">
              {errors.healthIssues.message}
            </p>
          )}

          {/* ✅ Show textarea only if "Other" selected */}
        </div>

        {/* Submit */}
        {showSubmitButton && (
          <Button
            type="submit"
            text={isSubmitting ? "Submitting..." : "Submit Form"}
            disabled={isSubmitting}
            className="mt-4 px-6 py-2 rounded-md"
            form="checkout-form"
          />
        )}
      </form>
    </div>
  );
}
