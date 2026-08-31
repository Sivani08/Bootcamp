import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configured CORS for Frontend Vercel production & localhost dev
const allowedOrigins = (process.env.CLIENT_ORIGIN || "*").split(",").map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow dev origins gracefully
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Health Check Endpoint for Render monitoring
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Intel Blossom Hub API",
    timestamp: new Date().toISOString(),
  });
});

// Trainee Login REST Endpoint
app.post("/api/auth/trainee-login", async (req, res) => {
  try {
    const { employee_id, employee_name } = req.body;
    if (!employee_id || !employee_name) {
      return res.status(400).json({ ok: false, code: "not_found", message: "Employee ID and name required" });
    }

    const { traineeLoginHandler } = await import("./services/auth-service.js");
    const result = await traineeLoginHandler(String(employee_id), String(employee_name));
    return res.json(result);
  } catch (err: any) {
    console.error("[Backend REST] trainee-login error:", err);
    return res.status(500).json({ ok: false, code: "session_failed", message: err.message || "Internal server error" });
  }
});

// Employee Import REST Endpoint
app.post("/api/employees/import", async (req, res) => {
  try {
    const { rows } = req.body;
    if (!Array.isArray(rows)) {
      return res.status(400).json({ ok: false, message: "Invalid payload: rows array required" });
    }

    const { importEmployeesHandler } = await import("./services/employee-service.js");
    const result = await importEmployeesHandler(rows);
    return res.json(result);
  } catch (err: any) {
    console.error("[Backend REST] import-employees error:", err);
    return res.status(500).json({ ok: false, message: err.message || "Import failed" });
  }
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("[Backend Service Error]:", err);
  res.status(500).json({ error: true, message: err.message || "Internal server error" });
});

app.listen(port, () => {
  console.log(`[Intel Blossom Hub REST API] Server running on port ${port}`);
});
