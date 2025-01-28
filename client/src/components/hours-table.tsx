import { useQuery } from "@tanstack/react-query";
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

interface HoursTableProps {
  clientId: number;
}

export default function HoursTable({ clientId }: HoursTableProps) {
  const { data: hours, isLoading } = useQuery<Hours[]>({
    queryKey: [`/api/hours/${clientId}`],
    enabled: !!clientId,
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
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Date</TableHead>
            <TableHead className="min-w-[200px]">Description</TableHead>
            <TableHead className="text-right whitespace-nowrap">Hours</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hours.map((hour) => (
            <TableRow key={hour.id}>
              <TableCell className="whitespace-nowrap">{format(new Date(hour.date), 'PPP')}</TableCell>
              <TableCell>{hour.description}</TableCell>
              <TableCell className="text-right whitespace-nowrap">{hour.hours}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}