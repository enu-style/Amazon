import prisma from "../lib/prisma.js";
import { sendSuccess, sendError } from "../utils/response.js";

const getUnitPrice = (product) => {
  if (product.discountPrice && Number(product.discountPrice) > 0) {
    return Number(product.discountPrice);
  }
  return Number(product.price);
};

export const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: req.user.id,
      },
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
        shippingAddress: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return sendSuccess(res, 200, { orders }, "Orders retrieved successfully.");
  } catch (error) {
    return sendError(res, 500, "Unable to fetch orders.", error.message);
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
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
        shippingAddress: true,
      },
    });

    if (!order) {
      return sendError(res, 404, "Order not found.");
    }

    if (order.userId !== req.user.id) {
      return sendError(res, 403, "You do not have access to this order.");
    }

    return sendSuccess(res, 200, { order }, "Order retrieved successfully.");
  } catch (error) {
    return sendError(res, 500, "Unable to fetch order.", error.message);
  }
};

export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingAddressId, notes, shippingAddress } = req.body;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return sendError(res, 400, "Your cart is empty.");
    }

    let address = null;

    if (shippingAddressId) {
      address = await prisma.address.findFirst({
        where: { id: shippingAddressId, userId },
      });

      if (!address) {
        return sendError(res, 404, "Saved address not found.");
      }
    }

    const subtotal = cart.items.reduce((sum, item) => {
      const unitPrice = getUnitPrice(item.product);
      return sum + unitPrice * item.quantity;
    }, 0);

    const shippingFee = subtotal > 0 ? 12 : 0;
    const tax = subtotal * 0.08;
    const total = subtotal + shippingFee + tax;

    const order = await prisma.$transaction(async (tx) => {
      let shippingAddressRecord = address;

      if (!shippingAddressRecord && shippingAddress) {
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
        shippingAddressRecord = await tx.address.create({
          data: {
            userId,
            fullName: shippingAddress.fullName,
            line1: shippingAddress.line1,
            line2: shippingAddress.line2 || null,
            city: shippingAddress.city,
            state: shippingAddress.state,
            postalCode: shippingAddress.postalCode,
            country: shippingAddress.country || "US",
            phone: shippingAddress.phone || null,
            email: shippingAddress.email || req.user.email,
            isDefault: true,
          },
        });
      }

      const createdOrder = await tx.order.create({
        data: {
          userId,
          shippingAddressId: shippingAddressRecord?.id || null,
          status: "PENDING",
          paymentStatus: "PENDING",
          subtotal: Number(subtotal.toFixed(2)),
          shippingFee: Number(shippingFee.toFixed(2)),
          tax: Number(tax.toFixed(2)),
          discount: 0,
          total: Number(total.toFixed(2)),
          notes: notes || null,
          items: {
            create: cart.items.map((item) => {
              const unitPrice = getUnitPrice(item.product);
              const discountAmount =
                Number(item.product.price) > unitPrice
                  ? Number(item.product.price) - unitPrice
                  : 0;

              return {
                productId: item.productId,
                quantity: item.quantity,
                price: Number(unitPrice.toFixed(2)),
                discount: Number(discountAmount.toFixed(2)),
              };
            }),
          },
        },
        include: {
          items: {
            include: { product: { include: { images: true } } },
          },
          shippingAddress: true,
        },
      });

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return createdOrder;
    });

    return sendSuccess(res, 201, { order }, "Order placed successfully.");
  } catch (error) {
    return sendError(res, 500, "Unable to create order.", error.message);
  }
};
