
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WebsiteSelector } from '@/components/WebsiteSelector';

interface SearchConfigurationProps {
  selectedWebsite: string;
  onWebsiteChange: (website: string) => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  maxResults: string;
  onMaxResultsChange: (max: string) => void;
}

export const SearchConfiguration: React.FC<SearchConfigurationProps> = ({
  selectedWebsite,
  onWebsiteChange,
  searchTerm,
  onSearchTermChange,
  maxResults,
  onMaxResultsChange
}) => {
  return (
    <div className="space-y-6">
      <WebsiteSelector 
        selectedWebsite={selectedWebsite}
        onWebsiteChange={onWebsiteChange}
      />
      
      <div className="space-y-2">
        <Label htmlFor="searchTerm" className="text-sm font-medium">
          🔎 Product to Search
        </Label>
        <Input
          id="searchTerm"
          placeholder="e.g., arduino uno, resistor 10k, iphone 15"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxResults" className="text-sm font-medium">
          📊 Maximum Results
        </Label>
        <Select value={maxResults} onValueChange={onMaxResultsChange}>
          <SelectTrigger className="h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3 products</SelectItem>
            <SelectItem value="5">5 products</SelectItem>
            <SelectItem value="10">10 products</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
