import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true,
    },
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

subjectSchema.index({ program: 1, semester: 1 });

const Subject = mongoose.model("Subject", subjectSchema);

export default Subject;
