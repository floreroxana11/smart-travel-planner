import express from "express";
import cors from "cors";
import tripsRoutes from "./routes/tripsRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { auditLogger } from "./middleware/logMiddleware.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

app.use(cors({
  origin: true, // permite orice origin din LAN
  credentials: true,
}));
app.use(express.json());
app.use(auditLogger); 

app.get("/", (req, res) => {
  res.json({
    message: "Smart Travel Planner backend is running.",
  });
});

app.use("/api/trips", tripsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);

export default app;