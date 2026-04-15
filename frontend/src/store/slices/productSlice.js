import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedProduct: null,
  isModalOpen: false,
  filters: {
    search: "",
    category: "All",
  },
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },

    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },

    openProductModal: (state) => {
      state.isModalOpen = true;
    },

    closeProductModal: (state) => {
      state.isModalOpen = false;
    },

    setSearch: (state, action) => {
      state.filters.search = action.payload;
    },

    setCategoryFilter: (state, action) => {
      state.filters.category = action.payload;
    },
  },
});

export const {
  setSelectedProduct,
  clearSelectedProduct,
  openProductModal,
  closeProductModal,
  setSearch,
  setCategoryFilter,
} = productSlice.actions;

export default productSlice.reducer;