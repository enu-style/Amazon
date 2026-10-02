const allowedTransitions = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export const canTransitionOrderStatus = (currentStatus, nextStatus) =>
  allowedTransitions[currentStatus]?.includes(nextStatus) || false;

export const getAllowedOrderStatuses = (currentStatus) =>
  allowedTransitions[currentStatus] || [];
