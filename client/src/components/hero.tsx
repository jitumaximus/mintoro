import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight" data-testid="hero-title">
                Transform Your Future Through Expert{" "}
                <span className="text-secondary">Guidance</span>
              </h1>
              <p className="text-xl text-primary-foreground/90 leading-relaxed" data-testid="hero-description">
                Unlock your potential with Mintoro's premium courses in Personal Development, Career Counselling, and Financial Freedom. Expert-led programs designed for ambitious professionals.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/courses" data-testid="button-explore-courses">
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-4 text-lg">
                  Explore Courses
                </Button>
              </Link>
              <Link href="/contact" data-testid="button-book-consultation">
                <Button className="bg-white text-primary hover:bg-white/90 hover:text-primary px-8 py-4 text-lg font-semibold">
                  Book Free Consultation
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center space-x-8 pt-8">
              <div className="text-center" data-testid="stat-students">
                <div className="text-3xl font-bold">500+</div>
                <div className="text-primary-foreground/80">Students Transformed</div>
              </div>
              <div className="text-center" data-testid="stat-success-rate">
                <div className="text-3xl font-bold">98%</div>
                <div className="text-primary-foreground/80">Success Rate</div>
              </div>
              <div className="text-center" data-testid="stat-experience">
                <div className="text-3xl font-bold">15+</div>
                <div className="text-primary-foreground/80">Years Experience</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
              alt="Professional coaching consultation in modern office setting" 
              className="rounded-2xl shadow-2xl w-full h-auto"
              data-testid="hero-image"
            />
            <div className="absolute -bottom-6 -left-6 bg-card text-card-foreground p-6 rounded-xl shadow-lg" data-testid="hero-certification-badge">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-secondary-foreground" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold">Premium Certification</div>
                  <div className="text-muted-foreground text-sm">Industry Recognized</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
