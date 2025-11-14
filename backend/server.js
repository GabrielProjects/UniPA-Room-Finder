import express from "express";
import cors from "cors";
import apiRoutes from "./src/routes/api.js";
import { config } from "./src/config.js";
import { logger } from "./src/utils/logger.js";

const app = express();

// Middleware
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// API routes
app.use("/api", apiRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    name: "UnipaTool API",
    version: "1.0.0",
    endpoints: {
      buildings: "GET /api/buildings",
      search: "POST /api/search",
      health: "GET /api/health"
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  logger.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server (only if not in serverless environment)
// Vercel and other serverless platforms don't need app.listen()
if (process.env.VERCEL !== "1" && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  const PORT = config.PORT;
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`CORS enabled for origin: ${config.CORS_ORIGIN}`);
  });
}

// Export for serverless platforms
export default app;

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully...");
  const { closeBrowser } = await import("./src/scraper/browser.js");
  await closeBrowser();
  process.exit(0);
});

