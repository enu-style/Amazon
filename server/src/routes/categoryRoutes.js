import express from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../validators/category.js";

const router = express.Router();

router.get("/", getCategories);
router.post(
  "/",
  protect,
  authorize("ADMIN"),
  validate(createCategorySchema),
  createCategory,
);
router.put(
  "/:id",
  protect,
  authorize("ADMIN"),
  validate(updateCategorySchema),
  updateCategory,
);
router.delete("/:id", protect, authorize("ADMIN"), deleteCategory);

export default router;
