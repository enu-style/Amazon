// Format price for display
export const formatPrice = (price) => {
  if (!price) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
};

// Calculate discount percentage
export const calculateDiscount = (originalPrice, discountPrice) => {
  if (!originalPrice || !discountPrice) return 0;
  return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
};

// Format date
export const formatDate = (date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};

// Format date and time
export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

// Validate email
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate password (min 8 chars, 1 uppercase, 1 number, 1 special)
export const validatePassword = (password) => {
  const re =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return re.test(password);
};

// Truncate text
export const truncateText = (text, length = 100) => {
  if (!text) return "";
  return text.length > length ? text.substring(0, length) + "..." : text;
};

// Capitalize first letter
export const capitalizeFirstLetter = (string) => {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Generate slug
export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Get rating color
export const getRatingColor = (rating) => {
  if (rating >= 4.5) return "text-green-600";
  if (rating >= 3.5) return "text-yellow-500";
  if (rating >= 2.5) return "text-orange-500";
  return "text-red-600";
};

// Format rating
export const formatRating = (rating) => {
  if (!rating) return "0.0";
  return parseFloat(rating).toFixed(1);
};
