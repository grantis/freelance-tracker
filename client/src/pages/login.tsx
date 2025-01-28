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

  // Clear auth progress and show error when component mounts (in case of redirect back with error)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('error')) {
      // Immediately clear the authenticating state
      clearAuthenticating();
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "There was a problem signing in with Google. Please try again.",
        duration: 5000,
      });
      // Clear the error from URL
      window.history.replaceState({}, '', '/login');
    }
  }, [toast]);

  // Only check authenticating state after handling potential errors
  const authenticating = isAuthenticating();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            Welcome to Grant Rigby's Freelance Tracker
          </CardTitle>
          <CardDescription>Track my freelance hours with ease</CardDescription>
        </CardHeader>
        <CardContent>
          {authenticating ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <LoadingSpinner size="lg" />
              <p className="text-sm text-muted-foreground">
                Authenticating with Google...
              </p>
            </div>
          ) : (
            <Button className="w-full" onClick={loginWithGoogle}>
              <SiGoogle className="mr-2 h-4 w-4" />
              Sign in with Google
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}