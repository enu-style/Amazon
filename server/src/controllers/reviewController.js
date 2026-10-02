import prisma from "../lib/prisma.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { calculateReviewSummary } from "../utils/reviewStats.js";

export const createProductReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, title, comment } = req.body;
    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return sendError(res, 400, "Rating must be an integer between 1 and 5.");
    }

    if (!comment || !comment.trim()) {
      return sendError(res, 400, "Review comment is required.");
    }

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return sendError(res, 404, "Product not found.");
    }

    const review = await prisma.review.upsert({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId: id,
        },
      },
      update: {
        rating: numericRating,
        title: title?.trim() || null,
        comment: comment.trim(),
      },
      create: {
        userId: req.user.id,
        productId: id,
        rating: numericRating,
        title: title?.trim() || null,
        comment: comment.trim(),
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const allReviews = await prisma.review.findMany({
      where: { productId: id },
      select: { rating: true },
    });

    const summary = calculateReviewSummary(allReviews);

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        rating: summary.averageRating,
        reviewCount: summary.reviewCount,
      },
      include: {
        category: true,
        images: true,
        reviews: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    return sendSuccess(
      res,
      201,
      { review, product: updatedProduct },
      "Review submitted successfully.",
    );
  } catch (error) {
    return sendError(res, 500, "Unable to submit review.", error.message);
  }
};
