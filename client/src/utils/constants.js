// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

// User Roles
export const ROLES = {
  CUSTOMER: "CUSTOMER",
  ADMIN: "ADMIN",
};

// Order Statuses
export const ORDER_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

// Payment Statuses
export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
};

// Products Per Page
export const PRODUCTS_PER_PAGE = 12;

// Sorting Options
export const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating_desc", label: "Highest Rated" },
  { value: "newest", label: "Newest" },
  { value: "best_selling", label: "Best Selling" },
];

// Price Ranges
export const PRICE_RANGES = [
  { min: 0, max: 50, label: "$0 - $50" },
  { min: 50, max: 100, label: "$50 - $100" },
  { min: 100, max: 500, label: "$100 - $500" },
  { min: 500, max: 1000, label: "$500 - $1000" },
  { min: 1000, max: 5000, label: "$1000 - $5000" },
];

// Rating Filter
export const RATING_FILTERS = [
  { value: 5, label: "⭐⭐⭐⭐⭐ 5 Stars" },
  { value: 4, label: "⭐⭐⭐⭐ 4+ Stars" },
  { value: 3, label: "⭐⭐⭐ 3+ Stars" },
  { value: 2, label: "⭐⭐ 2+ Stars" },
  { value: 1, label: "⭐ 1+ Stars" },
];

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  PRODUCT_NAME_MIN_LENGTH: 3,
  PRODUCT_DESCRIPTION_MIN_LENGTH: 10,
  REVIEW_MIN_LENGTH: 10,
};

// Local Storage Keys
export const STORAGE_KEYS = {
  USER: "user",
  TOKEN: "token",
  CART: "cart",
  WISHLIST: "wishlist",
  RECENTLY_VIEWED: "recently_viewed",
};

// Toast Messages
export const TOAST_MESSAGES = {
  SUCCESS: "Operation successful",
  ERROR: "An error occurred",
  LOADING: "Loading...",
  ADDED_TO_CART: "Product added to cart",
  REMOVED_FROM_CART: "Product removed from cart",
  ADDED_TO_WISHLIST: "Product added to wishlist",
  REMOVED_FROM_WISHLIST: "Product removed from wishlist",
  LOGIN_SUCCESS: "Login successful",
  LOGOUT_SUCCESS: "Logout successful",
  REGISTRATION_SUCCESS: "Registration successful",
  ORDER_CREATED: "Order created successfully",
  PAYMENT_SUCCESS: "Payment successful",
  PAYMENT_FAILED: "Payment failed",
};

// Env Variables
export const ENV = {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_STRIPE_PUBLIC_KEY: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
  VITE_CLOUDINARY_CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
};
