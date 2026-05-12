import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    qrSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QrSession",
      required: true,
    },
    status: {
      type: String,
      enum: ["present", "absent"],
      default: "present",
    },
    markedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ student: 1, qrSession: 1 }, { unique: true });
attendanceSchema.index({ class: 1, markedAt: -1 });
attendanceSchema.index({ student: 1, markedAt: -1 });

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
