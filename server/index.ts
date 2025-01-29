import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db } from "@db";

const app = express();

// Trust proxy - important for correct protocol detection behind Replit's proxy
app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  console.log('Starting server initialization...');
  try {
    // Test database connection
    console.log('Testing database connection...');
    await db.query.users.findMany();
    console.log('✓ Database connection successful');

    console.log('Setting up application routes...');
    const server = registerRoutes(app);
    console.log('✓ Routes registered successfully');

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Server error:', err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      throw err;
    });

    if (app.get("env") === "development") {
      console.log('Setting up Vite in development mode...');
      await setupVite(app, server);
      console.log('✓ Vite setup complete');
    } else {
      console.log('Setting up static serving for production...');
      serveStatic(app);
      console.log('✓ Static serving setup complete');
    }

    // Internal port configuration - not exposed in URLs
    const PORT = 5000;
    console.log(`Starting server on port ${PORT}...`);

    server.listen(PORT, "0.0.0.0", () => {
      console.log('=================================');
      console.log(`✓ Server is running!`);
      console.log(`• Port: ${PORT}`);
      console.log(`• Environment: ${app.get("env")}`);
      console.log('=================================');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();