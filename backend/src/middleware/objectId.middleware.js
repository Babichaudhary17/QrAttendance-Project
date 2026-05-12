import mongoose from "mongoose";

export const validateObjectId = (...paramNames) => (req, res, next) => {
  const invalidParam = paramNames.find((paramName) => {
    const value = req.params[paramName] ?? req.body[paramName] ?? req.query[paramName];
    return value && !mongoose.Types.ObjectId.isValid(value);
  });

  if (invalidParam) {
    return res.status(400).json({
      success: false,
      message: `${invalidParam} must be a valid MongoDB ObjectId.`,
    });
  }

  next();
};
