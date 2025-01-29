import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { loginWithGoogle, isAuthenticating, clearAuthenticating } from "@/lib/auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { SiGoogle } from "react-icons/si";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Login() {
  const { toast } = useToast();

  // Clear any stale auth states on mount
  useEffect(() => {
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
      window.history.replaceState({}, '', '/login');
    }
  }, [toast]);

  const authenticating = isAuthenticating();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm mx-auto">
        <CardContent className="pt-6">
          {/* Back button */}
          <Link href="/">
            <Button variant="ghost" size="icon" className="mb-8 hover:bg-transparent">
              <ArrowLeft className="h-6 w-6 text-muted-foreground hover:text-foreground transition-colors" />
            </Button>
          </Link>

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-semibold tracking-tight mb-3">Login</h1>
            <p className="text-sm text-muted-foreground">
              Need an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Register here →
              </Link>
            </p>
          </div>

          {/* Auth options */}
          <div className="space-y-4">
            {authenticating ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <LoadingSpinner size="lg" />
                <p className="text-sm text-muted-foreground">
                  Authenticating with Google...
                </p>
              </div>
            ) : (
              <Button 
                className="w-full h-[72px] text-base justify-start px-6" 
                onClick={loginWithGoogle}
              >
                <SiGoogle className="mr-3 h-6 w-6" />
                <span className="flex-1 text-left">Continue with Google</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}