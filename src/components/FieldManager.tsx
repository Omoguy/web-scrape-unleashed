
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Tag } from 'lucide-react';

interface FieldManagerProps {
  fields: string[];
  onFieldsChange: (fields: string[]) => void;
}

const quickAddFields = [
  'Product Name',
  'Price', 
  'Seller',
  'Condition',
  'Availability',
  'Part Number',
  'Manufacturer',
  'Country'
];

export const FieldManager: React.FC<FieldManagerProps> = ({
  fields,
  onFieldsChange
}) => {
  const [newField, setNewField] = useState('');

  const addField = (fieldName: string) => {
    if (fieldName && !fields.includes(fieldName)) {
      onFieldsChange([...fields, fieldName]);
    }
  };

  const removeField = (fieldName: string) => {
    onFieldsChange(fields.filter(field => field !== fieldName));
  };

  const handleAddCustomField = () => {
    if (newField.trim()) {
      addField(newField.trim());
      setNewField('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddCustomField();
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-purple-600" />
          Information to Extract
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Add Custom Field */}
        <div className="space-y-2">
          <Label htmlFor="newField" className="text-sm font-medium">
            Add Custom Field
          </Label>
          <div className="flex gap-2">
            <Input
              id="newField"
              placeholder="e.g., Shipping Cost, Rating, Reviews"
              value={newField}
              onChange={(e) => setNewField(e.target.value)}
              onKeyPress={handleKeyPress}
              className="h-11"
            />
            <Button 
              onClick={handleAddCustomField}
              className="h-11 px-4 bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Quick Add Buttons */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Quick Add</Label>
          <div className="flex flex-wrap gap-2">
            {quickAddFields.map((field) => (
              <Button
                key={field}
                variant="outline"
                size="sm"
                onClick={() => addField(field)}
                disabled={fields.includes(field)}
                className="h-8 px-3 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                {field}
              </Button>
            ))}
          </div>
        </div>

        {/* Selected Fields */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Selected Fields ({fields.length})
          </Label>
          <div className="max-h-40 overflow-y-auto border rounded-lg p-3 bg-gray-50/50">
            {fields.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No fields selected. Add some fields to extract.
              </p>
            ) : (
              <div className="space-y-2">
                {fields.map((field) => (
                  <div
                    key={field}
                    className="flex items-center justify-between p-2 bg-white rounded-md border"
                  >
                    <span className="text-sm font-medium">{field}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeField(field)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
