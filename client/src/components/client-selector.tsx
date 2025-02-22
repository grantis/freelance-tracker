import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface Client {
  id: number;
  name: string;
}

interface ClientSelectorProps {
  clients?: Client[];
  selectedClient: number | null;
  onSelectClient: (clientId: number) => void;
  isFreelancer: boolean;
  isLoading?: boolean;
}

export default function ClientSelector({
  clients = [],
  selectedClient,
  onSelectClient,
  isFreelancer,
  isLoading = false
}: ClientSelectorProps) {
  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  if (!clients.length) {
    return <div>No clients found.</div>;
  }

  return (
    <Select
      value={selectedClient?.toString()}
      onValueChange={(value) => onSelectClient(parseInt(value))}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={`Select a ${isFreelancer ? 'client' : 'project'}`} />
      </SelectTrigger>
      <SelectContent>
        {clients.map((client) => (
          <SelectItem key={client.id} value={client.id.toString()}>
            {client.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}