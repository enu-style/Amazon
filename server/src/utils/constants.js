// User Roles
export const USER_ROLES = {
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

// Pagination Defaults
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 12;
export const MAX_LIMIT = 100;

// JWT Configuration
export const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";
export const JWT_REFRESH_EXPIRE = "30d";

// Password Requirements
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Validation Limits
export const LIMITS = {
  PRODUCT_NAME_MIN: 3,
  PRODUCT_NAME_MAX: 200,
  DESCRIPTION_MIN: 10,
  DESCRIPTION_MAX: 5000,
  REVIEW_MIN: 10,
  REVIEW_MAX: 1000,
  SKU_MAX: 50,
  CATEGORY_NAME_MAX: 100,
};

// AWS/Cloudinary Configuration
export const CLOUDINARY_FOLDER = "shopsphere";
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

// Email Templates
export const EMAIL_TEMPLATES = {
  ORDER_CONFIRMATION: "order_confirmation",
  PAYMENT_FAILED: "payment_failed",
  SHIPMENT_NOTIFICATION: "shipment_notification",
  PASSWORD_RESET: "password_reset",
  WELCOME: "welcome",
};

// API Rate Limiting
export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
};

// Stripe Configuration
export const STRIPE_CURRENCY = "usd";

// Cache TTL (in seconds)
export const CACHE_TTL = {
  PRODUCTS: 3600, // 1 hour
  CATEGORIES: 7200, // 2 hours
  USER: 1800, // 30 minutes
};
