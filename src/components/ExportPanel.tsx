
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ExportPanelProps {
  results: Array<Record<string, string>>;
  onExport: (format: 'json' | 'csv') => void;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  results,
  onExport
}) => {
  if (results.length === 0) return null;

  return (
    <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg">Export Results</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-3">
        <Button
          onClick={() => onExport('json')}
          variant="outline"
          className="w-full"
        >
          <Download className="w-4 h-4 mr-2" />
          Export JSON
        </Button>
        <Button
          onClick={() => onExport('csv')}
          variant="outline"
          className="w-full"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </CardContent>
    </Card>
  );
};
