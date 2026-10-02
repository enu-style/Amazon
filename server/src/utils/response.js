// Standard response format
export const successResponse = (
  res,
  data,
  message = "Success",
  statusCode = 200,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (
  res,
  message = "An error occurred",
  statusCode = 500,
  errors = null,
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

// Paginated response
export const paginatedResponse = (
  res,
  data,
  total,
  page,
  limit,
  statusCode = 200,
) => {
  return res.status(statusCode).json({
    success: true,
    data,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      limit,
    },
  });
};

// Legacy function for compatibility
export const sendSuccess = (
  res,
  statusCode = 200,
  data = {},
  message = "Success",
) => {
  return successResponse(res, data, message, statusCode);
};

export const sendError = (res, statusCode, message, details = null) => {
  const payload = {
    success: false,
    message,
  };

  if (details) {
    payload.errors = details;
  }

  return res.status(statusCode).json(payload);
};
