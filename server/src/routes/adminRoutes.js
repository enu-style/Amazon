import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getAdminProducts,
  getAdminCategories,
  getAdminOrders,
  getAdminOverview,
  getAdminUsers,
  updateAdminOrderStatus,
  updateAdminCustomerStatus,
} from "../controllers/adminController.js";
import { validate } from "../middleware/validate.js";
import {
  updateCustomerStatusSchema,
  updateOrderStatusSchema,
} from "../validators/admin.js";

const router = express.Router();

router.get("/overview", protect, authorize("ADMIN"), getAdminOverview);
router.get("/products", protect, authorize("ADMIN"), getAdminProducts);
router.get("/categories", protect, authorize("ADMIN"), getAdminCategories);
router.get("/orders", protect, authorize("ADMIN"), getAdminOrders);
router.get("/users", protect, authorize("ADMIN"), getAdminUsers);
router.patch(
  "/users/:id/status",
  protect,
  authorize("ADMIN"),
  validate(updateCustomerStatusSchema),
  updateAdminCustomerStatus,
);
router.patch(
  "/orders/:id/status",
  protect,
  authorize("ADMIN"),
  validate(updateOrderStatusSchema),
  updateAdminOrderStatus,
);

export default router;
