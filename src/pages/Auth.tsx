
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Lock, User, ArrowRight, Github, Google, Loader2 } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Animation timing states for staggered animations
  const [showForm, setShowForm] = useState(false);
  
  useEffect(() => {
    // Trigger animations after component mount
    setTimeout(() => setShowForm(true), 100);
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Sign up successful!",
        description: "Please check your email for verification."
      });
      
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) throw error;
      
    } catch (error: any) {
      toast({
        title: "Google sign in failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleGithubSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) throw error;
      
    } catch (error: any) {
      toast({
        title: "GitHub sign in failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // If the user is already logged in, redirect to the home page
  if (user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-background">
      <div className="w-full max-w-md">
        <div className={`mb-8 text-center transform transition-all duration-500 ${showForm ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h1 className="text-3xl font-bold tracking-tight text-primary mb-2">
            Student Management System
          </h1>
          <p className="text-muted-foreground">
            Sign in to access your student dashboard
          </p>
        </div>
        
        <Card className={`border-none shadow-lg bg-white/80 backdrop-blur-md transform transition-all duration-500 ${showForm ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mx-auto mb-2">
              <User className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="signin" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className={`transition-all duration-300 ${activeTab === 'signin' ? 'animate-slide-in-from-top-2' : ''}`}>
                <form onSubmit={handleSignIn}>
                  <div className="space-y-4">
                    <div className="relative">
                      <Label htmlFor="email" className="text-sm font-medium mb-1 block">Email</Label>
                      <div className="flex items-center">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="name@example.com"
                          className="pl-10"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <Label htmlFor="password" className="text-sm font-medium mb-1 block">Password</Label>
                      <div className="flex items-center">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button 
                          type="button" 
                          className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                      <div className="text-right mt-1">
                        <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
                      </div>
                    </div>
                    <Button type="submit" className="w-full group" disabled={loading}>
                      {loading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <>
                          Sign In
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
                
                <div className="mt-6">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" type="button" onClick={handleGoogleSignIn} className="hover:bg-primary/5 transition-colors duration-300">
                      <Google className="mr-2 h-4 w-4" />
                      Google
                    </Button>
                    <Button variant="outline" type="button" onClick={handleGithubSignIn} className="hover:bg-primary/5 transition-colors duration-300">
                      <Github className="mr-2 h-4 w-4" />
                      GitHub
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="signup" className={`transition-all duration-300 ${activeTab === 'signup' ? 'animate-slide-in-from-top-2' : ''}`}>
                <form onSubmit={handleSignUp}>
                  <div className="space-y-4">
                    <div className="relative">
                      <Label htmlFor="fullname" className="text-sm font-medium mb-1 block">Full Name</Label>
                      <div className="flex items-center">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="fullname"
                          type="text"
                          placeholder="John Doe"
                          className="pl-10"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <Label htmlFor="signup-email" className="text-sm font-medium mb-1 block">Email</Label>
                      <div className="flex items-center">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="name@example.com"
                          className="pl-10"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <Label htmlFor="signup-password" className="text-sm font-medium mb-1 block">Password</Label>
                      <div className="flex items-center">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button 
                          type="button" 
                          className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Password must be at least 8 characters
                      </div>
                    </div>
                    <Button type="submit" className="w-full group" disabled={loading}>
                      {loading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
                
                <div className="mt-6">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" type="button" onClick={handleGoogleSignIn} className="hover:bg-primary/5 transition-colors duration-300">
                      <Google className="mr-2 h-4 w-4" />
                      Google
                    </Button>
                    <Button variant="outline" type="button" onClick={handleGithubSignIn} className="hover:bg-primary/5 transition-colors duration-300">
                      <Github className="mr-2 h-4 w-4" />
                      GitHub
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <p className="text-xs text-center text-muted-foreground">
              By clicking continue, you agree to our{" "}
              <a href="#" className="underline text-primary hover:text-primary/90">Terms of Service</a> and{" "}
              <a href="#" className="underline text-primary hover:text-primary/90">Privacy Policy</a>.
            </p>
          </CardFooter>
        </Card>
        
        <div className={`mt-8 text-center text-sm text-muted-foreground transform transition-all duration-500 delay-300 ${showForm ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <p>
            &copy; {new Date().getFullYear()} Student Management System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
