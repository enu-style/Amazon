export const calculateAdminOverview = (metrics = {}) => {
  const safeMetrics = metrics && typeof metrics === "object" ? metrics : {};

  return {
    totalProducts: Number(safeMetrics.totalProducts) || 0,
    totalCustomers: Number(safeMetrics.totalCustomers) || 0,
    totalOrders: Number(safeMetrics.totalOrders) || 0,
    totalRevenue: Number(safeMetrics.totalRevenue) || 0,
    lowStockCount: Number(safeMetrics.lowStockCount) || 0,
    pendingOrders: Number(safeMetrics.pendingOrders) || 0,
  };
};
