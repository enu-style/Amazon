import prisma from "../lib/prisma.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { sendOrderConfirmationEmail } from "../services/emailService.js";

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
        coupon: {
          select: {
            code: true,
            type: true,
            discountValue: true,
          },
        },
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
        coupon: {
          select: {
            code: true,
            type: true,
            discountValue: true,
            description: true,
          },
        },
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
    const { shippingAddressId, notes, shippingAddress, couponCode } = req.body;

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

    // Calculate subtotal
    const subtotal = cart.items.reduce((sum, item) => {
      const unitPrice = getUnitPrice(item.product);
      return sum + unitPrice * item.quantity;
    }, 0);

    let shippingFee = subtotal > 0 ? 12 : 0;
    let discount = 0;
    let coupon = null;
    let appliedCouponId = null;

    // Apply coupon if provided
    if (couponCode) {
      coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (!coupon) {
        return sendError(res, 404, "Invalid coupon code.");
      }

      // Validate coupon
      const now = new Date();
      
      if (coupon.status !== 'ACTIVE') {
        return sendError(res, 400, "This coupon is no longer active.");
      }

      if (coupon.validUntil && new Date(coupon.validUntil) < now) {
        return sendError(res, 400, "This coupon has expired.");
      }

      if (new Date(coupon.validFrom) > now) {
        return sendError(res, 400, "This coupon is not yet valid.");
      }

      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return sendError(res, 400, "This coupon has reached its usage limit.");
      }

      // Check per-user usage
      const userUsageCount = await prisma.couponUsage.count({
        where: {
          couponId: coupon.id,
          userId,
        },
      });

      if (userUsageCount >= coupon.usagePerUser) {
        return sendError(res, 400, "You have already used this coupon the maximum number of times.");
      }

      // Check minimum order amount
      if (coupon.minOrderAmount && subtotal < parseFloat(coupon.minOrderAmount)) {
        return sendError(
          res,
          400,
          `Minimum order amount of $${parseFloat(coupon.minOrderAmount).toFixed(2)} required for this coupon.`
        );
      }

      // Calculate discount
      if (coupon.type === 'PERCENTAGE') {
        discount = (subtotal * parseFloat(coupon.discountValue)) / 100;
        if (coupon.maxDiscount && discount > parseFloat(coupon.maxDiscount)) {
          discount = parseFloat(coupon.maxDiscount);
        }
      } else if (coupon.type === 'FIXED_AMOUNT') {
        discount = parseFloat(coupon.discountValue);
        if (discount > subtotal) {
          discount = subtotal;
        }
      } else if (coupon.type === 'FREE_SHIPPING') {
        discount = shippingFee;
        shippingFee = 0;
      }

      appliedCouponId = coupon.id;
    }

    const tax = (subtotal - discount) * 0.08;
    const total = subtotal - discount + shippingFee + tax;

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
          couponId: appliedCouponId,
          status: "PENDING",
          paymentStatus: "PENDING",
          subtotal: Number(subtotal.toFixed(2)),
          shippingFee: Number(shippingFee.toFixed(2)),
          tax: Number(tax.toFixed(2)),
          discount: Number(discount.toFixed(2)),
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
          coupon: {
            select: {
              code: true,
              type: true,
              discountValue: true,
            },
          },
        },
      });

      // Update coupon usage
      if (appliedCouponId) {
        await tx.coupon.update({
          where: { id: appliedCouponId },
          data: { usedCount: { increment: 1 } },
        });

        await tx.couponUsage.create({
          data: {
            couponId: appliedCouponId,
            userId,
            orderId: createdOrder.id,
          },
        });
      }

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return createdOrder;
    });

    // Send order confirmation email (non-blocking)
    if (req.user.emailNotifications) {
      sendOrderConfirmationEmail(order, req.user).catch((error) => {
        console.error("Failed to send order confirmation email:", error);
      });
    }

    return sendSuccess(res, 201, { order }, "Order placed successfully.");
  } catch (error) {
    return sendError(res, 500, "Unable to create order.", error.message);
  }
};
