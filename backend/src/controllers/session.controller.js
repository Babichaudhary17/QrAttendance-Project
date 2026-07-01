import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import { env } from "../config/env.js";
import Class from "../models/Class.model.js";
import QrSession from "../models/QrSession.model.js";
import { canManageClass } from "../middleware/auth.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createQrSession = asyncHandler(async (req, res) => {
    const classDoc = await Class.findById(req.params.classId);

    if (!classDoc || !canManageClass(req.user, classDoc)) {
      res.status(404);
      throw new Error("Class was not found.");
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + env.qrExpirySeconds * 1000);

    await QrSession.updateMany(
      { class: classDoc._id, isActive: true },
      { isActive: false }
    );

    const session = await QrSession.create({
      class: classDoc._id,
      teacher: classDoc.teacher,
      token: uuidv4(),
      expiresAt,
    });

    // QR encodes ONLY the opaque session token (no JSON metadata in the image)
    const qrDataUrl = await QRCode.toDataURL(session.token, {
      width: 280,
      margin: 1,
    });

    // Session metadata is returned to the teacher UI only, never in the QR
    const sessionData = {
      sessionId: String(session._id),
      classId: String(classDoc._id),
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      token: session.token,
      ttlSeconds: env.qrExpirySeconds,
    };

    res.status(201).json({
      success: true,
      message: "QR session created successfully.",
      data: { session: sessionData, qrDataUrl },
    });
});
