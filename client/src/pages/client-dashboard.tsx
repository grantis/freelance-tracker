import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import HoursTable from "@/components/hours-table";
import { useToast } from "@/hooks/use-toast";
import type { User, Client } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface ClientDashboardProps {
  user: User;
}

const applicationSchema = z.object({
  notes: z.string().min(1, "Please provide some information about your project"),
});

export default function ClientDashboard({ user }: ClientDashboardProps) {
  const { toast } = useToast();

  const { data: clientInfo } = useQuery<Client>({
    queryKey: ["/api/clients/me"],
    enabled: !!user,
  });

  const form = useForm({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      notes: "",
    },
  });

  const applyMutation = useMutation({
    mutationFn: async (values: z.infer<typeof applicationSchema>) => {
      const res = await fetch("/api/clients/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        throw new Error("Failed to submit application");
      }

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your application has been submitted for review.",
      });
      form.reset();
    },
  });

  if (!clientInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Apply for Client Access</CardTitle>
          <CardDescription>
            Tell us about your project to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => applyMutation.mutate(data))} className="space-y-4">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please describe your project and requirements..."
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={applyMutation.isPending}>
                {applyMutation.isPending ? "Submitting..." : "Submit Application"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  if (clientInfo.status === "pending") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Application Pending</CardTitle>
          <CardDescription>
            Your application is currently under review. We'll notify you once it's been processed.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (clientInfo.status === "rejected") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Application Status</CardTitle>
          <CardDescription>
            Unfortunately, your application has not been approved at this time.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hours Log</CardTitle>
          <CardDescription>
            View the hours logged for your project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HoursTable clientId={clientInfo.id} />
        </CardContent>
      </Card>
    </div>
  );
}
