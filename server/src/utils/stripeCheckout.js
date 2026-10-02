const toCents = (amount) => Math.round(Number(amount || 0) * 100);

export const buildStripeLineItems = (order) => {
  const lineItems = order.items.map((item) => ({
    quantity: item.quantity,
    price_data: {
      currency: "usd",
      unit_amount: toCents(item.price),
      product_data: { name: item.product.name },
    },
  }));

  const shippingCents = toCents(order.shippingFee);
  if (shippingCents > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: shippingCents,
        product_data: { name: "Shipping" },
      },
    });
  }

  const taxCents = toCents(order.tax);
  if (taxCents > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: taxCents,
        product_data: { name: "Sales tax" },
      },
    });
  }

  const checkoutTotal = lineItems.reduce(
    (total, lineItem) =>
      total + lineItem.price_data.unit_amount * lineItem.quantity,
    0,
  );

  if (checkoutTotal !== toCents(order.total)) {
    throw new Error("Order total does not match its checkout line items.");
  }

  return lineItems;
};
