import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Trust proxy settings for secure cookies and proper protocol detection
app.enable('trust proxy');

// Force redirect to preferred domain in production
const PREFERRED_DOMAIN = 'freelance.grantrigby.dev';
app.use((req, res, next) => {
  const host = req.get('host');

  // In production, redirect all traffic to the preferred domain
  if (process.env.NODE_ENV === 'production' && host && host !== PREFERRED_DOMAIN) {
    return res.redirect(301, `https://${PREFERRED_DOMAIN}${req.url}`);
  }

  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  // Force HTTPS redirect if not secure and in production
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(`https://${host}${req.url}`);
  }

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
  const server = registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error('Error:', err);
    res.status(status).json({ message });
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Changed port from 5000 to 3000
  const PORT = 3000;
  server.listen(PORT, "0.0.0.0", () => {
    log(`serving on port ${PORT}`);
  });
})();