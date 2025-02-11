import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { db } from "@db";
import { config } from "dotenv";
import cors from "cors";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Enable detailed logging
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

config();

const app = express();
const port = Number(process.env.PORT) || 8080;
const server = createServer(app);

// Add early logging
console.log('Starting server with configuration:', {
  port,
  nodeEnv: process.env.NODE_ENV,
  domain: process.env.DOMAIN
});

// Trust proxy - important for correct protocol detection behind proxies
app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://freelance.grantrigby.dev']
    : ['http://localhost:5000'],
  credentials: true
}));

// Request logging middleware
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

      console.log(`${new Date().toLocaleTimeString()} [express] ${logLine}`);
    }
  });

  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.send('OK');
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.resolve(__dirname, "..", "dist", "client");
  app.use(express.static(clientDist));
  
  // Serve index.html for all non-API routes to support client-side routing
  app.get(/^(?!\/?api).+/, (req, res) => {
    res.sendFile(path.resolve(clientDist, "index.html"));
  });
}

(async () => {
  console.log('Starting server initialization...');
  try {
    // Test database connection
    console.log('Testing database connection...');
    await db.query.users.findMany();
    console.log('✓ Database connection successful');

    // Register routes
    console.log('Setting up application routes...');
    registerRoutes(app);
    console.log('✓ Routes registered successfully');

    // Start server
    server.listen(port, '0.0.0.0', () => {
      console.log(`Server is running at http://0.0.0.0:${port}`);
    }).on('error', (err: Error) => {
      console.error('Server failed to start:', err);
      process.exit(1);
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