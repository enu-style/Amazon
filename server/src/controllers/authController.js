import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { sendSuccess, sendError } from "../utils/response.js";

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "dev-secret",
    { expiresIn: "7d" },
  );

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return sendError(res, 409, "An account with this email already exists.");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        passwordHash,
      },
    });

    const token = signToken(user);

    return sendSuccess(
      res,
      201,
      {
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      },
      "Registration successful.",
    );
  } catch (error) {
    return sendError(res, 500, "Unable to register user.", error.message);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return sendError(res, 401, "Invalid email or password.");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return sendError(res, 401, "Invalid email or password.");
    }

    const token = signToken(user);

    return sendSuccess(
      res,
      200,
      {
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      },
      "Login successful.",
    );
  } catch (error) {
    return sendError(res, 500, "Unable to log in.", error.message);
  }
};

export const getMe = async (req, res) => {
  try {
    return sendSuccess(
      res,
      200,
      {
        user: {
          id: req.user.id,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          email: req.user.email,
          phone: req.user.phone,
          role: req.user.role,
        },
      },
      "Profile loaded.",
    );
  } catch (error) {
    return sendError(res, 500, "Unable to load profile.", error.message);
  }
};

export const updateMe = async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...req.body,
        ...(req.body.email ? { email: req.body.email.toLowerCase() } : {}),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    return sendSuccess(res, 200, { user }, "Profile updated successfully.");
  } catch (error) {
    if (error.code === "P2002") {
      return sendError(res, 409, "An account with this email already exists.");
    }

    return sendError(res, 500, "Unable to update profile.", error.message);
  }
};

export const logout = (_req, res) => {
  return sendSuccess(res, 200, {}, "Logged out successfully.");
};
