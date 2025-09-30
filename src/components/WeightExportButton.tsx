import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useWeightStore } from '@/hooks/use-weight-store';
export function WeightExportButton() {
  const exportEntries = useWeightStore((state) => state.exportEntries);
  const entries = useWeightStore((state) => state.entries);
  const handleExport = () => {
    if (entries.length === 0) {
      toast.info("No data to export.", {
        description: "Log some weight entries first.",
      });
      return;
    }
    try {
      const csvData = exportEntries();
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      const today = new Date().toISOString().slice(0, 10);
      link.setAttribute('download', `momentum-weight-export-${today}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Data exported successfully!");
    } catch (error) {
      console.error("Failed to export data:", error);
      toast.error("Export failed", {
        description: "Could not export your data. Please try again.",
      });
    }
  };
  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      Export
    </Button>
  );
}