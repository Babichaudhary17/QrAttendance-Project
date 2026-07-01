import crypto from "crypto";
import bcrypt from "bcryptjs";
import { env } from "../config/env.js";

export const generateTemporaryPassword = () => {
  return crypto.randomBytes(8).toString("hex");
};

export const hashPassword = (password) => {
  return bcrypt.hash(password, env.bcryptRounds);
};

export const passwordDeliveryMessage = (user, temporaryPassword) => {
  if (process.env.SEND_TEMP_PASSWORD_EMAIL === "true") {
    return `Temporary password delivery is queued for ${user.email}.`;
  }

  return `Temporary password generated. Deliver it through a trusted out-of-band channel; the student must reset it on first login.`;
};
