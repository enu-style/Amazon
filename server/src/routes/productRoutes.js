import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { createProductReview } from "../controllers/reviewController.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../validators/product.js";

const router = express.Router();

router.get("/", getProducts);
router.post("/:id/reviews", protect, createProductReview);
router.get("/:id", getProductById);
router.post(
  "/",
  protect,
  authorize("ADMIN"),
  validate(createProductSchema),
  createProduct,
);
router.put(
  "/:id",
  protect,
  authorize("ADMIN"),
  validate(updateProductSchema),
  updateProduct,
);
router.delete("/:id", protect, authorize("ADMIN"), deleteProduct);

export default router;
