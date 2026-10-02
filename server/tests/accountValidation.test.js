import test from "node:test";
import assert from "node:assert/strict";
import {
  createAddressSchema,
  updateAddressSchema,
  updateProfileSchema,
} from "../src/validators/account.js";

const validAddress = {
  fullName: "Alex Morgan",
  line1: "12 Market Street",
  city: "Springfield",
  state: "IL",
  postalCode: "62701",
  country: "US",
};

test("createAddressSchema accepts a complete address and defaults country", () => {
  const result = createAddressSchema.safeParse({
    fullName: validAddress.fullName,
    line1: validAddress.line1,
    city: validAddress.city,
    state: validAddress.state,
    postalCode: validAddress.postalCode,
  });

  assert.equal(result.success, true);
  assert.equal(result.data.country, "US");
});

test("createAddressSchema rejects incomplete shipping details", () => {
  assert.equal(
    createAddressSchema.safeParse({ fullName: "Alex Morgan" }).success,
    false,
  );
});

test("account update schemas reject empty and unknown-field updates", () => {
  assert.equal(updateAddressSchema.safeParse({}).success, false);
  assert.equal(updateProfileSchema.safeParse({}).success, false);
  assert.equal(updateProfileSchema.safeParse({ role: "ADMIN" }).success, false);
});
