import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set');
}

// Inline schema definitions to avoid import issues in Vercel
const courses = pgTable("courses", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  category: text("category").notNull(),
  features: text("features").array().notNull(),
  image: text("image").notNull(),
  popular: text("popular").default("false"),
});

const inquiries = pgTable("inquiries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  courseInterest: text("course_interest").notNull(),
  profession: text("profession"),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const insertInquirySchema = createInsertSchema(inquiries).omit({
  id: true,
  createdAt: true,
});

const neonSql = neon(process.env.DATABASE_URL);
const db = drizzle(neonSql, { schema: { courses, inquiries } });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { path } = req.query;
  const segments = Array.isArray(path) ? path : [];

  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Route handling - segments are already after '/api/'
    if (req.method === 'GET' && segments[0] === 'courses' && !segments[1]) {
      const allCourses = await db.select().from(courses);
      return res.status(200).json(allCourses);
    }
    
    if (req.method === 'GET' && segments[0] === 'courses' && segments[1]) {
      const courseId = segments[1];
      const [course] = await db.select().from(courses).where(eq(courses.id, courseId));
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      return res.status(200).json(course);
    }
    
    if (req.method === 'POST' && segments[0] === 'inquiries' && !segments[1]) {
      // Handle Vercel body parsing - req.body may be a string
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (error) {
          return res.status(400).json({ message: 'Invalid JSON' });
        }
      }
      
      const validation = insertInquirySchema.safeParse(body);
      if (!validation.success) {
        return res.status(400).json({ message: 'Validation error', errors: validation.error.errors });
      }
      
      const [newInquiry] = await db.insert(inquiries).values({
        ...validation.data,
        id: randomUUID(),
      }).returning();
      return res.status(201).json(newInquiry);
    }
    
    // GET /api/inquiries removed for security - contains PII and not needed for public website

    // Route not found
    return res.status(404).json({ message: 'Not Found' });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}