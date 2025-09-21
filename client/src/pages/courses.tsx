import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import CourseCard from "@/components/course-card";
import Footer from "@/components/footer";
import type { Course } from "@shared/schema";

export default function CoursesPage() {
  const { data: courses, isLoading, error } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Unable to Load Courses</h2>
            <p className="text-muted-foreground">Please check your connection and try again.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="py-20 bg-background" data-testid="courses-page">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground" data-testid="page-title">
              Our Courses
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="page-description">
              Choose from our comprehensive range of professional development programs designed to accelerate your growth
            </p>
          </div>
          
          {isLoading ? (
            <div className="grid lg:grid-cols-3 gap-8" data-testid="courses-loading">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden animate-pulse">
                  <div className="w-full h-48 bg-muted"></div>
                  <div className="p-8 space-y-4">
                    <div className="h-6 bg-muted rounded"></div>
                    <div className="h-8 bg-muted rounded"></div>
                    <div className="h-20 bg-muted rounded"></div>
                    <div className="h-12 bg-muted rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : courses && courses.length > 0 ? (
            <div className="grid lg:grid-cols-3 gap-8" data-testid="courses-grid">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12" data-testid="no-courses">
              <p className="text-muted-foreground">No courses available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
