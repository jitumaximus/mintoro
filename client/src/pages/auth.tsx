import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { z } from "zod";
import { Redirect } from "wouter";
import { UserPlus, LogIn, GraduationCap } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginData = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { user, loginMutation, registerMutation } = useAuth();

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerSchema = insertUserSchema.extend({
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

  type RegisterData = z.infer<typeof registerSchema>;

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      confirmPassword: "",
    },
  });

  // Redirect if already logged in (after all hooks are called)
  if (user) {
    return <Redirect to="/" />;
  }

  const onLogin = async (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const onRegister = async (data: RegisterData) => {
    const { confirmPassword, ...userData } = data;
    registerMutation.mutate(userData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12 min-h-screen">
          {/* Form Section */}
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  {isLogin ? (
                    <LogIn className="h-12 w-12 text-primary" />
                  ) : (
                    <UserPlus className="h-12 w-12 text-primary" />
                  )}
                </div>
                <CardTitle className="text-2xl">
                  {isLogin ? "Welcome Back" : "Create Account"}
                </CardTitle>
                <CardDescription>
                  {isLogin 
                    ? "Sign in to access your courses and track your progress"
                    : "Join Mintoro to start your learning journey"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLogin ? (
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-username" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} data-testid="input-password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loginMutation.isPending}
                        data-testid="button-login"
                      >
                        {loginMutation.isPending ? "Signing in..." : "Sign In"}
                      </Button>
                    </form>
                  </Form>
                ) : (
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-first-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-last-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-register-username" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} data-testid="input-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} data-testid="input-register-password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} data-testid="input-confirm-password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={registerMutation.isPending}
                        data-testid="button-register"
                      >
                        {registerMutation.isPending ? "Creating account..." : "Create Account"}
                      </Button>
                    </form>
                  </Form>
                )}

                <div className="mt-6 text-center">
                  <Button
                    variant="ghost"
                    onClick={() => setIsLogin(!isLogin)}
                    data-testid="button-toggle-auth-mode"
                  >
                    {isLogin 
                      ? "Don't have an account? Sign up" 
                      : "Already have an account? Sign in"
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Hero Section */}
          <div className="flex items-center justify-center lg:justify-start">
            <div className="text-center lg:text-left space-y-8">
              <div className="flex justify-center lg:justify-start">
                <GraduationCap className="h-20 w-20 text-primary" />
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold text-foreground" data-testid="auth-hero-title">
                  Transform Your Future with{" "}
                  <span className="text-primary">Mintoro</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-lg" data-testid="auth-hero-description">
                  Join thousands of students who have transformed their careers through our expert-led courses in Personal Development, Career Counselling, and Financial Freedom.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-8 justify-center lg:justify-start">
                <div className="text-center" data-testid="auth-stat-students">
                  <div className="text-3xl font-bold text-primary">500+</div>
                  <div className="text-muted-foreground">Students Enrolled</div>
                </div>
                <div className="text-center" data-testid="auth-stat-success">
                  <div className="text-3xl font-bold text-primary">98%</div>
                  <div className="text-muted-foreground">Success Rate</div>
                </div>
                <div className="text-center" data-testid="auth-stat-satisfaction">
                  <div className="text-3xl font-bold text-primary">4.9★</div>
                  <div className="text-muted-foreground">Student Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}