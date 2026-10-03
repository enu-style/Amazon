import test from "node:test";
import assert from "node:assert/strict";
import { updateCustomerStatusSchema } from "../src/validators/admin.js";

test("updateCustomerStatusSchema accepts boolean activation changes", () => {
  const result = updateCustomerStatusSchema.safeParse({ isActive: false });

  assert.equal(result.success, true);
  assert.equal(result.data.isActive, false);
});

test("updateCustomerStatusSchema rejects non-boolean activation changes", () => {
  assert.equal(
    updateCustomerStatusSchema.safeParse({ isActive: "false" }).success,
    false,
  );
});
