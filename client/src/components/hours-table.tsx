import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import type { Hours } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import HoursForm from "./hours-form";

interface HoursTableProps {
  clientId: number;
}

export default function HoursTable({ clientId }: HoursTableProps) {
  const [editingHour, setEditingHour] = useState<Hours | null>(null);
  const [deletingHourId, setDeletingHourId] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: hours, isLoading } = useQuery<Hours[]>({
    queryKey: [`/api/hours/${clientId}`],
    enabled: !!clientId,
  });

  const deleteMutation = useMutation({
    mutationFn: async (hourId: number) => {
      const res = await fetch(`/api/hours/${hourId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete hours");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/hours/${clientId}`] });
      toast({
        title: "Hours deleted",
        description: "The hours entry has been deleted successfully.",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Date</TableHead>
              <TableHead className="min-w-[200px]">Description</TableHead>
              <TableHead className="text-right whitespace-nowrap">Hours</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(3)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-full max-w-[300px]" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-12 ml-auto" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (!hours?.length) {
    return <div>No hours logged yet.</div>;
  }

  return (
    <>
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Date</TableHead>
              <TableHead className="min-w-[200px]">Description</TableHead>
              <TableHead className="text-right whitespace-nowrap">Hours</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hours.map((hour) => (
              <TableRow key={hour.id}>
                <TableCell className="whitespace-nowrap">
                  {format(new Date(hour.date), "PPP")}
                </TableCell>
                <TableCell>{hour.description}</TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  {hour.hours}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingHour(hour)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingHourId(hour.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingHour} onOpenChange={() => setEditingHour(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Hours</DialogTitle>
          </DialogHeader>
          {editingHour && (
            <HoursForm
              clientId={clientId}
              initialData={editingHour}
              onSuccess={() => setEditingHour(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletingHourId}
        onOpenChange={() => setDeletingHourId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hours Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this hours entry? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingHourId) {
                  deleteMutation.mutate(deletingHourId);
                  setDeletingHourId(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}