import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  openLoginModal: false,
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
  },
});

export const { setUser, logout, openLogin, closeLogin } = authSlice.actions;
export default authSlice.reducer;
