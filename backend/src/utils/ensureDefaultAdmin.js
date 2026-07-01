import User from "../models/User.model.js";

export const DEFAULT_ADMIN_EMAIL = "admin123@gmail.com";
export const DEFAULT_ADMIN_PASSWORD = "Admin@123";
const LEGACY_ADMIN_EMAIL = "admin@attendance.local";

export const ensureDefaultAdmin = async () => {
  const defaultAdmin = await User.findOne({ email: DEFAULT_ADMIN_EMAIL, role: "admin" });
  if (defaultAdmin) {
    return defaultAdmin;
  }

  const legacyAdmin = await User.findOne({ email: LEGACY_ADMIN_EMAIL, role: "admin" });
  if (legacyAdmin) {
    legacyAdmin.email = DEFAULT_ADMIN_EMAIL;
    legacyAdmin.password = DEFAULT_ADMIN_PASSWORD;
    legacyAdmin.name = legacyAdmin.name || "Admin User";
    await legacyAdmin.save();
    return legacyAdmin;
  }

  const adminCount = await User.countDocuments({ role: "admin" });
  if (adminCount > 0) {
    return null;
  }

  return User.create({
    name: "Admin User",
    email: DEFAULT_ADMIN_EMAIL,
    password: DEFAULT_ADMIN_PASSWORD,
    role: "admin",
  });
};
