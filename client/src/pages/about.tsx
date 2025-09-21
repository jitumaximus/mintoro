import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import TeamMember from "@/components/team-member";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Eye, Star, Award, Users, TrendingUp } from "lucide-react";

const teamMembers = [
  {
    name: "Dr. Rajesh Kumar",
    position: "Lead Personal Development Coach",
    description: "Ph.D. in Psychology with 15+ years helping professionals unlock their potential and achieve breakthrough results.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300",
  },
  {
    name: "Priya Sharma",
    position: "Senior Career Strategist",
    description: "Former Fortune 500 HR Director specializing in career transitions and executive coaching for ambitious professionals.",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300",
  },
  {
    name: "Arjun Patel",
    position: "Wealth Management Expert",
    description: "CFA with 20+ years in investment banking, helping individuals build sustainable wealth through strategic planning.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300",
  },
];

const achievements = [
  {
    icon: Users,
    title: "500+ Transformed Lives",
    description: "We've helped over 500 professionals achieve their personal and career goals through our comprehensive programs.",
  },
  {
    icon: TrendingUp,
    title: "98% Success Rate",
    description: "Our students consistently achieve their objectives, with 98% reporting significant improvements in their target areas.",
  },
  {
    icon: Award,
    title: "Industry Recognition",
    description: "Our programs are recognized by leading industry bodies and have received multiple awards for excellence.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground" data-testid="about-hero">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6" data-testid="about-hero-title">
            About Mintoro
          </h1>
          <p className="text-xl text-primary-foreground/90 leading-relaxed max-w-3xl mx-auto" data-testid="about-hero-description">
            Transforming lives through expert guidance and proven methodologies since 2009
          </p>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-20 bg-background" data-testid="mission-vision-values">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl lg:text-5xl font-bold text-foreground" data-testid="our-story-title">
                  Our Story
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed" data-testid="our-story-description">
                  Founded with a mission to bridge the gap between potential and achievement, Mintoro combines cutting-edge methodologies with personalized guidance to create transformational learning experiences.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4" data-testid="mission-section">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                    <Target className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Our Mission</h3>
                    <p className="text-muted-foreground">Empowering individuals to unlock their full potential through expert-guided learning and strategic development programs that deliver measurable results.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4" data-testid="vision-section">
                  <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                    <Eye className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Our Vision</h3>
                    <p className="text-muted-foreground">To become the leading platform for holistic personal and professional development, setting the global standard for transformational education.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4" data-testid="values-section">
                  <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
                    <Star className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Our Values</h3>
                    <p className="text-muted-foreground">Excellence, integrity, and continuous growth drive everything we do, ensuring every student receives the highest quality guidance and support.</p>
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
                <Card className="p-6 text-center" data-testid="stat-students">
                  <CardContent className="p-0">
                    <div className="text-3xl font-bold text-secondary mb-2">500+</div>
                    <div className="text-muted-foreground text-sm">Students Transformed</div>
                  </CardContent>
                </Card>
                <Card className="p-6 text-center" data-testid="stat-success-rate">
                  <CardContent className="p-0">
                    <div className="text-3xl font-bold text-accent mb-2">98%</div>
                    <div className="text-muted-foreground text-sm">Success Rate</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-20 bg-muted/30" data-testid="achievements-section">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground" data-testid="achievements-title">
              Our Achievements
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="achievements-description">
              Recognition and results that demonstrate our commitment to excellence
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {achievements.map((achievement, index) => (
              <Card key={index} className="p-8 text-center" data-testid={`achievement-${index}`}>
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <achievement.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-4">{achievement.title}</h3>
                  <p className="text-muted-foreground">{achievement.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Expert Team */}
      <section id="team" className="py-20 bg-background" data-testid="team-section">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground" data-testid="team-title">
              Meet Our Expert Team
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="team-description">
              Industry veterans with decades of combined experience in personal development, career guidance, and financial planning
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <TeamMember key={member.name} {...member} />
            ))}
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="py-20 bg-muted/30" data-testid="methodology-section">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground" data-testid="methodology-title">
              Our Methodology
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="methodology-description">
              A proven approach that combines theory with practical application
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8" data-testid="methodology-assessment">
                <CardContent className="p-0">
                  <div className="text-2xl font-bold text-foreground mb-4">1. Assessment</div>
                  <p className="text-muted-foreground">
                    We begin with a comprehensive assessment of your current situation, goals, and challenges to create a personalized development plan.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="p-8" data-testid="methodology-strategy">
                <CardContent className="p-0">
                  <div className="text-2xl font-bold text-foreground mb-4">2. Strategy</div>
                  <p className="text-muted-foreground">
                    Based on your assessment, we develop a customized strategy with clear milestones and actionable steps toward your objectives.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="p-8" data-testid="methodology-implementation">
                <CardContent className="p-0">
                  <div className="text-2xl font-bold text-foreground mb-4">3. Implementation</div>
                  <p className="text-muted-foreground">
                    Through structured modules and one-on-one sessions, you'll implement proven strategies with expert guidance and support.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="p-8" data-testid="methodology-optimization">
                <CardContent className="p-0">
                  <div className="text-2xl font-bold text-foreground mb-4">4. Optimization</div>
                  <p className="text-muted-foreground">
                    We continuously monitor your progress and optimize your approach, ensuring you achieve sustained, long-term success.
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
