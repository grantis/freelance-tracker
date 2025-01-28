import { useQuery } from "@tanstack/react-query";
import { useUser, clearAuthenticating, useLogout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import HoursTable from "@/components/hours-table";
import ClientSelector from "@/components/client-selector";
import HoursForm from "@/components/hours-form";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Dashboard() {
  const { data: user, isLoading: userLoading } = useUser();
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const { toast } = useToast();
  const logout = useLogout();

  // Clear authentication in progress when dashboard loads successfully
  useEffect(() => {
    if (user) {
      clearAuthenticating();
    }
  }, [user]);

  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
    enabled: !!user,
  });

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
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
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
          <Button 
            variant="ghost" 
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {logout.isPending ? "Logging out..." : "Logout"}
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{user.isFreelancer ? "Clients" : "Your Freelancer's Hours"}</CardTitle>
            </CardHeader>
            <CardContent>
              <ClientSelector
                clients={clients || []}
                selectedClient={selectedClient}
                onSelectClient={setSelectedClient}
                isFreelancer={user.isAdmin}
              />
            </CardContent>
          </Card>

          {selectedClient && (
            <>
              {user.isAdmin && (
                <Card>
                  <CardHeader>
                    <CardTitle>Log Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <HoursForm
                      clientId={selectedClient}
                      onSuccess={() => {
                        toast({
                          title: "Hours logged successfully",
                          description: "The hours have been recorded",
                        });
                      }}
                    />
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Hours Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <HoursTable clientId={selectedClient} />
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}