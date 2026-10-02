export const calculateReviewSummary = (reviews = []) => {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return {
      averageRating: 0,
      reviewCount: 0,
    };
  }

  const total = reviews.reduce(
    (sum, review) => sum + Number(review.rating || 0),
    0,
  );
  const averageRating = Number((total / reviews.length).toFixed(1));

  return {
    averageRating,
    reviewCount: reviews.length,
  };
};
