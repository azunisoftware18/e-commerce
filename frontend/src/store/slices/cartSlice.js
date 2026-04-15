import { createSlice } from "@reduxjs/toolkit";

const loadCartFromStorage = () => {
  try {
    const data = localStorage.getItem("cart");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
};

const saveCartToStorage = (items) => {
  try {
    localStorage.setItem("cart", JSON.stringify(items));
  } catch (error) {
    console.log("Storage error");
  }
};

const initialState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
  setCart: (state, action) => {
    state.items = action.payload;
  },

  addToCart: (state, action) => {
    const exist = state.items.find(
      (item) => item.id === action.payload.id
    );

    if (exist) {
      exist.quantity += 1;
    } else {
      state.items.push({ ...action.payload, quantity: 1 });
    }

    saveCartToStorage(state.items);
  },

  removeFromCart: (state, action) => {
    state.items = state.items.filter(
      (item) => item.id !== action.payload
    );

    saveCartToStorage(state.items);
  },

  updateQty: (state, action) => {
    const { id, delta } = action.payload;
    const item = state.items.find((i) => i.id === id);

    if (item) {
      item.quantity = Math.max(1, item.quantity + delta);
    }

    saveCartToStorage(state.items);
  },
},
});

export const { setCart, addToCart, removeFromCart, updateQty } =
  cartSlice.actions;

export default cartSlice.reducer;