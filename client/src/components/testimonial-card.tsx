import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

interface TestimonialCardProps {
  name: string;
  position: string;
  content: string;
  rating: number;
}

export default function TestimonialCard({ name, position, content, rating }: TestimonialCardProps) {
  return (
    <Card className="p-8" data-testid={`testimonial-${name.replace(/\s+/g, '-').toLowerCase()}`}>
      <CardContent className="p-0">
        <div className="mb-6">
          <div className="flex text-accent mb-4" data-testid="rating-stars">
            {[...Array(rating)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-current" />
            ))}
          </div>
          <p className="text-foreground text-lg italic leading-relaxed" data-testid="testimonial-content">
            "{content}"
          </p>
        </div>
        <div>
          <div className="font-semibold text-foreground" data-testid="testimonial-name">
            {name}
          </div>
          <div className="text-muted-foreground text-sm" data-testid="testimonial-position">
            {position}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
