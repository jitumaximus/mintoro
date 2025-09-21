import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { Link } from "wouter";
import type { Course } from "@shared/schema";

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow relative" data-testid={`course-card-${course.id}`}>
      {course.popular === "true" && (
        <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground z-10" data-testid="badge-popular">
          Most Popular
        </Badge>
      )}
      
      <img 
        src={course.image} 
        alt={`${course.title} course illustration`}
        className="w-full h-48 object-cover"
        data-testid={`course-image-${course.id}`}
      />
      
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-4">
          <Badge variant="secondary" className={`${
            course.category === "Personal Growth" ? "bg-secondary/10 text-secondary" :
            course.category === "Career Advancement" ? "bg-primary/10 text-primary" :
            "bg-accent/10 text-accent"
          }`} data-testid={`badge-category-${course.id}`}>
            {course.category}
          </Badge>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary" data-testid={`price-${course.id}`}>
              ₹{course.price.toLocaleString()}
            </div>
            <div className="text-muted-foreground text-sm">One-time payment</div>
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-foreground mb-3" data-testid={`title-${course.id}`}>
          {course.title}
        </h3>
        <p className="text-muted-foreground mb-6" data-testid={`description-${course.id}`}>
          {course.description}
        </p>
        
        <div className="space-y-3 mb-8">
          {course.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-3" data-testid={`feature-${course.id}-${index}`}>
              <CheckCircle className="h-5 w-5 text-secondary" />
              <span className="text-foreground">{feature}</span>
            </div>
          ))}
        </div>
        
        <Link href={`/courses/${course.id}`} data-testid={`button-view-course-${course.id}`}>
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            View Course Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
