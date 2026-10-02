import Stripe from "stripe";
import { buildStripeLineItems } from "../utils/stripeCheckout.js";

let stripeClient;

export const getStripeClient = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }

  stripeClient ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return stripeClient;
};

export const createOrderCheckoutSession = async ({
  order,
  user,
  clientUrl,
}) => {
  const stripe = getStripeClient();
  if (!stripe) {
    return { configurationError: "Stripe payments are not configured." };
  }

  if (order.stripePaymentId) {
    const existingSession = await stripe.checkout.sessions.retrieve(
      order.stripePaymentId,
    );

    if (existingSession.status === "open" && existingSession.url) {
      return { session: existingSession };
    }

    if (existingSession.status === "complete") {
      return { completed: true };
    }
  }

  const url = clientUrl || "http://localhost:5173";
  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      line_items: buildStripeLineItems(order),
      customer_email: user.email,
      client_reference_id: order.id,
      metadata: { orderId: order.id, userId: user.id },
      payment_intent_data: {
        metadata: { orderId: order.id, userId: user.id },
      },
      success_url: `${url}/orders?payment=success&orderId=${order.id}`,
      cancel_url: `${url}/orders?payment=cancelled&orderId=${order.id}`,
    },
    {
      idempotencyKey: `order-checkout-${order.id}-${new Date(order.updatedAt).getTime()}`,
    },
  );

  return { session };
};
