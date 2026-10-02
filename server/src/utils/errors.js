// Custom error class
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation Error
export class ValidationError extends AppError {
  constructor(message = "Validation failed", errors = {}) {
    super(message, 400);
    this.errors = errors;
  }
}

// Authentication Error
export class AuthenticationError extends AppError {
  constructor(message = "Authentication failed") {
    super(message, 401);
  }
}

// Authorization Error
export class AuthorizationError extends AppError {
  constructor(message = "You do not have permission to perform this action") {
    super(message, 403);
  }
}

// Not Found Error
export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

// Conflict Error
export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409);
  }
}

// Server Error
export class ServerError extends AppError {
  constructor(message = "Internal server error") {
    super(message, 500);
  }
}

// Error messages
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "Invalid email or password",
  USER_NOT_FOUND: "User not found",
  USER_ALREADY_EXISTS: "User already exists with this email",
  PASSWORD_MISMATCH: "Passwords do not match",
  PRODUCT_NOT_FOUND: "Product not found",
  CATEGORY_NOT_FOUND: "Category not found",
  ORDER_NOT_FOUND: "Order not found",
  CART_EMPTY: "Cart is empty",
  INSUFFICIENT_STOCK: "Insufficient stock available",
  UNAUTHORIZED: "You are not authorized to perform this action",
  INVALID_TOKEN: "Invalid or expired token",
  TOKEN_EXPIRED: "Token has expired",
  INTERNAL_ERROR: "Internal server error",
  VALIDATION_ERROR: "Validation failed",
  DUPLICATE_ENTRY: "This entry already exists",
  PAYMENT_FAILED: "Payment processing failed",
  INVALID_REQUEST: "Invalid request",
};
