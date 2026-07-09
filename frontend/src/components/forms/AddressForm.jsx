"use client";

import React, { useEffect, useState } from "react";
import InputField from "@/components/ui/InputField";
import TextAreaField from "@/components/ui/TextAreaField";
import SelectField from "@/components/ui/SelectField";
import { MapPin } from "lucide-react";
import { useCities, useLocationByPincode, useStates } from "@/lib/queries/location.query";

export default function AddressForm({
  register,
  errors = {},
  value = {},
  onChange,
  className = "",
  fields = {
    firstName: true,
    lastName: true,
    email: true,
    pinCode: true,
    city: true,
    state: true,
    address: true,
  },
}) {
  const [selectedState, setSelectedState] = useState(value?.state || "");

  const { data: states = [] } = useStates();
  const { data: cities = [] } = useCities(selectedState);
  const { data: location } = useLocationByPincode(value?.pinCode);

  const handleChange = (name, val) => {
    if (!onChange) return;
    onChange({
      ...value,
      [name]: val,
    });
  };

  const getProps = (name, validation = {}) => {
    if (register) return register(name, validation);

    return {
      name,
      value: value?.[name] || "",
      onChange: (e) => handleChange(name, e.target.value),
    };
  };

  useEffect(() => {
  if (value?.state) {
    setSelectedState(value.state);
  }
}, [value?.state]);

useEffect(() => {
  if (!location || !onChange) return;

  setSelectedState(location.state);

  onChange((prev) => ({
    ...prev,
    state: location.state,
    city: location.city,
  }));
}, [location, onChange]);

useEffect(() => {
  console.log("Selected State:", selectedState);
  console.log("Form State:", value.state);
}, [selectedState, value.state]);

  return (
    <div className={`grid grid-cols-2 gap-x-5 gap-y-4  ${className}`}>
      {/* FIRST NAME */}
      {fields.firstName && (
        <InputField
          label="First Name"
          placeholder="Enter first name"
          {...getProps("firstName", {
            required: "First name is required",
            minLength: { value: 2, message: "Too short" },
          })}
          error={errors.firstName?.message}
        />
      )}
      {/* LAST NAME */}
      {fields.lastName && (
        <InputField
          label="Last Name"
          placeholder="Enter last name"
          {...getProps("lastName")}
          error={errors.lastName?.message}
        />
      )}  

      {/* EMAIL */}
      {fields.email && (
        <InputField
          label="Email"
          type="email"
          placeholder="Enter email"
          {...getProps("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Invalid email",
            },
          })}
          error={errors.email?.message}
        />
      )}
      {/* PIN */}
      {fields.pinCode && (
  <InputField
    pattern="[0-9]{6}"
    type="text"
    label="PIN Code"
    placeholder="6-digit PIN"
    maxLength={6}
    icon={MapPin}
    {...getProps("pinCode", {
      required: "PIN Code is required",
      pattern: { value: /^[0-9]{6}$/, message: "Invalid PIN Code" },
    })}
    error={errors.pinCode?.message}
  />
)}

      {/* STATE */}
      {fields.state && (
        <SelectField
          label="State"
          placeholder="Select State"
          options={states.map((s) => ({ label: s, value: s }))}
          {...getProps("state", { required: "State is required" })}
          error={errors.state?.message}
          onChange={(e) => {
            const val = e.target.value;
            setSelectedState(val);

            if (register) {
              register("state").onChange(e);
            } else {
              handleChange("state", val);
            }
            handleChange("city", ""); 
          }}
        />
      )}

      {/* CITY */}
      {fields.city && (
        <SelectField
          label="City"
          placeholder="Select City"
          options={cities.map((c) => ({ label: c, value: c }))}
          disabled={!selectedState}
          {...getProps("city", { required: "City is required" })}
          error={errors.city?.message}
        />
      )}

      {/* ADDRESS */}
      {fields.address && (
        <div className="col-span-2">
          <TextAreaField
            label="Complete Address"
            placeholder="House No, Street, Landmark, Area..."
            rows={3}
            {...getProps("address", {
              required: "Address is required",
              minLength: {
                value: 10,
                message: "Please enter detailed address",
              },
            })}
            error={errors.address?.message}
            className="resize-none"
          />
        </div>
      )}
    </div>
  );
}
