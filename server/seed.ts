import { db } from "./db";
import { courses } from "@shared/schema";
import { sql } from "drizzle-orm";

const coursesData = [
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

async function seed() {
  try {
    console.log("Seeding database...");
    
    // Insert courses
    await db.insert(courses).values(coursesData).onConflictDoUpdate({
      target: courses.id,
      set: {
        title: sql`excluded.title`,
        description: sql`excluded.description`,
        price: sql`excluded.price`,
        category: sql`excluded.category`,
        features: sql`excluded.features`,
        image: sql`excluded.image`,
        popular: sql`excluded.popular`
      }
    });
    
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();