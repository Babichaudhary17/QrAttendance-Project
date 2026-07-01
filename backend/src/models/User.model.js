import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { env } from "../config/env.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    forcePasswordReset: {
      type: Boolean,
      default: false,
    },
    passwordChangedAt: {
      type: Date,
    },
    role: {
      type: String,
      enum: ["admin", "teacher", "student"],
      required: true,
    },
    teacherId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    studentId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
    },
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(env.bcryptRounds);
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordChangedAt = new Date();
});

userSchema.methods.matchPassword = function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
