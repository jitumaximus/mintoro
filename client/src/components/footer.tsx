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
            <div className="flex space-x-4" data-testid="footer-social-links">
              <a href="#" className="w-10 h-10 bg-primary-foreground/20 rounded-lg flex items-center justify-center hover:bg-primary-foreground/30 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-primary-foreground/20 rounded-lg flex items-center justify-center hover:bg-primary-foreground/30 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-primary-foreground/20 rounded-lg flex items-center justify-center hover:bg-primary-foreground/30 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
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
              <Link href="/about#team" data-testid="footer-link-team">
                <a className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Our Team
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
