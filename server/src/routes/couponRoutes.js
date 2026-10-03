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
import { authenticate, authorizeAdmin } from "../middleware/auth.js";

const router = express.Router();

// Customer routes
router.post("/validate", authenticate, validateCoupon);

// Admin routes
router.get("/", authenticate, authorizeAdmin, getAllCoupons);
router.get("/:id", authenticate, authorizeAdmin, getCoupon);
router.get("/:id/statistics", authenticate, authorizeAdmin, getCouponStatistics);
router.post("/", authenticate, authorizeAdmin, createCoupon);
router.put("/:id", authenticate, authorizeAdmin, updateCoupon);
router.delete("/:id", authenticate, authorizeAdmin, deleteCoupon);

export default router;
