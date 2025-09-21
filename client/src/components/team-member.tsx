import { Card, CardContent } from "@/components/ui/card";
import { Linkedin, Twitter } from "lucide-react";

interface TeamMemberProps {
  name: string;
  position: string;
  description: string;
  image: string;
}

export default function TeamMember({ name, position, description, image }: TeamMemberProps) {
  return (
    <Card className="p-8 text-center" data-testid={`team-member-${name.replace(/\s+/g, '-').toLowerCase()}`}>
      <CardContent className="p-0">
        <img 
          src={image} 
          alt={`${name} professional headshot`}
          className="w-24 h-24 rounded-full mx-auto mb-6 object-cover"
          data-testid="team-member-image"
        />
        <h3 className="text-xl font-bold text-foreground mb-2" data-testid="team-member-name">
          {name}
        </h3>
        <p className="text-primary font-medium mb-4" data-testid="team-member-position">
          {position}
        </p>
        <p className="text-muted-foreground mb-6" data-testid="team-member-description">
          {description}
        </p>
        <div className="flex justify-center space-x-4">
          <button className="text-primary hover:text-primary/80 transition-colors" data-testid="social-linkedin">
            <Linkedin className="h-5 w-5" />
          </button>
          <button className="text-primary hover:text-primary/80 transition-colors" data-testid="social-twitter">
            <Twitter className="h-5 w-5" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
