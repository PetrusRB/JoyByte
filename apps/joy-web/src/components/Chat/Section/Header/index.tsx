import { Button } from "@/components/Button";
import { Input } from "@/components/ui/Input";
import { MoreVertical, Search } from "lucide-react";

type SectionHeaderProps = {
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
};
const SectionHeader = ({ searchTerm, setSearchTerm }: SectionHeaderProps) => {
  return (
    <div className="p-4 border-b" style={{ borderColor: "#fed7aa" }}>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Conversas</h1>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" />
        <Input
          placeholder="Pesquisar"
          value={searchTerm}
          onChange={(e: any) => setSearchTerm(e.currentTarget.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
};
export default SectionHeader;
