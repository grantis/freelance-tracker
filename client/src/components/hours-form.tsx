import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { Hours } from "@/lib/types";

const hoursSchema = z.object({
  hours: z.string().min(1).transform(Number),
  description: z.string().min(1),
  date: z.string().min(1),
});

interface HoursFormProps {
  clientId: number;
  initialData?: Hours;
  onSuccess?: () => void;
}

export default function HoursForm({ clientId, initialData, onSuccess }: HoursFormProps) {
  const form = useForm({
    resolver: zodResolver(hoursSchema),
    defaultValues: {
      hours: initialData ? String(initialData.hours) : "",
      description: initialData?.description ?? "",
      date: initialData 
        ? new Date(initialData.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof hoursSchema>) => {
      const url = initialData 
        ? `/api/hours/${initialData.id}`
        : "/api/hours";

      const res = await fetch(url, {
        method: initialData ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          clientId,
        }),
      });

      if (!res.ok) {
        throw new Error(initialData ? "Failed to update hours" : "Failed to log hours");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/hours/${clientId}`] });
      form.reset();
      onSuccess?.();
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hours</FormLabel>
              <FormControl>
                <Input type="number" step="0.25" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending 
            ? (initialData ? "Updating..." : "Logging...") 
            : (initialData ? "Update Hours" : "Log Hours")}
        </Button>
      </form>
    </Form>
  );
}