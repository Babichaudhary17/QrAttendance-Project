import "dotenv/config";
import app from "./src/app.js";
import { env } from "./src/config/env.js";
import connectDB from "./src/config/db.js";
import { ensureDefaultAdmin } from "./src/utils/ensureDefaultAdmin.js";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be set");
}

await connectDB();
await ensureDefaultAdmin();

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
});
