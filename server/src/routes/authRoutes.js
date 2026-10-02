import express from "express";
import {
  register,
  login,
  logout,
  getMe,
  updateMe,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../validators/auth.js";
import { updateProfileSchema } from "../validators/account.js";

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.patch("/me", protect, validate(updateProfileSchema), updateMe);

export default router;
