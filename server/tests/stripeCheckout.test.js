import test from "node:test";
import assert from "node:assert/strict";
import { buildStripeLineItems } from "../src/utils/stripeCheckout.js";

test("buildStripeLineItems uses persisted item, shipping, and tax amounts", () => {
  const lineItems = buildStripeLineItems({
    items: [
      {
        price: "19.99",
        quantity: 2,
        product: { name: "Desk Lamp" },
      },
    ],
    shippingFee: "12.00",
    tax: "4.80",
    total: "56.78",
  });

  assert.deepEqual(
    lineItems.map((lineItem) => ({
      name: lineItem.price_data.product_data.name,
      amount: lineItem.price_data.unit_amount,
      quantity: lineItem.quantity,
    })),
    [
      { name: "Desk Lamp", amount: 1999, quantity: 2 },
      { name: "Shipping", amount: 1200, quantity: 1 },
      { name: "Sales tax", amount: 480, quantity: 1 },
    ],
  );
});

test("buildStripeLineItems omits zero-cost shipping and tax", () => {
  const lineItems = buildStripeLineItems({
    items: [{ price: "8.50", quantity: 1, product: { name: "Notebook" } }],
    shippingFee: "0",
    tax: "0",
    total: "8.50",
  });

  assert.equal(lineItems.length, 1);
  assert.equal(lineItems[0].price_data.unit_amount, 850);
});

test("buildStripeLineItems rejects totals that do not match the order", () => {
  assert.throws(
    () =>
      buildStripeLineItems({
        items: [{ price: "8.50", quantity: 1, product: { name: "Notebook" } }],
        shippingFee: "0",
        tax: "0",
        total: "9.50",
      }),
    /Order total does not match/,
  );
});
