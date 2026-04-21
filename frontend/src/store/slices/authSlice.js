import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  openLoginModal: false,
  isAuthChecked: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;

      localStorage.removeItem("user");
    },
    openLogin: (state) => {
      state.openLoginModal = true;
    },

    closeLogin: (state) => {
      state.openLoginModal = false;
    },
    setAuthChecked: (state) => {
      state.isAuthChecked = true;
    },
  },
});

export const { setUser, logout, openLogin, closeLogin, setAuthChecked } = authSlice.actions;
export default authSlice.reducer;
