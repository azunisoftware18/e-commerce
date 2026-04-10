"use client";

import React from "react";
import { useForm } from "react-hook-form";

import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import Button from "@/components/ui/Button";
import AddressForm from "@/components/forms/AddressForm";

import { User, Mail, Phone, Calendar } from "lucide-react";

export default function CreateAccountForm({ mobile }) {

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = (data) => {

    const newUser = {
      mobile,
      ...data
    };

    console.log("Created User:", newUser);

  };

  const genderOptions = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other", value: "other" }
  ];

  return (
    <div className="w-130 bg-white p-6 rounded-lg shadow ">

      <h2 className="text-xl font-semibold mb-5">
        Create Account
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

        {/* Name */}
        <InputField
          label="Full Name"
          icon={User}
          placeholder="Enter your name"
          {...register("name", { required: "Name is required" })}
          error={errors.name?.message}
        />

        {/* Email */}
        <InputField
          label="Email"
          type="email"
          icon={Mail}
          placeholder="Enter your email"
          {...register("email")}
        />

        {/* Mobile */}
        <InputField
          type="tel"
          maxLength="10"
          label="Mobile Number"
          icon={Phone}
          value={mobile}
          isRequired
        />

        {/* DOB */}
        <InputField
          label="Date of Birth"
          type="date"
          icon={Calendar}
          {...register("dob")}
        />

        {/* Gender */}
        <SelectField
          label="Gender"
          options={genderOptions}
          {...register("gender")}
        />

        {/* Address Section */}
        <div className="mt-3">
          
          <AddressForm register={register} />
        </div>

        {/* Submit */}
        <div>
        <Button
          text="Create Profile"
          type="submit"
          className="w-full"
        />
        </div>

      </form>

    </div>
  );
}