
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play } from 'lucide-react';

interface ActionPanelProps {
  isLoading: boolean;
  progress: number;
  onStartScraping: () => void;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({
  isLoading,
  progress,
  onStartScraping
}) => {
  return (
    <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
      <CardContent className="p-6">
        <Button
          onClick={onStartScraping}
          disabled={isLoading}
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              Scraping...
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Start Scraping
            </>
          )}
        </Button>
        
        {isLoading && (
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-gray-600 mt-2 text-center">
              Processing... {Math.round(progress)}%
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
