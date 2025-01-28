import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { users, clients, hours } from "@db/schema";
import { eq, and } from "drizzle-orm";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import MemoryStore from "memorystore";
import crypto from "crypto";

const SessionStore = MemoryStore(session);
const sessionSecret = crypto.randomBytes(32).toString('hex');

const ADMIN_EMAIL = "grantrigby1992@gmail.com";

export function registerRoutes(app: Express): Server {
  // Session setup with secure settings
  app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: new SessionStore({
      checkPeriod: 86400000 // 24 hours
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax'
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Google OAuth setup with error logging
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL!
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google OAuth callback received for profile:', profile.id);
      const email = profile.emails?.[0].value || '';

      let user = await db.query.users.findFirst({
        where: eq(users.googleId, profile.id)
      });

      if (!user) {
        console.log('Creating new user for Google profile:', profile.id);
        const isAdmin = email === ADMIN_EMAIL;

        const [newUser] = await db.insert(users).values({
          email: email,
          name: profile.displayName,
          googleId: profile.id,
          isFreelancer: isAdmin, // Admin is automatically a freelancer
          isAdmin: isAdmin
        }).returning();
        user = newUser;
      }

      done(null, user);
    } catch (error) {
      console.error('Error in Google OAuth callback:', error);
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
      console.error('Error deserializing user:', error);
      done(error);
    }
  });

  // Auth routes with better error handling
  app.get('/api/auth/google',
    (req, res, next) => {
      console.log('Starting Google OAuth flow');
      next();
    },
    passport.authenticate('google', { 
      scope: ['profile', 'email'],
      prompt: 'select_account'
    })
  );

  app.get('/api/auth/google/callback',
    (req, res, next) => {
      passport.authenticate('google', (err: any, user: any, info: any) => {
        if (err) {
          console.error('Google OAuth callback error:', err);
          return res.redirect('/login?error=auth_failed');
        }

        if (!user) {
          console.error('No user returned from Google OAuth');
          return res.redirect('/login?error=no_user');
        }

        req.logIn(user, (loginErr) => {
          if (loginErr) {
            console.error('Login error:', loginErr);
            return res.redirect('/login?error=login_failed');
          }
          return res.redirect('/dashboard');
        });
      })(req, res, next);
    }
  );

  app.get('/api/auth/user', (req, res) => {
    res.json(req.user || null);
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  app.get('/api/auth/logout', (req, res) => {
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
      if (user.isAdmin) {
        // Admin sees all clients
        const clientsList = await db.query.clients.findMany();
        res.json(clientsList);
      } else {
        // Regular users only see their own client record
        const clientsList = await db.query.clients.findMany({
          where: eq(clients.userId, user.id)
        });
        res.json(clientsList);
      }
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Only admin can create clients
  app.post('/api/clients', requireAuth, async (req: any, res) => {
    const user = req.user;
    if (!user.isAdmin) {
      res.status(403).json({ message: 'Only admin can create clients' });
      return;
    }

    try {
      const [client] = await db.insert(clients).values({
        name: req.body.name,
        email: req.body.email,
        freelancerId: user.id,
        userId: req.body.userId // Link to the client's user account
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

      if (!client) {
        res.status(404).json({ message: 'Client not found' });
        return;
      }

      // Admin can see all hours, regular users can only see their own
      if (!user.isAdmin && client.userId !== user.id) {
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

  // Only admin can log hours
  app.post('/api/hours', requireAuth, async (req: any, res) => {
    const user = req.user;
    if (!user.isAdmin) {
      res.status(403).json({ message: 'Only admin can log hours' });
      return;
    }

    try {
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