import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { SiApple } from "react-icons/si";
import { MdOutlineEmail } from "react-icons/md";
import { Link } from "wouter";

export default function AuthPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm mx-auto">
        <CardContent className="pt-6">
          {/* Back button */}
          <button className="mb-8">
            <ArrowLeft className="h-6 w-6 text-muted-foreground hover:text-foreground transition-colors" />
          </button>

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-semibold tracking-tight mb-3">Register</h1>
            <p className="text-sm text-muted-foreground">
              Got an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Log in here →
              </Link>
            </p>
          </div>

          {/* Auth options */}
          <div className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full h-[72px] text-base justify-start px-6" 
              onClick={() => {}}
            >
              <SiApple className="mr-3 h-6 w-6" />
              <span className="flex-1 text-left">with Apple</span>
            </Button>

            <Button 
              variant="outline" 
              className="w-full h-[72px] text-base justify-start px-6" 
              onClick={() => {}}
            >
              <MdOutlineEmail className="mr-3 h-6 w-6" />
              <span className="flex-1 text-left">with Email</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}