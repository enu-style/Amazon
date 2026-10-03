import express from "express";
import {
  getAllCoupons,
  getCoupon,
  validateCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getCouponStatistics,
} from "../controllers/couponController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Customer routes
router.post("/validate", protect, validateCoupon);

// Admin routes
router.get("/", protect, authorize("ADMIN"), getAllCoupons);
router.get("/:id", protect, authorize("ADMIN"), getCoupon);
router.get("/:id/statistics", protect, authorize("ADMIN"), getCouponStatistics);
router.post("/", protect, authorize("ADMIN"), createCoupon);
router.put("/:id", protect, authorize("ADMIN"), updateCoupon);
router.delete("/:id", protect, authorize("ADMIN"), deleteCoupon);

export default router;
