import test from "node:test";
import assert from "node:assert/strict";
import { updateCategorySchema } from "../src/validators/category.js";

test("updateCategorySchema accepts boolean active-state changes", () => {
  const result = updateCategorySchema.safeParse({ isActive: false });

  assert.equal(result.success, true);
  assert.equal(result.data.isActive, false);
});

test("updateCategorySchema rejects non-boolean active-state changes", () => {
  assert.equal(
    updateCategorySchema.safeParse({ isActive: "false" }).success,
    false,
  );
});
