
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface WebsiteSelectorProps {
  selectedWebsite: string;
  onWebsiteChange: (website: string) => void;
}

const predefinedWebsites = [
  { name: 'eBay.com', url: 'https://www.ebay.com' },
  { name: 'eBay.de', url: 'https://www.ebay.de' },
  { name: 'DigiKey.com', url: 'https://www.digikey.com' },
  { name: 'DigiKey.de', url: 'https://www.digikey.de' },
  { name: 'RS Online UK', url: 'https://uk.rs-online.com' },
  { name: 'RS Online DE', url: 'https://de.rs-online.com' },
  { name: 'Mouser.com', url: 'https://www.mouser.com' },
  { name: 'Radwell', url: 'https://www.radwell.com' },
];

export const WebsiteSelector: React.FC<WebsiteSelectorProps> = ({
  selectedWebsite,
  onWebsiteChange
}) => {
  const [customUrl, setCustomUrl] = useState('');

  const handleWebsiteSelect = (url: string) => {
    onWebsiteChange(url);
    setCustomUrl('');
  };

  const handleCustomUrlChange = (url: string) => {
    setCustomUrl(url);
    if (url) {
      onWebsiteChange(url);
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Select Website</Label>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {predefinedWebsites.map((website) => (
          <Button
            key={website.url}
            variant={selectedWebsite === website.url ? "default" : "outline"}
            className={`h-auto p-3 text-xs font-medium transition-all duration-200 ${
              selectedWebsite === website.url
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'hover:bg-blue-50 hover:border-blue-300'
            }`}
            onClick={() => handleWebsiteSelect(website.url)}
          >
            {website.name}
          </Button>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="customUrl" className="text-sm text-gray-600">
          Or enter custom website URL
        </Label>
        <Input
          id="customUrl"
          type="url"
          placeholder="https://example.com"
          value={customUrl}
          onChange={(e) => handleCustomUrlChange(e.target.value)}
          className="h-11"
        />
      </div>
    </div>
  );
};
