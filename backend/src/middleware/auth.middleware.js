import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import User from "../models/User.model.js";
import asyncHandler from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Not authorized. Token is missing.");
  }

  const token = authHeader.split(" ")[1];
  let decoded;

  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch (error) {
    res.status(401);
    throw new Error(error.name === "TokenExpiredError" ? "Session expired." : "Invalid session token.");
  }

  const user = await User.findById(decoded.id)
    .select("-password")
    .populate([
      { path: "class", populate: [
        { path: "subject", select: "name code" },
        { path: "department", select: "name code" },
        { path: "program", select: "name code" },
        { path: "semester", select: "name code number" }
      ]},
      { path: "department", select: "name code" },
      { path: "program", select: "name code" },
      { path: "semester", select: "name code number" }
    ]);

  if (!user) {
    res.status(401);
    throw new Error("Not authorized. User no longer exists.");
  }

  req.user = user;

  const passwordResetAllowedRoutes = new Set(["/api/auth/me", "/api/auth/change-password"]);
  if (user.forcePasswordReset && !passwordResetAllowedRoutes.has(req.originalUrl)) {
    res.status(403);
    throw new Error("Password reset is required before accessing this resource.");
  }

  next();
});

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error("You do not have permission to access this route."));
    }

    next();
  };
};

export const isAdmin = (user) => user?.role === "admin";
export const assignedClassId = (user) => user?.class?._id ?? user?.class;

export const canManageClass = (user, classDoc) => {
  if (isAdmin(user)) {
    return true;
  }

  return user?.role === "teacher" && String(classDoc.teacher?._id ?? classDoc.teacher) === String(user._id);
};

export const canAccessClass = (user, classDoc) => {
  if (canManageClass(user, classDoc)) {
    return true;
  }

  return user?.role === "student" && String(assignedClassId(user)) === String(classDoc._id);
};

export const authorizeStudentClassAccess = (classIdSource = "classId") => {
  return (req, res, next) => {
    if (req.user?.role !== "student") {
      return next();
    }

    const requestedClassId =
      req.params[classIdSource] ??
      req.params.id ??
      req.body[classIdSource] ??
      req.body.classId ??
      req.query[classIdSource] ??
      req.query.classId;

    if (!requestedClassId) {
      return next();
    }

    if (String(assignedClassId(req.user)) !== String(requestedClassId)) {
      res.status(403);
      return next(new Error("You can only access your assigned class."));
    }

    next();
  };
};
