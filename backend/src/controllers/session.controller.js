import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import Class from "../models/Class.model.js";
import QrSession from "../models/QrSession.model.js";

export const createQrSession = async (req, res, next) => {
  try {
    const classDoc = await Class.findOne({
      _id: req.params.classId,
      teacher: req.user._id,
    });

    if (!classDoc) {
      res.status(404);
      throw new Error("Class was not found.");
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60_000);

    await QrSession.updateMany(
      { class: classDoc._id, teacher: req.user._id, isActive: true },
      { isActive: false }
    );

    const session = await QrSession.create({
      class: classDoc._id,
      teacher: req.user._id,
      token: uuidv4(),
      expiresAt,
    });

    const payload = {
      classId: String(classDoc._id),
      teacherId: String(req.user._id),
      sessionId: String(session._id),
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      token: session.token,
    };

    const qrDataUrl = await QRCode.toDataURL(JSON.stringify(payload), {
      width: 280,
      margin: 1,
    });

    res.status(201).json({
      success: true,
      message: "QR session created successfully.",
      data: { session: payload, qrDataUrl },
    });
  } catch (error) {
    next(error);
  }
};
