import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FcGoogle } from "react-icons/fc";
import { Link } from "wouter";
import { loginWithGoogle } from "@/lib/auth";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left side - Image */}
      <div className="hidden lg:block w-1/2">
        <div className="h-full w-full bg-cover bg-center bg-[#4F46E5]">
          <div className="h-full w-full p-12 flex flex-col justify-between">
            <h2 className="text-2xl font-bold text-white">
              freelance.grantrigby.dev
            </h2>
            <div>
              <h3 className="text-3xl font-bold text-white mb-4">
                No more guess, just work
                <br />
              </h3>
              <p className="text-white/80">
                Efficiently track project development and easy access to invoices.
              </p>
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
              <h1 className="text-2xl font-semibold mb-2">Welcome back</h1>
              <p className="text-sm text-muted-foreground">
                New to our platform?{" "}
                <Link href="/register" className="text-primary hover:underline">
                  Create an account
                </Link>
              </p>
            </div>

            {/* Login Form */}
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" />
              </div>

              <Button className="w-full" type="submit">
                Sign in
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Login */}
            <Button
              variant="outline"
              className="w-full"
              onClick={loginWithGoogle}
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
