import test from "node:test";
import assert from "node:assert/strict";
import { updateProductSchema } from "../src/validators/product.js";

test("updateProductSchema accepts an active-state change for admin products", () => {
  const result = updateProductSchema.safeParse({ isActive: false });

  assert.equal(result.success, true);
  assert.equal(result.data.isActive, false);
});

test("updateProductSchema rejects non-boolean active-state changes", () => {
  assert.equal(
    updateProductSchema.safeParse({ isActive: "false" }).success,
    false,
  );
});
