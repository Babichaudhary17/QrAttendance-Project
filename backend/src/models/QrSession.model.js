import mongoose from "mongoose";

const qrSessionSchema = new mongoose.Schema(
  {
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

qrSessionSchema.index({ class: 1, teacher: 1, isActive: 1, expiresAt: -1 });
qrSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });

const QrSession = mongoose.model("QrSession", qrSessionSchema);

export default QrSession;
