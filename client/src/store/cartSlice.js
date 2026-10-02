import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  totalItems: 0,
  subtotal: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const existing = state.items.find(
        (item) => item.id === action.payload.id,
      );

      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }

      state.totalItems = state.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      state.subtotal = state.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      state.totalItems = state.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      state.subtotal = state.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
    },
    updateQuantity: (state, action) => {
      const item = state.items.find((entry) => entry.id === action.payload.id);
      if (!item) return;

      item.quantity = action.payload.quantity;
      state.totalItems = state.items.reduce(
        (sum, entry) => sum + entry.quantity,
        0,
      );
      state.subtotal = state.items.reduce(
        (sum, entry) => sum + entry.price * entry.quantity,
        0,
      );
    },
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.subtotal = 0;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
