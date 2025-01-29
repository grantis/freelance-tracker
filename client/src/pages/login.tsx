import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { loginWithGoogle } from "@/lib/auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function Login() {
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("error")) {
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

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm mx-auto">
        <CardContent className="pt-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-semibold tracking-tight mb-3">
              Freelance Portal
            </h1>
          </div>
          {/* Auth options */}
          <div className="space-y-4">
            <Button
              className="w-full h-[72px] text-base justify-start px-6 relative"
              variant="outline"
              onClick={loginWithGoogle}
            >
              <img 
                src="/assets/login-icon.svg" 
                alt="Login" 
                className="w-6 h-6 mr-3"
              />
              <span className="flex-1 text-left">Continue with Google</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}