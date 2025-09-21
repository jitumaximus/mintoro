import { Card, CardContent } from "@/components/ui/card";

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
        <p className="text-muted-foreground" data-testid="team-member-description">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
