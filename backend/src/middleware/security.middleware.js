import rateLimit from "express-rate-limit";
import { env, isProduction } from "../config/env.js";

const sanitizeObject = (value) => {
  if (!value || typeof value !== "object") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeObject);
  }

  return Object.entries(value).reduce((sanitized, [key, nestedValue]) => {
    if (key.startsWith("$") || key.includes(".")) {
      return sanitized;
    }

    sanitized[key] = sanitizeObject(nestedValue);
    return sanitized;
  }, {});
};

export const sanitizeRequest = (req, _res, next) => {
  req.body = sanitizeObject(req.body);
  req.params = sanitizeObject(req.params);

  const sanitizedQuery = sanitizeObject(req.query);
  Object.keys(req.query).forEach((key) => delete req.query[key]);
  Object.assign(req.query, sanitizedQuery);

  next();
};

const mutatingMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export const allowedBrowserOrigins = () =>
  new Set([env.clientUrl, "http://127.0.0.1:5173", "http://localhost:5173"]);

/**
 * Rejects browser-originated state changes from disallowed sites. JWT auth uses
 * Authorization (not cookies), so classic CSRF is limited; this still blocks
 * forged cross-site requests that send a non-simple Origin (defense in depth).
 * Clients without an Origin header (curl, native apps) are allowed.
 */
export const verifyMutatingRequestOrigin = (req, res, next) => {
  if (!mutatingMethods.has(req.method)) {
    return next();
  }

  const origin = req.get("origin");
  if (!origin) {
    return next();
  }

  const allowed = allowedBrowserOrigins();
  if (origin === "null" || !allowed.has(origin)) {
    res.status(403);
    return next(new Error("Request blocked: disallowed origin."));
  }

  return next();
};

export const corsOptions = {
  credentials: false,
  origin(origin, callback) {
    const allowedOrigins = allowedBrowserOrigins();

    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(new Error("CORS origin is not allowed."));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

export const authLimiter = rateLimit({
  windowMs: env.authRateLimitWindowMs,
  limit: env.authRateLimitMax,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
  },
});

export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.adminRateLimitMax,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many admin requests. Please slow down.",
  },
});

export const helmetOptions = {
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: isProduction ? undefined : false,
};
