import express from "express";
import multer from "multer";
import { uploadProductImages } from "../controllers/uploadController.js";
import { protect, authorize } from "../middleware/auth.js";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "../utils/constants.js";
import { sendError } from "../utils/response.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE, files: 8 },
  fileFilter: (req, file, callback) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      req.invalidImageType = true;
      callback(null, false);
      return;
    }

    callback(null, true);
  },
});

router.post(
  "/products",
  protect,
  authorize("ADMIN"),
  (req, res, next) => {
    upload.array("images", 8)(req, res, (error) => {
      if (!error) {
        next();
        return;
      }

      if (
        error instanceof multer.MulterError &&
        error.code === "LIMIT_FILE_SIZE"
      ) {
        return sendError(res, 413, "Each image must be 10 MB or smaller.");
      }

      return sendError(res, 400, "Unable to process the selected images.");
    });
  },
  uploadProductImages,
);

export default router;
