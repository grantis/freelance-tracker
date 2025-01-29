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
const DOMAIN = process.env.REPL_SLUG 
  ? `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.replit.dev`
  : process.env.NODE_ENV === 'production' 
    ? 'freelance.grantrigby.dev'
    : 'localhost:5000';

const CALLBACK_URL = `${process.env.NODE_ENV === 'production' || process.env.REPL_SLUG ? 'https' : 'http'}://${DOMAIN}/api/auth/google/callback`;

export function registerRoutes(app: Express): Server {
  app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: new SessionStore({
      checkPeriod: 86400000 // 24 hours
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production' || !!process.env.REPL_SLUG,
      httpOnly: true,
      sameSite: 'lax',
      domain: process.env.NODE_ENV === 'production' 
        ? '.freelance.grantrigby.dev' 
        : undefined
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: CALLBACK_URL,
    proxy: true
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google OAuth callback received for profile:', profile.id);
      const email = profile.emails?.[0].value || '';

      let user = await db.query.users.findFirst({
        where: eq(users.googleId, profile.id)
      });

      if (!user) {
        user = await db.query.users.findFirst({
          where: eq(users.email, email)
        });

        if (user) {
          const [updatedUser] = await db.update(users)
            .set({ googleId: profile.id })
            .where(eq(users.id, user.id))
            .returning();
          user = updatedUser;
        } else {
          const isAdmin = email === ADMIN_EMAIL;
          console.log('Is admin?', isAdmin, 'for email:', email);

          const [newUser] = await db.insert(users).values({
            email: email,
            name: profile.displayName,
            googleId: profile.id,
            isAdmin: isAdmin,
            isFreelancer: isAdmin
          }).returning();
          user = newUser;
        }
      }

      console.log('User authenticated successfully:', user.id);
      done(null, user);
    } catch (error) {
      console.error('Error in Google OAuth callback:', error);
      done(error as Error);
    }
  }));

  passport.serializeUser((user: any, done) => {
    console.log('Serializing user:', user.id);
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

  app.get('/api/auth/google',
    (req, res, next) => {
      console.log('Starting Google OAuth flow');
      console.log('Current host:', req.get('host'));
      console.log('Protocol:', req.protocol);
      console.log('Using callback URL:', CALLBACK_URL);

      passport.authenticate('google', {
        scope: ['profile', 'email'],
        prompt: 'select_account'
      })(req, res, next);
    }
  );

  app.get('/api/auth/google/callback',
    (req, res, next) => {
      console.log('Received callback request');
      console.log('Query params:', req.query);

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
          console.log('User logged in successfully:', user.id);
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

  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    next();
  };

  app.post('/api/clients/apply', requireAuth, async (req: any, res) => {
    const user = req.user;

    try {
      const existingApplication = await db.query.clients.findFirst({
        where: eq(clients.userId, user.id)
      });

      if (existingApplication) {
        return res.status(400).json({ message: 'Application already exists' });
      }

      const [application] = await db.insert(clients).values({
        name: user.name,
        email: user.email,
        userId: user.id,
        freelancerId: 1, 
        status: 'pending',
        applicationNotes: req.body.notes
      }).returning();

      res.json(application);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/clients/me', requireAuth, async (req: any, res) => {
    try {
      const client = await db.query.clients.findFirst({
        where: eq(clients.userId, req.user.id)
      });

      res.json(client || null);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/clients/pending', requireAuth, async (req: any, res) => {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    try {
      const pendingClients = await db.query.clients.findMany({
        where: eq(clients.status, 'pending')
      });
      res.json(pendingClients);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/clients', requireAuth, async (req: any, res) => {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    try {
      const [client] = await db.insert(clients).values({
        name: req.body.name,
        email: req.body.email,
        freelancerId: req.user.id,
        status: 'approved'
      }).returning();

      res.json(client);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/clients/:id/status', requireAuth, async (req: any, res) => {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    try {
      const [updatedClient] = await db
        .update(clients)
        .set({ status: req.body.status })
        .where(eq(clients.id, parseInt(req.params.id)))
        .returning();

      res.json(updatedClient);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/clients', requireAuth, async (req: any, res) => {
    const user = req.user;
    try {
      if (user.isAdmin) {
        const clientsList = await db.query.clients.findMany({
          where: eq(clients.status, 'approved')
        });
        res.json(clientsList);
      } else {
        const clientsList = await db.query.clients.findMany({
          where: and(
            eq(clients.userId, user.id),
            eq(clients.status, 'approved')
          )
        });
        res.json(clientsList);
      }
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

  app.get('/api/hours/:id', requireAuth, async (req: any, res) => {
    const user = req.user;
    const hourId = parseInt(req.params.id);

    try {
      const hour = await db.query.hours.findFirst({
        where: eq(hours.id, hourId),
        with: {
          client: true
        }
      });

      if (!hour) {
        return res.status(404).json({ message: 'Hours entry not found' });
      }

      if (!user.isAdmin && hour.client.userId !== user.id) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      res.json(hour);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.put('/api/hours/:id', requireAuth, async (req: any, res) => {
    const user = req.user;
    const hourId = parseInt(req.params.id);

    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Only admin can update hours' });
    }

    try {
      const [updatedHour] = await db.update(hours)
        .set({
          description: req.body.description,
          hours: req.body.hours,
          date: new Date(req.body.date)
        })
        .where(eq(hours.id, hourId))
        .returning();

      res.json(updatedHour);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.delete('/api/hours/:id', requireAuth, async (req: any, res) => {
    const user = req.user;
    const hourId = parseInt(req.params.id);

    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Only admin can delete hours' });
    }

    try {
      await db.delete(hours)
        .where(eq(hours.id, hourId));

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}