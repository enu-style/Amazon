import test from "node:test";
import assert from "node:assert/strict";
import { calculateAdminOverview } from "../src/utils/adminStats.js";
import { canTransitionOrderStatus } from "../src/utils/adminOrderStatus.js";

test("calculateAdminOverview returns summary metrics for dashboard cards", () => {
  const result = calculateAdminOverview({
    totalProducts: 18,
    totalCustomers: 420,
    totalOrders: 206,
    totalRevenue: 25420,
    lowStockCount: 5,
    pendingOrders: 14,
  });

  assert.deepEqual(result, {
    totalProducts: 18,
    totalCustomers: 420,
    totalOrders: 206,
    totalRevenue: 25420,
    lowStockCount: 5,
    pendingOrders: 14,
  });
});

test("calculateAdminOverview normalizes invalid input to zeroes", () => {
  const result = calculateAdminOverview(null);

  assert.deepEqual(result, {
    totalProducts: 0,
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockCount: 0,
    pendingOrders: 0,
  });
});

test("order status transitions follow the fulfillment lifecycle", () => {
  assert.equal(canTransitionOrderStatus("PENDING", "CONFIRMED"), true);
  assert.equal(canTransitionOrderStatus("CONFIRMED", "PROCESSING"), true);
  assert.equal(canTransitionOrderStatus("PROCESSING", "SHIPPED"), true);
  assert.equal(canTransitionOrderStatus("SHIPPED", "DELIVERED"), true);
  assert.equal(canTransitionOrderStatus("CONFIRMED", "CANCELLED"), true);
});

test("order status transitions reject invalid jumps and terminal changes", () => {
  assert.equal(canTransitionOrderStatus("PENDING", "SHIPPED"), false);
  assert.equal(canTransitionOrderStatus("DELIVERED", "CANCELLED"), false);
  assert.equal(canTransitionOrderStatus("CANCELLED", "CONFIRMED"), false);
  assert.equal(canTransitionOrderStatus("PROCESSING", "PROCESSING"), false);
});
