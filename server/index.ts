import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db } from "@db";
import { config } from "dotenv";

config();

const app = express();
const port = Number(process.env.PORT) || 8080;

// Add startup logging
console.log('==== Server Starting ====');
console.log('Environment variables:');
console.log(`PORT: ${port}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`);
console.log(`GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set'}`);

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

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.send('OK');
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

    // Start the server
    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    }).on('error', (err) => {
      console.error('Failed to start server:', err);
      process.exit(1); // Exit on error
    });

    // Handle shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();