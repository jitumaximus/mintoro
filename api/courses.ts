import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, text, varchar, integer } from "drizzle-orm/pg-core";
import { eq } from 'drizzle-orm';
import type { VercelRequest, VercelResponse } from '@vercel/node';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set');
}

// Inline schema to avoid import issues
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

const neonSql = neon(process.env.DATABASE_URL);
const db = drizzle(neonSql);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const allCourses = await db.select().from(courses);
      return res.status(200).json(allCourses);
    } catch (error) {
      console.error('Courses API Error:', error);
      return res.status(500).json({ message: 'Failed to fetch courses' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}