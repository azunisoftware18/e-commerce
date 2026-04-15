import { createSlice } from "@reduxjs/toolkit";

// ==============================
// ✅ Load from localStorage
// ==============================
const loadAddressFromStorage = () => {
  try {
    if (typeof window === "undefined") {
      return { addresses: [], selectedAddressId: null };
    }

    const data = localStorage.getItem("address");

    return data
      ? JSON.parse(data)
      : { addresses: [], selectedAddressId: null };
  } catch (error) {
    return { addresses: [], selectedAddressId: null };
  }
};

// ==============================
// ✅ Save to localStorage
// ==============================
const saveAddressToStorage = (state) => {
  try {
    if (typeof window === "undefined") return;

    localStorage.setItem("address", JSON.stringify(state));
  } catch (error) {
    console.log("Storage error");
  }
};

// ==============================
// ✅ Initial State
// ==============================
const initialState = loadAddressFromStorage();

// ==============================
// ✅ Slice
// ==============================
const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    // 🔥 Load manually (optional)
    setAddress: (state, action) => {
      const data = action.payload;

      state.addresses = data?.addresses || [];
      state.selectedAddressId = data?.selectedAddressId || null;
    },

    // ➕ ADD ADDRESS
    addAddress: (state, action) => {
      const newAddress = {
        id: Date.now(),

        firstName: action.payload.firstName || "",
        lastName: action.payload.lastName || "",
        email: action.payload.email || "",

        address: action.payload.address || "",
        city: action.payload.city || "",
        state: action.payload.state || "",
        pinCode: action.payload.pinCode || action.payload.zip || "",
      };

      state.addresses.push(newAddress);

      // auto select first address
      if (!state.selectedAddressId) {
        state.selectedAddressId = newAddress.id;
      }

      saveAddressToStorage(state);
    },

    // ✏️ UPDATE ADDRESS (🔥 IMPORTANT)
    updateAddress: (state, action) => {
      const updatedAddress = action.payload;

      state.addresses = state.addresses.map((addr) =>
        addr.id === updatedAddress.id
          ? {
              ...addr,
              ...updatedAddress,
            }
          : addr
      );

      saveAddressToStorage(state);
    },

    // ❌ DELETE ADDRESS
    removeAddress: (state, action) => {
      state.addresses = state.addresses.filter(
        (addr) => addr.id !== action.payload
      );

      // if deleted selected address
      if (state.selectedAddressId === action.payload) {
        state.selectedAddressId =
          state.addresses.length > 0 ? state.addresses[0].id : null;
      }

      saveAddressToStorage(state);
    },

    // ✅ SELECT ADDRESS
    selectAddress: (state, action) => {
      state.selectedAddressId = action.payload;
      saveAddressToStorage(state);
    },
  },
});

// ==============================
// ✅ EXPORTS
// ==============================
export const {
  setAddress,
  addAddress,
  updateAddress, // 🔥 important
  removeAddress,
  selectAddress,
} = addressSlice.actions;

export default addressSlice.reducer;