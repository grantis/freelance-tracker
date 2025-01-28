import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { loginWithGoogle, isAuthenticating, clearAuthenticating } from "@/lib/auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { SiGoogle } from "react-icons/si";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";

export default function Login() {
  const { toast } = useToast();

  // Clear any stale auth states on mount
  useEffect(() => {
    // If we're not on the callback URL with error, clear any stale auth states
    if (!window.location.search.includes('error=')) {
      clearAuthenticating();
    }
  }, []);

  // Handle errors from OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('error')) {
      clearAuthenticating();
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "There was a problem signing in with Google. Please try again.",
        duration: 5000,
      });
      // Remove the error from URL
      window.history.replaceState({}, '', '/login');
    }
  }, [toast]);

  const authenticating = isAuthenticating();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center space-y-2 sm:space-y-3">
          <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold">
            Freelance Tracker
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Track freelance hours with ease
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {authenticating ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <LoadingSpinner size="lg" />
              <p className="text-sm text-muted-foreground">
                Authenticating with Google...
              </p>
            </div>
          ) : (
            <Button 
              className="w-full flex items-center justify-center gap-2 py-6" 
              onClick={() => {
                loginWithGoogle();
              }}
            >
              <SiGoogle className="h-4 w-4" />
              <span className="text-base">Sign in with Google</span>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}