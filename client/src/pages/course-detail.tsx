import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowLeft } from "lucide-react";
import type { Course } from "@shared/schema";

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id;

  const { data: course, isLoading, error } = useQuery<Course>({
    queryKey: ["/api/courses", courseId],
  });

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Course Not Found</h2>
            <p className="text-muted-foreground mb-6">The course you're looking for doesn't exist.</p>
            <Link href="/courses" data-testid="button-back-to-courses">
              <Button>Back to Courses</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-12 bg-muted rounded w-1/2"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Course Not Found</h2>
            <p className="text-muted-foreground mb-6">The course you're looking for doesn't exist.</p>
            <Link href="/courses" data-testid="button-back-to-courses">
              <Button>Back to Courses</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="py-20 bg-background" data-testid="course-detail-page">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Link href="/courses" data-testid="link-back-to-courses">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Courses
              </Button>
            </Link>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary" className={`${
                    course.category === "Personal Growth" ? "bg-secondary/10 text-secondary" :
                    course.category === "Career Advancement" ? "bg-primary/10 text-primary" :
                    "bg-accent/10 text-accent"
                  }`} data-testid="course-category-badge">
                    {course.category}
                  </Badge>
                  {course.popular === "true" && (
                    <Badge className="bg-accent text-accent-foreground" data-testid="course-popular-badge">
                      Most Popular
                    </Badge>
                  )}
                </div>
                
                <h1 className="text-4xl lg:text-5xl font-bold text-foreground" data-testid="course-title">
                  {course.title}
                </h1>
                
                <p className="text-xl text-muted-foreground leading-relaxed" data-testid="course-description">
                  {course.description}
                </p>
              </div>
              
              <img 
                src={course.image} 
                alt={`${course.title} course illustration`}
                className="w-full h-64 lg:h-96 object-cover rounded-2xl shadow-lg"
                data-testid="course-hero-image"
              />
              
              <Card data-testid="course-features-card">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-foreground mb-6">What You'll Learn</h2>
                  <div className="space-y-4">
                    {course.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3" data-testid={`feature-${index}`}>
                        <CheckCircle className="h-6 w-6 text-secondary mt-0.5 flex-shrink-0" />
                        <span className="text-foreground text-lg">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card data-testid="course-curriculum-card">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-foreground mb-6">Course Curriculum</h2>
                  <div className="space-y-4">
                    <div className="text-muted-foreground">
                      <p className="mb-4">This comprehensive program includes:</p>
                      <ul className="space-y-2 list-disc list-inside">
                        <li>Structured learning modules with practical exercises</li>
                        <li>Regular one-on-one mentoring sessions</li>
                        <li>Access to exclusive resources and tools</li>
                        <li>Community support and networking opportunities</li>
                        <li>Certificate of completion</li>
                        <li>Lifetime access to course materials and updates</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-8">
              <Card className="sticky top-8" data-testid="course-enrollment-card">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-primary mb-2" data-testid="course-price">
                      ₹{course.price.toLocaleString()}
                    </div>
                    <div className="text-muted-foreground">One-time payment</div>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-secondary" />
                      <span className="text-foreground">Lifetime Access</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-secondary" />
                      <span className="text-foreground">1-on-1 Mentoring</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-secondary" />
                      <span className="text-foreground">Certificate of Completion</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-secondary" />
                      <span className="text-foreground">Community Access</span>
                    </div>
                  </div>
                  
                  <Link href="/contact" data-testid="button-enroll-now">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 text-lg">
                      Enroll Now
                    </Button>
                  </Link>
                  
                  <div className="text-center mt-4">
                    <Link href="/contact" data-testid="link-free-consultation">
                      <Button variant="ghost" className="text-primary">
                        Book Free Consultation
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
              
              <Card data-testid="course-guarantee-card">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-foreground mb-3">Our Guarantee</h3>
                  <p className="text-muted-foreground text-sm">
                    We're confident in our program's effectiveness. If you're not satisfied with your progress within the first 30 days, we'll work with you to address your concerns.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
