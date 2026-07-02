import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import conversationRoutes from "./routes/conversationRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5001;
const frontendRoot = path.resolve(__dirname, "..", "..");

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
  }),
);
app.use(express.json());
app.use(express.static(frontendRoot));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/", (_req, res) => {
  res.sendFile(path.join(frontendRoot, "index.html"));
});

app.use("/api/conversations", conversationRoutes);

app.use((req, res) => {
  res.sendFile(path.join(frontendRoot, "index.html"));
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
