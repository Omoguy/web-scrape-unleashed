
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Key, ExternalLink, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { scrapingBeeService } from '@/services/scrapingBeeService';

interface ScrapingBeeApiKeyInputProps {
  apiKey: string;
  onApiKeyChange: (apiKey: string) => void;
}

export const ScrapingBeeApiKeyInput: React.FC<ScrapingBeeApiKeyInputProps> = ({
  apiKey,
  onApiKeyChange
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'valid' | 'invalid' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const validateApiKey = async () => {
    if (!apiKey.trim()) return;
    
    setIsValidating(true);
    setValidationStatus(null);
    setErrorMessage('');

    try {
      const result = await scrapingBeeService.testApiKey(apiKey);
      
      if (result.valid) {
        setValidationStatus('valid');
      } else {
        setValidationStatus('invalid');
        setErrorMessage(result.error || 'Invalid API key');
      }
    } catch (error) {
      setValidationStatus('invalid');
      setErrorMessage('Failed to validate API key');
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusBadge = () => {
    if (isValidating) {
      return (
        <Badge variant="secondary" className="ml-2">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Validating...
        </Badge>
      );
    }
    
    if (validationStatus === 'valid') {
      return (
        <Badge className="ml-2 bg-green-100 text-green-700">
          <CheckCircle className="w-3 h-3 mr-1" />
          Valid
        </Badge>
      );
    }
    
    if (validationStatus === 'invalid') {
      return (
        <Badge variant="destructive" className="ml-2">
          <XCircle className="w-3 h-3 mr-1" />
          Invalid
        </Badge>
      );
    }
    
    return null;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="apiKey" className="text-sm font-medium flex items-center">
          <Key className="w-4 h-4 mr-1" />
          ScrapingBee API Key
        </Label>
        <a 
          href="https://app.scrapingbee.com/account/register" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
        >
          Get Free API Key
          <ExternalLink className="w-3 h-3 ml-1" />
        </a>
      </div>
      
      <div className="flex gap-2">
        <Input
          id="apiKey"
          type="password"
          placeholder="Enter your ScrapingBee API key..."
          value={apiKey}
          onChange={(e) => {
            onApiKeyChange(e.target.value);
            setValidationStatus(null);
            setErrorMessage('');
          }}
          className="h-11 flex-1"
        />
        <Button 
          onClick={validateApiKey}
          disabled={!apiKey.trim() || isValidating}
          variant="outline"
          size="sm"
          className="px-3"
        >
          {isValidating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Test'
          )}
        </Button>
      </div>

      <div className="flex items-center justify-between">
        {getStatusBadge()}
        {errorMessage && (
          <p className="text-xs text-red-600">{errorMessage}</p>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-700">
          🆓 <strong>Free Tier:</strong> 1,000 requests/month<br/>
          💰 <strong>Starter:</strong> $29/month for 50,000 requests<br/>
          🚀 <strong>Growth:</strong> $99/month for 200,000 requests<br/>
          ✨ Includes JavaScript rendering, IP rotation & CAPTCHA solving
        </p>
      </div>
    </div>
  );
};
