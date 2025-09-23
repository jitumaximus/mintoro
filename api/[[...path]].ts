import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { courses, inquiries, insertInquirySchema } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema: { courses, inquiries } });

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
      const validation = insertInquirySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: 'Validation error', errors: validation.error.errors });
      }
      
      const [newInquiry] = await db.insert(inquiries).values({
        ...validation.data,
        id: randomUUID(),
      }).returning();
      return res.status(201).json(newInquiry);
    }
    
    if (req.method === 'GET' && segments[0] === 'inquiries' && !segments[1]) {
      const allInquiries = await db.select().from(inquiries);
      return res.status(200).json(allInquiries);
    }

    // Route not found
    return res.status(404).json({ message: 'Not Found' });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}