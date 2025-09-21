import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { InsertInquiry } from "@shared/schema";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    courseInterest: "",
    profession: "",
    message: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: InsertInquiry) => apiRequest("POST", "/api/inquiries", data),
    onSuccess: () => {
      toast({
        title: "Inquiry Sent Successfully!",
        description: "We'll respond within 24 hours to schedule your free consultation.",
      });
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        courseInterest: "",
        profession: "",
        message: "",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/inquiries"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send inquiry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.courseInterest) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    mutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="shadow-lg border border-border" data-testid="contact-form-card">
      <CardContent className="p-8">
        <h3 className="text-2xl font-bold text-foreground mb-6" data-testid="form-title">
          Course Inquiry Form
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="text-foreground font-medium">
                First Name *
              </Label>
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="John"
                required
                data-testid="input-first-name"
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-foreground font-medium">
                Last Name *
              </Label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="Doe"
                required
                data-testid="input-last-name"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="email" className="text-foreground font-medium">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="john.doe@email.com"
              required
              data-testid="input-email"
            />
          </div>
          
          <div>
            <Label htmlFor="courseInterest" className="text-foreground font-medium">
              Course Interest *
            </Label>
            <Select value={formData.courseInterest} onValueChange={(value) => handleInputChange("courseInterest", value)} required>
              <SelectTrigger data-testid="select-course-interest">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal-development">Personal Development (₹29,999)</SelectItem>
                <SelectItem value="career-counselling">Career Counselling (₹49,999)</SelectItem>
                <SelectItem value="financial-freedom">Financial Freedom (₹89,999)</SelectItem>
                <SelectItem value="multiple">Multiple Courses</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="profession" className="text-foreground font-medium">
              Current Profession
            </Label>
            <Input
              id="profession"
              type="text"
              value={formData.profession}
              onChange={(e) => handleInputChange("profession", e.target.value)}
              placeholder="Software Engineer, Consultant, etc."
              data-testid="input-profession"
            />
          </div>
          
          <div>
            <Label htmlFor="message" className="text-foreground font-medium">
              Message
            </Label>
            <Textarea
              id="message"
              rows={4}
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              placeholder="Tell us about your goals and what you hope to achieve..."
              data-testid="textarea-message"
            />
          </div>
          
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 text-lg"
            disabled={mutation.isPending}
            data-testid="button-submit-inquiry"
          >
            {mutation.isPending ? "Sending..." : "Send Inquiry"}
          </Button>
          
          <p className="text-muted-foreground text-sm text-center" data-testid="response-time-message">
            We'll respond within 24 hours to schedule your free consultation
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
