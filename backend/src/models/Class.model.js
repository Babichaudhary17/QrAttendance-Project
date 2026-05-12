import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const generateClassCode = () => uuidv4();

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      trim: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    classCode: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      default: generateClassCode,
    },
    inviteLink: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

classSchema.index({ teacher: 1, createdAt: -1 });
classSchema.index({ students: 1 });
classSchema.index({ isActive: 1, name: 1 });
classSchema.index({ classCode: 1, isActive: 1 });

classSchema.pre("validate", function setClassCode() {
  if (!this.classCode) {
    this.classCode = generateClassCode();
  }
});

const Class = mongoose.model("Class", classSchema);

export default Class;
