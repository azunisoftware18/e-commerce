import { createSlice } from "@reduxjs/toolkit";

// ==============================
// ✅ Load from localStorage
// ==============================
const loadAddressFromStorage = () => {
  try {
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
    localStorage.setItem("address", JSON.stringify(state));
  } catch (error) {
    console.log("Storage error");
  }
};

// ==============================
// ✅ Initial State (SSR SAFE)
// ==============================
const initialState = {
  addresses: [],
  selectedAddressId: null,
};

// ==============================
// ✅ Slice
// ==============================
const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    // 🔥 Load from localStorage
    setAddress: (state, action) => {
      const data = action.payload;

      state.addresses = data?.addresses || [];
      state.selectedAddressId = data?.selectedAddressId || null;
    },

    // ➕ Add Address (FIXED)
    addAddress: (state, action) => {
      const newAddress = {
        id: Date.now(),

        // 🔥 IMPORTANT FIELDS
        firstName: action.payload.firstName || "",
        lastName: action.payload.lastName || "",
        email: action.payload.email || "",

        // 📍 ADDRESS
        address: action.payload.address || "",
        city: action.payload.city || "",
        state: action.payload.state || "",
        pinCode: action.payload.pinCode || action.payload.zip || "",
      };

      state.addresses.push(newAddress);

      // ✅ Auto select if none selected
      if (!state.selectedAddressId) {
        state.selectedAddressId = newAddress.id;
      }

      saveAddressToStorage(state);
    },

    // ❌ Remove Address
    removeAddress: (state, action) => {
      state.addresses = state.addresses.filter(
        (addr) => addr.id !== action.payload
      );

      // 🔥 If deleted address was selected
      if (state.selectedAddressId === action.payload) {
        state.selectedAddressId =
          state.addresses.length > 0 ? state.addresses[0].id : null;
      }

      saveAddressToStorage(state);
    },

    // ✅ Select Address
    selectAddress: (state, action) => {
      state.selectedAddressId = action.payload;
      saveAddressToStorage(state);
    },
  },
});

// ==============================
// ✅ Export Actions
// ==============================
export const {
  setAddress,
  addAddress,
  removeAddress,
  selectAddress,
} = addressSlice.actions;

// ==============================
// ✅ Export Reducer
// ==============================
export default addressSlice.reducer;