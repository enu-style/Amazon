import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getAdminProducts,
  getAdminOrders,
  getAdminOverview,
  updateAdminOrderStatus,
} from "../controllers/adminController.js";
import { validate } from "../middleware/validate.js";
import { updateOrderStatusSchema } from "../validators/admin.js";

const router = express.Router();

router.get("/overview", protect, authorize("ADMIN"), getAdminOverview);
router.get("/products", protect, authorize("ADMIN"), getAdminProducts);
router.get("/orders", protect, authorize("ADMIN"), getAdminOrders);
router.patch(
  "/orders/:id/status",
  protect,
  authorize("ADMIN"),
  validate(updateOrderStatusSchema),
  updateAdminOrderStatus,
);

export default router;
