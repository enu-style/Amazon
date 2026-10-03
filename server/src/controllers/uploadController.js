import { sendSuccess, sendError } from "../utils/response.js";
import {
  getCloudinaryClient,
  uploadImageBuffer,
} from "../services/cloudinaryService.js";

export const uploadProductImages = async (req, res) => {
  if (!getCloudinaryClient()) {
    return sendError(res, 503, "Image storage is not configured.");
  }

  if (req.invalidImageType) {
    return sendError(res, 400, "Only JPG, PNG, and WebP images are allowed.");
  }

  if (!req.files?.length) {
    return sendError(res, 400, "Select at least one image to upload.");
  }

  try {
    const client = getCloudinaryClient();
    const images = await Promise.all(
      req.files.map((file) => uploadImageBuffer(client, file.buffer)),
    );

    return sendSuccess(res, 201, { images }, "Images uploaded successfully.");
  } catch {
    return sendError(
      res,
      502,
      "Cloudinary could not store the selected images.",
    );
  }
};
