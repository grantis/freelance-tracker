import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import HoursTable from "@/components/hours-table";
import ClientSelector from "@/components/client-selector";
import HoursForm from "@/components/hours-form";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { User, Client } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Check, X, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminDashboardProps {
  user: User;
}

const newClientSchema = z.object({
  name: z.string().min(1, "Client name is required"),
  email: z.string().email("Valid email is required"),
});

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const { toast } = useToast();
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);

  const { data: clients, isLoading: clientsLoading, refetch: refetchClients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
    enabled: !!user,
  });

  const { data: pendingApplications, isLoading: pendingLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients/pending"],
    enabled: !!user,
  });

  const form = useForm({
    resolver: zodResolver(newClientSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const createClientMutation = useMutation({
    mutationFn: async (values: z.infer<typeof newClientSchema>) => {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        throw new Error("Failed to create client");
      }

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Client Created",
        description: "New client has been created successfully.",
      });
      form.reset();
      setIsNewClientDialogOpen(false);
      refetchClients();
    },
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

      refetchClients();

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update application status",
      });
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <Dialog open={isNewClientDialogOpen} onOpenChange={setIsNewClientDialogOpen}>
        <DialogContent className="sm:max-w-[425px] mx-4">
          <DialogHeader>
            <DialogTitle>Create New Client</DialogTitle>
            <DialogDescription>
              Add a new client to start tracking hours. They can register later with this email.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => createClientMutation.mutate(data))} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter client name" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="client@example.com" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={createClientMutation.isPending}>
                {createClientMutation.isPending ? "Creating..." : "Create Client"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {!pendingLoading && pendingApplications?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Applications</CardTitle>
            <CardDescription>Review and manage client applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingApplications.map((application) => (
                <div key={application.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                  <div>
                    <h3 className="font-medium">{application.name}</h3>
                    <p className="text-sm text-muted-foreground">{application.email}</p>
                    {application.applicationNotes && (
                      <p className="text-sm mt-2">{application.applicationNotes}</p>
                    )}
                  </div>
                  <div className="flex gap-2 self-start sm:self-center">
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

      {pendingLoading && (
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-5 w-72 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(2)].map((_, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <CardTitle>Client Management</CardTitle>
            <CardDescription>Select a client or create a new one</CardDescription>
          </div>
          <Button onClick={() => setIsNewClientDialogOpen(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            New Client
          </Button>
        </CardHeader>
        <CardContent>
          <ClientSelector
            clients={clients || []}
            selectedClient={selectedClient}
            onSelectClient={setSelectedClient}
            isFreelancer={true}
            isLoading={clientsLoading}
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
            <CardContent className="overflow-x-auto">
              <HoursTable clientId={selectedClient} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}