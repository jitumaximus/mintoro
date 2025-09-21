import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, PublicUser, insertUserSchema } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Ensure SESSION_SECRET is properly set
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters long");
  }

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      sameSite: "lax", // CSRF protection
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user || false);
  });

  // Helper function to sanitize user data
  function toPublicUser(user: SelectUser): PublicUser {
    const { password, ...publicUser } = user;
    return publicUser;
  }

  app.post("/api/register", async (req, res, next) => {
    try {
      // Validate request body
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail && await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const user = await storage.createUser({
        ...validatedData,
        password: await hashPassword(validatedData.password),
      });

      // Regenerate session on successful registration to prevent session fixation
      req.session.regenerate((sessionErr) => {
        if (sessionErr) return next(sessionErr);
        req.login(user, (err) => {
          if (err) return next(err);
          res.status(201).json(toPublicUser(user));
        });
      });
    } catch (error) {
      if (error instanceof Error) {
        // Handle database constraint errors
        if (error.message.includes('duplicate key value violates unique constraint')) {
          if (error.message.includes('username')) {
            return res.status(400).json({ message: "Username already exists" });
          }
          if (error.message.includes('email')) {
            return res.status(400).json({ message: "Email already exists" });
          }
        }
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res, next) => {
    // Regenerate session on successful login to prevent session fixation
    req.session.regenerate((sessionErr) => {
      if (sessionErr) return next(sessionErr);
      req.login(req.user!, (err) => {
        if (err) return next(err);
        res.status(200).json(toPublicUser(req.user!));
      });
    });
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(toPublicUser(req.user!));
  });
}