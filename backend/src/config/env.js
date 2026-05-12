import "dotenv/config";

const required = (name, value) => {
  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
};

const parsePositiveInt = (name, value, fallback) => {
  const parsed = Number.parseInt(value ?? fallback, 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return parsed;
};

const validateJwtSecret = (secret) => {
  required("JWT_SECRET", secret);

  const blockedValues = new Set([
    "secret",
    "jwt_secret",
    "replace_this_with_a_long_random_secret",
    "changeme",
    "password",
  ]);

  if (secret.length < 32 || blockedValues.has(secret.toLowerCase())) {
    throw new Error("JWT_SECRET must be at least 32 characters and must not be a placeholder.");
  }

  return secret;
};

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parsePositiveInt("PORT", process.env.PORT, 5000),
  mongoUri: required("MONGO_URI", process.env.MONGO_URI),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  jwtSecret: validateJwtSecret(process.env.JWT_SECRET),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  qrExpirySeconds: parsePositiveInt("QR_EXPIRY_SECONDS", process.env.QR_EXPIRY_SECONDS, 60),
  bcryptRounds: parsePositiveInt("BCRYPT_ROUNDS", process.env.BCRYPT_ROUNDS, 12),
  authRateLimitWindowMs: parsePositiveInt(
    "AUTH_RATE_LIMIT_WINDOW_MS",
    process.env.AUTH_RATE_LIMIT_WINDOW_MS,
    15 * 60 * 1000
  ),
  authRateLimitMax: parsePositiveInt("AUTH_RATE_LIMIT_MAX", process.env.AUTH_RATE_LIMIT_MAX, 20),
  adminRateLimitMax: parsePositiveInt("ADMIN_RATE_LIMIT_MAX", process.env.ADMIN_RATE_LIMIT_MAX, 120),
};

export const isProduction = env.nodeEnv === "production";
