export const sendSuccess = (
  res,
  statusCode = 200,
  data = {},
  message = "Success",
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data,
  });
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
