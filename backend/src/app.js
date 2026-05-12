import express from "express";
import cors from "cors";
import helmet from "helmet";
import apiRoutes from "./routes/index.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";
import {
  corsOptions,
  helmetOptions,
  sanitizeRequest,
} from "./middleware/security.middleware.js";

const app = express();

app.disable("x-powered-by");
app.use(helmet(helmetOptions));
app.use(cors(corsOptions));
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeRequest);

app.use("/api", apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
