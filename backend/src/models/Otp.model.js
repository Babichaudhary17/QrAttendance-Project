import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { env } from "../config/env.js";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// TTL index — MongoDB automatically deletes expired documents
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for fast lookups by email
otpSchema.index({ email: 1 });

// Hash the OTP code before saving so raw codes are never stored
otpSchema.pre("save", async function hashCode() {
  if (!this.isModified("code")) {
    return;
  }

  const salt = await bcrypt.genSalt(env.bcryptRounds);
  this.code = await bcrypt.hash(this.code, salt);
});

// Compare a plain-text code against the stored hash
otpSchema.methods.matchCode = function matchCode(plainCode) {
  return bcrypt.compare(plainCode, this.code);
};

const Otp = mongoose.model("Otp", otpSchema);

export default Otp;
