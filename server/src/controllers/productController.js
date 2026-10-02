import prisma from "../lib/prisma.js";
import { sendSuccess, sendError } from "../utils/response.js";

const buildSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

export const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sort = "relevance",
      rating,
      inStock,
    } = req.query;

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = {
        slug: category,
      };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    if (rating) {
      where.rating = {
        gte: Number(rating),
      };
    }

    if (inStock === "true") {
      where.stock = {
        gt: 0,
      };
    }

    const orderBy = {};

    switch (sort) {
      case "price_asc":
        orderBy.price = "asc";
        break;
      case "price_desc":
        orderBy.price = "desc";
        break;
      case "rating":
        orderBy.rating = "desc";
        break;
      case "newest":
        orderBy.createdAt = "desc";
        break;
      case "popular":
        orderBy.reviewCount = "desc";
        break;
      default:
        orderBy.createdAt = "desc";
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
        images: true,
      },
    });

    return sendSuccess(
      res,
      200,
      { products },
      "Products retrieved successfully.",
    );
  } catch (error) {
    return sendError(res, 500, "Unable to fetch products.", error.message);
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        reviews: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return sendError(res, 404, "Product not found.");
    }

    return sendSuccess(
      res,
      200,
      { product },
      "Product retrieved successfully.",
    );
  } catch (error) {
    return sendError(res, 500, "Unable to fetch product.", error.message);
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      stock,
      sku,
      brand,
      categoryId,
      images = [],
      slug,
    } = req.body;

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return sendError(res, 404, "Category not found.");
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug: slug || buildSlug(name),
        description,
        price,
        discountPrice: discountPrice ?? null,
        stock: Number(stock || 0),
        sku,
        brand,
        categoryId,
        rating: 0,
        reviewCount: 0,
        images: {
          create: images.map((url, index) => ({
            url,
            isPrimary: index === 0,
            altText: `${name} image ${index + 1}`,
          })),
        },
      },
      include: {
        category: true,
        images: true,
      },
    });

    return sendSuccess(res, 201, { product }, "Product created successfully.");
  } catch (error) {
    if (error.code === "P2002") {
      return sendError(
        res,
        409,
        "Product with this slug or SKU already exists.",
      );
    }

    return sendError(res, 500, "Unable to create product.", error.message);
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...payload,
        ...(payload.name && !payload.slug
          ? { slug: buildSlug(payload.name) }
          : {}),
        ...(payload.discountPrice !== undefined
          ? { discountPrice: payload.discountPrice || null }
          : {}),
      },
      include: {
        category: true,
        images: true,
      },
    });

    return sendSuccess(res, 200, { product }, "Product updated successfully.");
  } catch (error) {
    if (error.code === "P2025") {
      return sendError(res, 404, "Product not found.");
    }

    if (error.code === "P2002") {
      return sendError(
        res,
        409,
        "Product with this slug or SKU already exists.",
      );
    }

    return sendError(res, 500, "Unable to update product.", error.message);
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id },
    });

    return sendSuccess(res, 200, {}, "Product deleted successfully.");
  } catch (error) {
    if (error.code === "P2025") {
      return sendError(res, 404, "Product not found.");
    }

    return sendError(res, 500, "Unable to delete product.", error.message);
  }
};
