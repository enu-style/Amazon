import prisma from "../lib/prisma.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const getCategories = async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: {
        products: true,
      },
    });

    return sendSuccess(
      res,
      200,
      { categories },
      "Categories retrieved successfully.",
    );
  } catch (error) {
    return sendError(res, 500, "Unable to fetch categories.", error.message);
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, slug, description, image, isActive = true } = req.body;

    const category = await prisma.category.create({
      data: {
        name,
        slug:
          slug ||
          name
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, ""),
        description,
        image,
        isActive,
      },
    });

    return sendSuccess(
      res,
      201,
      { category },
      "Category created successfully.",
    );
  } catch (error) {
    if (error.code === "P2002") {
      return sendError(res, 409, "Category already exists.");
    }

    return sendError(res, 500, "Unable to create category.", error.message);
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...payload,
        ...(payload.slug ? {} : {}),
        ...(payload.name && !payload.slug
          ? {
              slug: payload.name
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, ""),
            }
          : {}),
      },
    });

    return sendSuccess(
      res,
      200,
      { category },
      "Category updated successfully.",
    );
  } catch (error) {
    if (error.code === "P2025") {
      return sendError(res, 404, "Category not found.");
    }

    if (error.code === "P2002") {
      return sendError(res, 409, "Category already exists.");
    }

    return sendError(res, 500, "Unable to update category.", error.message);
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.update({
      where: { id },
      data: { isActive: false },
    });

    return sendSuccess(
      res,
      200,
      { category },
      "Category deactivated successfully.",
    );
  } catch (error) {
    if (error.code === "P2025") {
      return sendError(res, 404, "Category not found.");
    }

    return sendError(res, 500, "Unable to delete category.", error.message);
  }
};
