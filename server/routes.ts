import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { users, clients, hours } from "@db/schema";
import { eq, and } from "drizzle-orm";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import MemoryStore from "memorystore";

const SessionStore = MemoryStore(session);

export function registerRoutes(app: Express): Server {
  // Session setup
  app.use(session({
    secret: 'freelance-tracker-secret',
    resave: false,
    saveUninitialized: false,
    store: new SessionStore({
      checkPeriod: 86400000
    })
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Google OAuth setup
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL!
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await db.query.users.findFirst({
        where: eq(users.googleId, profile.id)
      });

      if (!user) {
        const [newUser] = await db.insert(users).values({
          email: profile.emails![0].value,
          name: profile.displayName,
          googleId: profile.id,
          isFreelancer: false
        }).returning();
        user = newUser;
      }

      done(null, user);
    } catch (error) {
      done(error as Error);
    }
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, id)
      });
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Auth routes
  app.get('/api/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      res.redirect('/dashboard');
    }
  );

  app.get('/api/auth/user', (req, res) => {
    res.json(req.user || null);
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout(() => {
      res.redirect('/');
    });
  });

  // Protected route middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    next();
  };

  // API routes
  app.get('/api/clients', requireAuth, async (req: any, res) => {
    const user = req.user;
    try {
      if (user.isFreelancer) {
        const clientsList = await db.query.clients.findMany({
          where: eq(clients.freelancerId, user.id)
        });
        res.json(clientsList);
      } else {
        const clientsList = await db.query.clients.findMany({
          where: eq(clients.userId, user.id)
        });
        res.json(clientsList);
      }
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/clients', requireAuth, async (req: any, res) => {
    const user = req.user;
    if (!user.isFreelancer) {
      res.status(403).json({ message: 'Only freelancers can create clients' });
      return;
    }

    try {
      const [client] = await db.insert(clients).values({
        name: req.body.name,
        email: req.body.email,
        freelancerId: user.id
      }).returning();
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/hours/:clientId', requireAuth, async (req: any, res) => {
    const user = req.user;
    const clientId = parseInt(req.params.clientId);

    try {
      const client = await db.query.clients.findFirst({
        where: eq(clients.id, clientId)
      });

      if (!client || (client.freelancerId !== user.id && client.userId !== user.id)) {
        res.status(403).json({ message: 'Unauthorized' });
        return;
      }

      const hoursList = await db.query.hours.findMany({
        where: eq(hours.clientId, clientId)
      });
      res.json(hoursList);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/hours', requireAuth, async (req: any, res) => {
    const user = req.user;
    if (!user.isFreelancer) {
      res.status(403).json({ message: 'Only freelancers can log hours' });
      return;
    }

    try {
      const client = await db.query.clients.findFirst({
        where: eq(clients.id, req.body.clientId)
      });

      if (!client || client.freelancerId !== user.id) {
        res.status(403).json({ message: 'Unauthorized' });
        return;
      }

      const [hour] = await db.insert(hours).values({
        clientId: req.body.clientId,
        description: req.body.description,
        hours: req.body.hours,
        date: new Date(req.body.date)
      }).returning();
      res.json(hour);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}