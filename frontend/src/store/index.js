import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./slices/cartSlice";
import authReducer from "./slices/authSlice";
import addressReducer from "./slices/addressSlice";
import productReducer from "./slices/productSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    address: addressReducer,
    product: productReducer,
  },
});