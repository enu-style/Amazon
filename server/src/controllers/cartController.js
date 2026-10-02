import prisma from "../lib/prisma.js";
import { sendSuccess, sendError } from "../utils/response.js";

const getEffectivePrice = (product) => {
  if (product.discountPrice && Number(product.discountPrice) > 0) {
    return Number(product.discountPrice);
  }
  return Number(product.price);
};

const getCartSummary = (items = []) => {
  const subtotal = items.reduce((sum, item) => {
    const unitPrice = getEffectivePrice(item.product);
    return sum + unitPrice * item.quantity;
  }, 0);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    subtotal: Number(subtotal.toFixed(2)),
    shippingFee: subtotal > 0 ? 12 : 0,
    total: Number((subtotal + (subtotal > 0 ? 12 : 0)).toFixed(2)),
    itemCount,
  };
};

export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    const summary = getCartSummary(cart?.items || []);

    return sendSuccess(
      res,
      200,
      { cart: summary },
      "Cart retrieved successfully.",
    );
  } catch (error) {
    return sendError(res, 500, "Unable to fetch cart.", error.message);
  }
};

export const addItemToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return sendError(res, 400, "Product is required.");
    }

    const normalizedQuantity = Number(quantity);
    if (!Number.isInteger(normalizedQuantity) || normalizedQuantity <= 0) {
      return sendError(res, 400, "Quantity must be a positive integer.");
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });

    if (!product) {
      return sendError(res, 404, "Product not found.");
    }

    let cart = await prisma.cart.findUnique({
      where: { userId },
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

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
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
    }

    const existingItem = cart.items.find(
      (item) => item.productId === productId,
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + normalizedQuantity;
      if (newQuantity > product.stock) {
        return sendError(
          res,
          400,
          `Only ${product.stock} units available in stock.`,
        );
      }

      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: { product: { include: { images: true } } },
      });

      const refreshedCart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: { include: { images: true } },
            },
          },
        },
      });

      return sendSuccess(
        res,
        200,
        { cart: getCartSummary(refreshedCart?.items || []), item: updatedItem },
        "Cart item updated successfully.",
      );
    }

    if (normalizedQuantity > product.stock) {
      return sendError(
        res,
        400,
        `Only ${product.stock} units available in stock.`,
      );
    }

    const newItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity: normalizedQuantity,
      },
      include: { product: { include: { images: true } } },
    });

    const refreshedCart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: { include: { images: true } },
          },
        },
      },
    });

    return sendSuccess(
      res,
      201,
      { cart: getCartSummary(refreshedCart?.items || []), item: newItem },
      "Item added to cart.",
    );
  } catch (error) {
    return sendError(res, 500, "Unable to add item to cart.", error.message);
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
      return sendError(res, 400, "Quantity must be a positive integer.");
    }

    const item = await prisma.cartItem.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!item) {
      return sendError(res, 404, "Cart item not found.");
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
    });

    if (!cart || cart.id !== item.cartId) {
      return sendError(res, 403, "You do not have access to this cart item.");
    }

    if (Number(quantity) > item.product.stock) {
      return sendError(
        res,
        400,
        `Only ${item.product.stock} units available in stock.`,
      );
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity: Number(quantity) },
      include: { product: { include: { images: true } } },
    });

    const refreshedCart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: { include: { images: true } },
          },
        },
      },
    });

    return sendSuccess(
      res,
      200,
      { cart: getCartSummary(refreshedCart?.items || []), item: updatedItem },
      "Cart item updated successfully.",
    );
  } catch (error) {
    return sendError(res, 500, "Unable to update cart item.", error.message);
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await prisma.cartItem.findUnique({
      where: { id },
      include: { cart: true },
    });

    if (!item) {
      return sendError(res, 404, "Cart item not found.");
    }

    if (item.cart.userId !== req.user.id) {
      return sendError(res, 403, "You do not have access to this cart item.");
    }

    await prisma.cartItem.delete({ where: { id } });

    const refreshedCart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: { include: { images: true } },
          },
        },
      },
    });

    return sendSuccess(
      res,
      200,
      { cart: getCartSummary(refreshedCart?.items || []) },
      "Cart item removed successfully.",
    );
  } catch (error) {
    return sendError(res, 500, "Unable to remove cart item.", error.message);
  }
};

export const clearCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
    });

    if (!cart) {
      return sendSuccess(
        res,
        200,
        { cart: getCartSummary([]) },
        "Cart is already empty.",
      );
    }

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    return sendSuccess(
      res,
      200,
      { cart: getCartSummary([]) },
      "Cart cleared successfully.",
    );
  } catch (error) {
    return sendError(res, 500, "Unable to clear cart.", error.message);
  }
};
