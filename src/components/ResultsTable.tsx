
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3 } from 'lucide-react';

interface ResultsTableProps {
  results: Array<Record<string, string>>;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ results }) => {
  if (results.length === 0) return null;

  const headers = Object.keys(results[0]);

  const getConfidenceBadge = (confidence: string) => {
    const score = parseFloat(confidence);
    if (score >= 0.8) {
      return <Badge className="bg-green-100 text-green-700">High ({Math.round(score * 100)}%)</Badge>;
    } else if (score >= 0.6) {
      return <Badge className="bg-yellow-100 text-yellow-700">Medium ({Math.round(score * 100)}%)</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-700">Low ({Math.round(score * 100)}%)</Badge>;
    }
  };

  const getAvailabilityBadge = (availability: string) => {
    const lower = availability.toLowerCase();
    if (lower.includes('in stock')) {
      return <Badge className="bg-green-100 text-green-700">{availability}</Badge>;
    } else if (lower.includes('limited')) {
      return <Badge className="bg-yellow-100 text-yellow-700">{availability}</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-700">{availability}</Badge>;
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-green-600" />
          Scraping Results ({results.length} products found)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                {headers.map((header) => (
                  <TableHead key={header} className="font-semibold text-gray-700 py-4">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result, index) => (
                <TableRow key={index} className="hover:bg-blue-50/50 transition-colors">
                  {headers.map((header) => (
                    <TableCell key={header} className="py-4">
                      {header.toLowerCase().includes('confidence') ? (
                        getConfidenceBadge(result[header])
                      ) : header.toLowerCase().includes('availability') ? (
                        getAvailabilityBadge(result[header])
                      ) : header.toLowerCase().includes('price') ? (
                        <span className="font-semibold text-green-600">{result[header]}</span>
                      ) : (
                        <span className="text-gray-700">{result[header] || 'N/A'}</span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
