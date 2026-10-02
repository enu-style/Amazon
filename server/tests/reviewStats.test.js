import test from "node:test";
import assert from "node:assert/strict";
import { calculateReviewSummary } from "../src/utils/reviewStats.js";

test("calculateReviewSummary averages ratings and tracks totals", () => {
  const summary = calculateReviewSummary([
    { rating: 5 },
    { rating: 4 },
    { rating: 3 },
  ]);

  assert.equal(summary.averageRating, 4);
  assert.equal(summary.reviewCount, 3);
});

test("calculateReviewSummary handles empty reviews", () => {
  const summary = calculateReviewSummary([]);

  assert.equal(summary.averageRating, 0);
  assert.equal(summary.reviewCount, 0);
});
