import { useQuery } from "@tanstack/react-query";
import { useUser, useLogout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import ClientDashboard from "./client-dashboard";
import AdminDashboard from "./admin-dashboard";

export default function Dashboard() {
  const { data: user, isLoading: userLoading } = useUser();
  const logout = useLogout();

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold">Welcome, {user.name}</h1>
          <Button 
            variant="ghost" 
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="self-end sm:self-auto"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {logout.isPending ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </div>

      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {user.isAdmin ? (
            <AdminDashboard user={user} />
          ) : (
            <ClientDashboard user={user} />
          )}
        </div>
      </div>
    </div>
  );
}