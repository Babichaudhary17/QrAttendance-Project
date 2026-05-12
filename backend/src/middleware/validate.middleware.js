import { validationResult } from "express-validator";

export const validate = (validations) => {
  return async (req, res, next) => {
    for (let validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400);
    const extractedErrors = errors.array().map((err) => `${err.path}: ${err.msg}`).join(", ");

    const error = new Error(`Validation failed - ${extractedErrors}`);
    error.statusCode = 400;
    next(error);
  };
};
