import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import ContactForm from "@/components/contact-form";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin, CheckCircle } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground" data-testid="contact-hero">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6" data-testid="contact-hero-title">
            Get In Touch
          </h1>
          <p className="text-xl text-primary-foreground/90 leading-relaxed max-w-3xl mx-auto" data-testid="contact-hero-description">
            Ready to transform your life? Contact us for a free consultation and discover which program is right for you.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-background" data-testid="contact-section">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl lg:text-5xl font-bold text-foreground" data-testid="contact-info-title">
                  Let's Start Your Journey
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed" data-testid="contact-info-description">
                  Our team is here to help you choose the right program and answer any questions you might have about your transformation journey.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4" data-testid="contact-phone">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                    <Phone className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Phone</div>
                    <div className="text-muted-foreground">+91 98765 43210</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4" data-testid="contact-email">
                  <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                    <Mail className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Email</div>
                    <div className="text-muted-foreground">info@mintoro.com</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4" data-testid="contact-office">
                  <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Office</div>
                    <div className="text-muted-foreground">Mumbai, Maharashtra, India</div>
                  </div>
                </div>
              </div>
              
              <Card className="p-8 border border-border" data-testid="why-choose-mintoro-card">
                <CardContent className="p-0">
                  <h3 className="text-xl font-bold text-foreground mb-4">Why Choose Mintoro?</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-secondary" />
                      <span className="text-foreground">Expert-led comprehensive programs</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-secondary" />
                      <span className="text-foreground">Personalized one-on-one mentoring</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-secondary" />
                      <span className="text-foreground">Lifetime access and updates</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-secondary" />
                      <span className="text-foreground">Proven track record of success</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <ContactForm />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30" data-testid="faq-section">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground" data-testid="faq-title">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="faq-description">
              Common questions about our programs and how we can help you achieve your goals
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            <Card className="p-8" data-testid="faq-duration">
              <CardContent className="p-0">
                <h3 className="text-xl font-bold text-foreground mb-4">How long are the programs?</h3>
                <p className="text-muted-foreground">
                  Our programs are self-paced with lifetime access. Most students complete the core modules within 3-6 months, but you can take as much time as you need.
                </p>
              </CardContent>
            </Card>
            
            <Card className="p-8" data-testid="faq-mentoring">
              <CardContent className="p-0">
                <h3 className="text-xl font-bold text-foreground mb-4">How does mentoring work?</h3>
                <p className="text-muted-foreground">
                  Each program includes regular one-on-one sessions with industry experts who provide personalized guidance, answer questions, and help you overcome challenges.
                </p>
              </CardContent>
            </Card>
            
            <Card className="p-8" data-testid="faq-prerequisites">
              <CardContent className="p-0">
                <h3 className="text-xl font-bold text-foreground mb-4">Are there any prerequisites?</h3>
                <p className="text-muted-foreground">
                  No specific prerequisites are required. Our programs are designed for professionals at all levels who are committed to personal and professional growth.
                </p>
              </CardContent>
            </Card>
            
            <Card className="p-8" data-testid="faq-support">
              <CardContent className="p-0">
                <h3 className="text-xl font-bold text-foreground mb-4">What kind of support do I get?</h3>
                <p className="text-muted-foreground">
                  You'll have access to expert mentors, peer community, comprehensive resources, and our support team throughout your journey and beyond.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
