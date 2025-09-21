import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logoImage from "@assets/generated_images/Mintoro_educational_platform_logo_902fac0b.png";

export default function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/courses", label: "Courses" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" data-testid="logo-link">
            <div className="flex items-center space-x-3">
              <img 
                src={logoImage} 
                alt="Mintoro Logo" 
                className="w-16 h-16 rounded-lg object-contain"
              />
              <span className="text-2xl font-bold text-primary">Mintoro</span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} data-testid={`nav-${item.label.toLowerCase()}`}>
                <span className={`font-medium transition-colors ${
                  location === item.href 
                    ? "text-primary" 
                    : "text-foreground hover:text-primary"
                }`}>
                  {item.label}
                </span>
              </Link>
            ))}
            <Link href="/contact" data-testid="button-get-started" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-accent hover:bg-accent/90 text-accent-foreground h-10 px-4 py-2">
              Get Started
            </Link>
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-mobile-menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} data-testid={`mobile-nav-${item.label.toLowerCase()}`}>
                    <span className={`text-lg font-medium transition-colors ${
                      location === item.href 
                        ? "text-primary" 
                        : "text-foreground hover:text-primary"
                    }`}>
                      {item.label}
                    </span>
                  </Link>
                ))}
                <Link href="/contact" data-testid="mobile-button-get-started" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-accent hover:bg-accent/90 text-accent-foreground h-10 px-4 py-2 w-full mt-4">
                  Get Started
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
