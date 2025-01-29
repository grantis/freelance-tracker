import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  loginWithGoogle,
  isAuthenticating,
  clearAuthenticating,
} from "@/lib/auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { AnimatedSVG } from "@/components/ui/animated-svg";

export default function Login() {
  const { toast } = useToast();

  useEffect(() => {
    if (!window.location.search.includes("error=")) {
      clearAuthenticating();
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("error")) {
      clearAuthenticating();
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description:
          "There was a problem signing in with Google. Please try again.",
        duration: 5000,
      });
      window.history.replaceState({}, "", "/login");
    }
  }, [toast]);

  const authenticating = isAuthenticating();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm mx-auto">
        <CardContent className="pt-6">
          {/* Header */}
          <div className="mb-6">
            <AnimatedSVG 
              src="/attached_assets/SVG/Scenes/Creative Design _ abstract, design, geometric, colors, shapes, symbol.svg"
              alt="Design"
              className="w-24 h-24 mx-auto mb-4"
            />
            <h1 className="text-4xl font-semibold tracking-tight mb-3">
              Freelance Portal
            </h1>
            <p></p>
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
                className="w-full h-[72px] text-base justify-start px-6 relative"
                variant="outline"
                onClick={loginWithGoogle}
              >
                <AnimatedSVG 
                  src="/assets/login-icon.svg" 
                  alt="Login" 
                  className="w-6 h-6 mr-3"
                />
                <span className="flex-1 text-left">Continue with Google</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}