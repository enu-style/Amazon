import prisma from "../lib/prisma.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { calculateAdminOverview } from "../utils/adminStats.js";
import {
  canTransitionOrderStatus,
  getAllowedOrderStatuses,
} from "../utils/adminOrderStatus.js";

const orderStatuses = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export const getAdminOverview = async (_req, res) => {
  try {
    const [
      totalProducts,
      totalCustomers,
      totalOrders,
      paidRevenueSummary,
      lowStockCount,
      pendingOrders,
      recentOrders,
    ] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: "CUSTOMER", isActive: true } }),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { paymentStatus: "PAID" },
        _sum: { total: true },
      }),
      prisma.product.count({
        where: { isActive: true, stock: { lt: 10 } },
      }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
    ]);

    const totalRevenue = Number(paidRevenueSummary._sum.total || 0);

    const overview = calculateAdminOverview({
      totalProducts,
      totalCustomers,
      totalOrders,
      totalRevenue,
      lowStockCount,
      pendingOrders,
    });

    return sendSuccess(
      res,
      200,
      {
        overview,
        recentOrders: recentOrders.map((order) => ({
          id: order.id,
          total: Number(order.total || 0),
          status: order.status,
          createdAt: order.createdAt,
          customer: order.user
            ? `${order.user.firstName} ${order.user.lastName}`.trim() ||
              order.user.email
            : "Unknown customer",
          email: order.user?.email || "N/A",
        })),
      },
      "Admin overview retrieved successfully.",
    );
  } catch (error) {
    return sendError(res, 500, "Unable to load admin overview.", error.message);
  }
};

export const getAdminProducts = async (_req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        category: { select: { id: true, name: true } },
        images: true,
      },
    });

    return sendSuccess(
      res,
      200,
      { products },
      "Products retrieved successfully.",
    );
  } catch (error) {
    return sendError(
      res,
      500,
      "Unable to fetch admin products.",
      error.message,
    );
  }
};

export const getAdminOrders = async (req, res) => {
  try {
    const requestedPage = Number.parseInt(req.query.page, 10);
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const page =
      Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const limit =
      Number.isInteger(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, 100)
        : 20;
    const status = req.query.status;

    if (status && !orderStatuses.includes(status)) {
      return sendError(res, 400, "Invalid order status filter.");
    }

    const where = status ? { status } : {};
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true },
          },
          items: {
            select: {
              id: true,
              quantity: true,
              product: { select: { name: true } },
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return sendSuccess(
      res,
      200,
      {
        orders: orders.map((order) => ({
          id: order.id,
          status: order.status,
          paymentStatus: order.paymentStatus,
          total: Number(order.total),
          createdAt: order.createdAt,
          customer: order.user
            ? `${order.user.firstName} ${order.user.lastName}`.trim() ||
              order.user.email
            : "Unknown customer",
          email: order.user?.email || "N/A",
          items: order.items,
          allowedStatuses: getAllowedOrderStatuses(order.status),
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      "Orders retrieved successfully.",
    );
  } catch (error) {
    return sendError(res, 500, "Unable to fetch admin orders.", error.message);
  }
};

export const updateAdminOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const currentOrder = await prisma.order.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!currentOrder) {
      return sendError(res, 404, "Order not found.");
    }

    if (!canTransitionOrderStatus(currentOrder.status, status)) {
      return sendError(
        res,
        409,
        `Order cannot transition from ${currentOrder.status} to ${status}.`,
      );
    }

    const updated = await prisma.order.updateMany({
      where: { id, status: currentOrder.status },
      data: { status },
    });

    if (updated.count === 0) {
      return sendError(
        res,
        409,
        "Order status changed; refresh and try again.",
      );
    }

    const order = await prisma.order.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    return sendSuccess(
      res,
      200,
      { order, allowedStatuses: getAllowedOrderStatuses(order.status) },
      "Order status updated successfully.",
    );
  } catch (error) {
    return sendError(res, 500, "Unable to update order status.", error.message);
  }
};
