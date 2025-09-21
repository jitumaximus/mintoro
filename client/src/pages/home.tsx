import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import Hero from "@/components/hero";
import CourseCard from "@/components/course-card";
import TestimonialCard from "@/components/testimonial-card";
import Footer from "@/components/footer";
import { CheckCircle, Target, Eye, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Course } from "@shared/schema";

const testimonials = [
  {
    name: "Sarah Johnson",
    position: "Marketing Director, Tech Corp",
    content: "The Personal Development course completely transformed my mindset. Within 6 months, I got promoted to a senior management role. The investment was worth every penny!",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150",
    rating: 5,
  },
  {
    name: "Amit Verma",
    position: "Product Manager, Startup",
    content: "Mintoro's Career Counselling program helped me transition from engineering to product management seamlessly. The guidance was exceptional and practical.",
    image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150",
    rating: 5,
  },
  {
    name: "Ravi Gupta",
    position: "Business Owner & Investor",
    content: "The Financial Freedom course taught me investment strategies that increased my portfolio by 300% in two years. Best educational investment I've ever made!",
    image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150",
    rating: 5,
  },
];


export default function HomePage() {
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
      
      <Hero />
      
      {/* Course Catalog Section */}
      <section id="courses" className="py-20 bg-background" data-testid="courses-section">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground" data-testid="courses-title">
              Our Premium Courses
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="courses-description">
              Comprehensive programs designed by industry experts to accelerate your personal and professional growth
            </p>
          </div>
          
          {isLoading ? (
            <div className="grid lg:grid-cols-3 gap-8">
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
          ) : courses ? (
            <div className="grid lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No courses available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20 bg-muted/30" data-testid="about-section">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl lg:text-5xl font-bold text-foreground" data-testid="about-title">
                  About Mintoro
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed" data-testid="about-description">
                  Founded with a mission to bridge the gap between potential and achievement, Mintoro combines cutting-edge methodologies with personalized guidance to create transformational learning experiences.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4" data-testid="mission-card">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                    <Target className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Our Mission</h3>
                    <p className="text-muted-foreground">Empowering individuals to unlock their full potential through expert-guided learning and strategic development programs.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4" data-testid="vision-card">
                  <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                    <Eye className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Our Vision</h3>
                    <p className="text-muted-foreground">To become the leading platform for holistic personal and professional development in the digital age.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4" data-testid="values-card">
                  <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
                    <Star className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Our Values</h3>
                    <p className="text-muted-foreground">Excellence, integrity, and continuous growth drive everything we do, ensuring measurable results for every student.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500" 
                alt="Team of diverse professionals collaborating in a modern office environment" 
                className="rounded-2xl shadow-lg w-full h-auto"
                data-testid="about-team-image"
              />
              
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-6 text-center" data-testid="stat-experience">
                  <CardContent className="p-0">
                    <div className="text-3xl font-bold text-primary mb-2">15+</div>
                    <div className="text-muted-foreground text-sm">Years Experience</div>
                  </CardContent>
                </Card>
                <Card className="p-6 text-center" data-testid="stat-success-stories">
                  <CardContent className="p-0">
                    <div className="text-3xl font-bold text-secondary mb-2">500+</div>
                    <div className="text-muted-foreground text-sm">Success Stories</div>
                  </CardContent>
                </Card>
                <Card className="p-6 text-center" data-testid="stat-satisfaction">
                  <CardContent className="p-0">
                    <div className="text-3xl font-bold text-accent mb-2">98%</div>
                    <div className="text-muted-foreground text-sm">Satisfaction Rate</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-muted/30" data-testid="testimonials-section">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground" data-testid="testimonials-title">
              Success Stories
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="testimonials-description">
              Real transformations from professionals who invested in their growth with Mintoro
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.name} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Mintoro Section */}
      <section className="py-20 bg-background" data-testid="why-choose-section">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground" data-testid="why-choose-title">
              Why Choose Mintoro?
            </h2>
          </div>
          
          <Card className="max-w-4xl mx-auto p-8" data-testid="why-choose-card">
            <CardContent className="p-0">
              <div className="space-y-6">
                <div className="flex items-center space-x-3" data-testid="benefit-expert-programs">
                  <CheckCircle className="h-6 w-6 text-secondary" />
                  <span className="text-foreground text-lg">Expert-led comprehensive programs</span>
                </div>
                <div className="flex items-center space-x-3" data-testid="benefit-mentoring">
                  <CheckCircle className="h-6 w-6 text-secondary" />
                  <span className="text-foreground text-lg">Personalized one-on-one mentoring</span>
                </div>
                <div className="flex items-center space-x-3" data-testid="benefit-lifetime-access">
                  <CheckCircle className="h-6 w-6 text-secondary" />
                  <span className="text-foreground text-lg">Lifetime access and updates</span>
                </div>
                <div className="flex items-center space-x-3" data-testid="benefit-track-record">
                  <CheckCircle className="h-6 w-6 text-secondary" />
                  <span className="text-foreground text-lg">Proven track record of success</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
