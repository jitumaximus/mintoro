import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-16" data-testid="footer">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="space-y-6">
            <Link href="/" data-testid="footer-logo">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">M</span>
                </div>
                <span className="text-2xl font-bold">Mintoro</span>
              </div>
            </Link>
            <p className="text-primary-foreground/80 leading-relaxed" data-testid="footer-description">
              Empowering ambitious professionals to unlock their full potential through expert guidance and proven methodologies.
            </p>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-xl font-bold" data-testid="footer-courses-title">Courses</h3>
            <div className="space-y-3">
              <Link href="/courses/personal-development" data-testid="footer-link-personal-development">
                <a className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Personal Development
                </a>
              </Link>
              <Link href="/courses/career-counselling" data-testid="footer-link-career-counselling">
                <a className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Career Counselling
                </a>
              </Link>
              <Link href="/courses/financial-freedom" data-testid="footer-link-financial-freedom">
                <a className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Financial Freedom
                </a>
              </Link>
              <Link href="/courses" data-testid="footer-link-course-comparison">
                <a className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Course Comparison
                </a>
              </Link>
            </div>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-xl font-bold" data-testid="footer-company-title">Company</h3>
            <div className="space-y-3">
              <Link href="/about" data-testid="footer-link-about">
                <a className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  About Us
                </a>
              </Link>
              <Link href="/#testimonials" data-testid="footer-link-success-stories">
                <a className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Success Stories
                </a>
              </Link>
            </div>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-xl font-bold" data-testid="footer-support-title">Support</h3>
            <div className="space-y-3">
              <Link href="/contact" data-testid="footer-link-contact">
                <a className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Contact Us
                </a>
              </Link>
              <a href="#" className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors" data-testid="footer-link-faq">
                FAQ
              </a>
              <a href="#" className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors" data-testid="footer-link-privacy">
                Privacy Policy
              </a>
              <a href="#" className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors" data-testid="footer-link-terms">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-primary-foreground/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-primary-foreground/80" data-testid="footer-copyright">
              © 2024 Mintoro. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors" data-testid="footer-privacy-link">
                Privacy
              </a>
              <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors" data-testid="footer-terms-link">
                Terms
              </a>
              <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors" data-testid="footer-cookies-link">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
