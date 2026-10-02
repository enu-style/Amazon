import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    setProductsLoading: (state, action) => {
      state.loading = action.payload;
    },
    setProductsError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setProducts, setProductsLoading, setProductsError } =
  productsSlice.actions;
export default productsSlice.reducer;
