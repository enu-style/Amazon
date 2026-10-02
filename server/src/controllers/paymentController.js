import prisma from "../lib/prisma.js";
import { sendSuccess, sendError } from "../utils/response.js";
import {
  createOrderCheckoutSession,
  getStripeClient,
} from "../services/paymentService.js";

export const createCheckoutSession = async (req, res) => {
  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return sendError(
        res,
        503,
        "Stripe webhook verification is not configured.",
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          include: { product: { select: { name: true } } },
        },
      },
    });

    if (!order || order.userId !== req.user.id) {
      return sendError(res, 404, "Order not found.");
    }

    if (order.status === "CANCELLED") {
      return sendError(res, 409, "Cancelled orders cannot be paid.");
    }

    if (order.paymentStatus === "PAID") {
      return sendError(res, 409, "This order has already been paid.");
    }

    if (!["PENDING", "FAILED"].includes(order.paymentStatus)) {
      return sendError(res, 409, "This order is not available for payment.");
    }

    const result = await createOrderCheckoutSession({
      order,
      user: req.user,
      clientUrl: process.env.CLIENT_URL,
    });

    if (result.configurationError) {
      return sendError(res, 503, result.configurationError);
    }

    if (result.completed) {
      return sendError(
        res,
        409,
        "Payment confirmation is processing. Refresh your order shortly.",
      );
    }

    const session = result.session;
    const updated = await prisma.order.updateMany({
      where: {
        id: order.id,
        userId: req.user.id,
        status: { not: "CANCELLED" },
        paymentStatus: { in: ["PENDING", "FAILED"] },
      },
      data: { stripePaymentId: session.id },
    });

    if (updated.count === 0) {
      await getStripeClient().checkout.sessions.expire(session.id);
      return sendError(res, 409, "Order can no longer be paid.");
    }

    return sendSuccess(
      res,
      200,
      { url: session.url },
      "Checkout session created successfully.",
    );
  } catch (error) {
    return sendError(res, 500, "Unable to start checkout.", error.message);
  }
};

export const handleStripeWebhook = async (req, res) => {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return sendError(
      res,
      503,
      "Stripe webhook verification is not configured.",
    );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      webhookSecret,
    );
  } catch {
    return sendError(res, 400, "Invalid Stripe webhook signature.");
  }

  const session = event.data.object;
  const orderId = session.metadata?.orderId;

  if (!orderId) {
    return sendSuccess(res, 200, {}, "Webhook received.");
  }

  try {
    if (
      (event.type === "checkout.session.completed" ||
        event.type === "checkout.session.async_payment_succeeded") &&
      session.payment_status === "paid"
    ) {
      await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
          select: {
            id: true,
            userId: true,
            status: true,
            paymentStatus: true,
            stripePaymentId: true,
          },
        });

        if (
          !order ||
          order.userId !== session.metadata?.userId ||
          order.stripePaymentId !== session.id ||
          order.status === "CANCELLED" ||
          order.paymentStatus === "REFUNDED"
        ) {
          return;
        }

        await tx.order.updateMany({
          where: {
            id: order.id,
            userId: order.userId,
            stripePaymentId: session.id,
            status: order.status,
            paymentStatus: order.paymentStatus,
          },
          data: {
            paymentStatus: "PAID",
            ...(order.status === "PENDING" ? { status: "CONFIRMED" } : {}),
          },
        });
      });
    } else if (
      event.type === "checkout.session.async_payment_failed" ||
      event.type === "checkout.session.expired"
    ) {
      await prisma.order.updateMany({
        where: {
          id: orderId,
          userId: session.metadata?.userId,
          stripePaymentId: session.id,
          paymentStatus: "PENDING",
        },
        data: { paymentStatus: "FAILED" },
      });
    }
  } catch (error) {
    return sendError(
      res,
      500,
      "Unable to apply Stripe webhook.",
      error.message,
    );
  }

  return sendSuccess(res, 200, {}, "Webhook received.");
};
