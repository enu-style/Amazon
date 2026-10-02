import express from "express";
import {
  createAddress,
  deleteAddress,
  getAddresses,
  updateAddress,
} from "../controllers/addressController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createAddressSchema,
  updateAddressSchema,
} from "../validators/account.js";

const router = express.Router();

router.use(protect);
router.get("/", getAddresses);
router.post("/", validate(createAddressSchema), createAddress);
router.patch("/:id", validate(updateAddressSchema), updateAddress);
router.delete("/:id", deleteAddress);

export default router;
