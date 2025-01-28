import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import HoursTable from "@/components/hours-table";
import ClientSelector from "@/components/client-selector";
import HoursForm from "@/components/hours-form";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { User, Client } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

interface AdminDashboardProps {
  user: User;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
    enabled: !!user,
  });

  const { data: pendingApplications } = useQuery<Client[]>({
    queryKey: ["/api/clients/pending"],
    enabled: !!user,
  });

  const handleApplicationResponse = async (clientId: number, approve: boolean) => {
    try {
      const response = await fetch(`/api/clients/${clientId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: approve ? 'approved' : 'rejected'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update application status');
      }

      toast({
        title: `Application ${approve ? 'Approved' : 'Rejected'}`,
        description: `Successfully ${approve ? 'approved' : 'rejected'} the client application.`,
      });

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update application status",
      });
    }
  };

  return (
    <div className="space-y-6">
      {pendingApplications?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Applications</CardTitle>
            <CardDescription>Review and manage client applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingApplications.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{application.name}</h3>
                    <p className="text-sm text-muted-foreground">{application.email}</p>
                    {application.applicationNotes && (
                      <p className="text-sm mt-2">{application.applicationNotes}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApplicationResponse(application.id, true)}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleApplicationResponse(application.id, false)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Client Management</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientSelector
            clients={clients || []}
            selectedClient={selectedClient}
            onSelectClient={setSelectedClient}
            isFreelancer={true}
          />
        </CardContent>
      </Card>

      {selectedClient && (
        <>
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
  );
}
