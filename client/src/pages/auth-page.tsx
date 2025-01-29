import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FcGoogle } from "react-icons/fc";
import { Link } from "wouter";

export default function AuthPage() {
  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left side - Image */}
      <div className="hidden lg:block w-1/2">
        <div className="h-full w-full bg-cover bg-center bg-[#4F46E5]">
          <div className="h-full w-full p-12 flex flex-col justify-between">
            <h2 className="text-2xl font-bold text-white">Freelance Hours Tracker</h2>
            <div>
              <h3 className="text-3xl font-bold text-white mb-4">Track Your Hours,<br/>Manage Your Time</h3>
              <p className="text-white/80">Efficiently track your freelance hours and manage client relationships with ease.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 space-y-6">
            {/* Form Header */}
            <div>
              <h1 className="text-2xl font-semibold mb-2">Create an account</h1>
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Log in
                </Link>
              </p>
            </div>

            {/* Registration Form */}
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" placeholder="Fletcher" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" placeholder="Thompson" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="fletcher@example.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" />
              </div>

              <Button className="w-full" type="submit">
                Create account
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or register with
                </span>
              </div>
            </div>

            {/* Social Login */}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = '/api/auth/google'}
            >
              <FcGoogle className="mr-2 h-5 w-5" />
              Google
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}