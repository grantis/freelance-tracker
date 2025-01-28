import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface HoursTableProps {
  clientId: number;
}

export default function HoursTable({ clientId }: HoursTableProps) {
  const { data: hours, isLoading } = useQuery({
    queryKey: [`/api/hours/${clientId}`],
    enabled: !!clientId,
  });

  if (isLoading) {
    return <div>Loading hours...</div>;
  }

  if (!hours?.length) {
    return <div>No hours logged yet.</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Hours</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {hours.map((hour) => (
          <TableRow key={hour.id}>
            <TableCell>{format(new Date(hour.date), 'PPP')}</TableCell>
            <TableCell>{hour.description}</TableCell>
            <TableCell className="text-right">{hour.hours}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
