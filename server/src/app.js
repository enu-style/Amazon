import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import paymentRoutes from "./routes/paymentRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const appDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(appDirectory, "../.env") });
dotenv.config({ path: path.resolve(appDirectory, "../../.env") });

const app = express();
const allowedClientOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
];

if (process.env.NODE_ENV !== "production") {
  allowedClientOrigins.push(
    ...[5173, 5174].flatMap((port) => [
      `http://localhost:${port}`,
      `http://127.0.0.1:${port}`,
    ]),
  );
}

app.use(
  cors({
    origin: allowedClientOrigins,
    credentials: true,
  }),
);

app.use(helmet());
app.use(compression());
app.use(morgan("dev"));
app.use(cookieParser());
app.use("/api/payments", paymentRoutes);
app.use("/api/uploads", uploadRoutes);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "ShopSphere API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/coupons", couponRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
