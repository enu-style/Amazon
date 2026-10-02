import express from "express";
import {
  createOrder,
  getOrderById,
  getOrders,
} from "../controllers/orderController.js";
import { protect } from "../middleware/auth.js";
import { createCheckoutSession } from "../controllers/paymentController.js";

const router = express.Router();

router.use(protect);
router.get("/", getOrders);
router.post("/", createOrder);
router.post("/:id/checkout-session", createCheckoutSession);
router.get("/:id", getOrderById);

export default router;
