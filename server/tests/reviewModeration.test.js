import test from "node:test";
import assert from "node:assert/strict";
import { calculateModeratedReviewSummary } from "../src/utils/reviewStats.js";

test("calculateModeratedReviewSummary counts only approved reviews", () => {
  const summary = calculateModeratedReviewSummary([
    { rating: 5, status: "APPROVED" },
    { rating: 1, status: "PENDING" },
    { rating: 2, status: "REJECTED" },
    { rating: 3, status: "APPROVED" },
  ]);

  assert.deepEqual(summary, { averageRating: 4, reviewCount: 2 });
});

test("calculateModeratedReviewSummary handles no approved reviews", () => {
  const summary = calculateModeratedReviewSummary([
    { rating: 5, status: "PENDING" },
    { rating: 1, status: "REJECTED" },
  ]);

  assert.deepEqual(summary, { averageRating: 0, reviewCount: 0 });
});
