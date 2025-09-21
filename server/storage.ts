import { type Course, type InsertCourse, type Inquiry, type InsertInquiry, type User, type InsertUser, courses, inquiries, users } from "@shared/schema";
import { db, pool } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import { randomUUID } from "crypto";
import connectPg from "connect-pg-simple";

export interface IStorage {
  // Course methods
  getCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  
  // Inquiry methods
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  getInquiries(): Promise<Inquiry[]>;
  
  // Session store
  sessionStore: session.Store;
}

/* export class MemStorage implements IStorage {
  private courses: Map<string, Course>;
  private inquiries: Map<string, Inquiry>;

  constructor() {
    this.courses = new Map();
    this.inquiries = new Map();
    
    // Initialize with course data
    this.initializeCourses();
  }

  private initializeCourses() {
    const coursesData: Course[] = [
      {
        id: "personal-development",
        title: "Personal Development Mastery",
        description: "Unlock your full potential with proven strategies for self-improvement, goal achievement, and building unshakeable confidence.",
        price: 29999,
        category: "Personal Growth",
        features: [
          "12 Comprehensive Modules",
          "1-on-1 Mentoring Sessions",
          "Lifetime Access & Updates",
          "Personal Growth Toolkit"
        ],
        image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=300",
        popular: "false"
      },
      {
        id: "career-counselling",
        title: "Career Counselling Excellence",
        description: "Navigate your career path with expert guidance, strategic planning, and proven methodologies for professional success.",
        price: 49999,
        category: "Career Advancement",
        features: [
          "Career Assessment & Planning",
          "Industry-Specific Strategies",
          "Interview & Negotiation Mastery",
          "Professional Network Building"
        ],
        image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=300",
        popular: "true"
      },
      {
        id: "financial-freedom",
        title: "Financial Freedom Blueprint",
        description: "Master the art of wealth creation through strategic investments, financial planning, and building multiple income streams.",
        price: 89999,
        category: "Wealth Building",
        features: [
          "Investment Strategy Mastery",
          "Passive Income Creation",
          "Risk Management & Portfolio",
          "Tax Optimization Strategies"
        ],
        image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=300",
        popular: "false"
      }
    ];

    coursesData.forEach(course => {
      this.courses.set(course.id, course);
    });
  }

  async getCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async getCourse(id: string): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async createInquiry(insertInquiry: InsertInquiry): Promise<Inquiry> {
    const id = randomUUID();
    const inquiry: Inquiry = {
      ...insertInquiry,
      id,
      profession: insertInquiry.profession || null,
      message: insertInquiry.message || null,
      createdAt: new Date(),
    };
    this.inquiries.set(id, inquiry);
    return inquiry;
  }

  async getInquiries(): Promise<Inquiry[]> {
    return Array.from(this.inquiries.values());
  }
} */

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // Setup session store for PostgreSQL
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getCourses(): Promise<Course[]> {
    return await db.select().from(courses);
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course || undefined;
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createInquiry(insertInquiry: InsertInquiry): Promise<Inquiry> {
    const [inquiry] = await db
      .insert(inquiries)
      .values(insertInquiry)
      .returning();
    return inquiry;
  }

  async getInquiries(): Promise<Inquiry[]> {
    return await db.select().from(inquiries);
  }
}

export const storage = new DatabaseStorage();
