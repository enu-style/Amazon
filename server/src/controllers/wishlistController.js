import prisma from "../lib/prisma.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const getWishlist = async (req, res) => {
  try {
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    });

    return sendSuccess(
      res,
      200,
      {
        wishlist: {
          items: wishlist?.items || [],
        },
      },
      "Wishlist retrieved successfully.",
    );
  } catch (error) {
    return sendError(res, 500, "Unable to fetch wishlist.", error.message);
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return sendError(res, 400, "Product is required.");
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return sendError(res, 404, "Product not found.");
    }

    let wishlist = await prisma.wishlist.findUnique({
      where: { userId: req.user.id },
      include: {
        items: true,
      },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId: req.user.id },
        include: { items: true },
      });
    }

    const existingItem = wishlist.items.find(
      (item) => item.productId === productId,
    );
    if (existingItem) {
      return sendSuccess(
        res,
        200,
        { wishlist },
        "Item already exists in wishlist.",
      );
    }

    const item = await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId,
      },
      include: {
        product: {
          include: { images: true },
        },
      },
    });

    const updatedWishlist = await prisma.wishlist.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: {
              include: { images: true },
            },
          },
        },
      },
    });

    return sendSuccess(
      res,
      201,
      { wishlist: updatedWishlist, item },
      "Item added to wishlist.",
    );
  } catch (error) {
    return sendError(
      res,
      500,
      "Unable to add item to wishlist.",
      error.message,
    );
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: req.user.id },
      include: { items: true },
    });

    if (!wishlist) {
      return sendSuccess(
        res,
        200,
        { wishlist: { items: [] } },
        "Wishlist is empty.",
      );
    }

    const item = wishlist.items.find((entry) => entry.productId === productId);
    if (!item) {
      return sendError(res, 404, "Wishlist item not found.");
    }

    await prisma.wishlistItem.delete({ where: { id: item.id } });

    const updatedWishlist = await prisma.wishlist.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: {
              include: { images: true },
            },
          },
        },
      },
    });

    return sendSuccess(
      res,
      200,
      { wishlist: updatedWishlist },
      "Item removed from wishlist.",
    );
  } catch (error) {
    return sendError(
      res,
      500,
      "Unable to remove item from wishlist.",
      error.message,
    );
  }
};
