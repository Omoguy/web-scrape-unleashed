
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Key } from 'lucide-react';

interface ApiKeyInputProps {
  apiKey: string;
  onApiKeyChange: (apiKey: string) => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
  apiKey,
  onApiKeyChange
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="apiKey" className="text-sm font-medium">
        <Key className="w-4 h-4 inline mr-1" />
        OpenAI API Key
      </Label>
      <Input
        id="apiKey"
        type="password"
        placeholder="sk-..."
        value={apiKey}
        onChange={(e) => onApiKeyChange(e.target.value)}
        className="h-11"
      />
      <p className="text-xs text-gray-500">
        Your API key is needed to power the AI extraction. It's not stored anywhere.
      </p>
    </div>
  );
};
