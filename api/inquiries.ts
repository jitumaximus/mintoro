import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { randomUUID } from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set');
}

// Inline schema to avoid import issues
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
const db = drizzle(neonSql);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
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
    } catch (error) {
      console.error('Inquiries API Error:', error);
      return res.status(500).json({ message: 'Failed to create inquiry' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}