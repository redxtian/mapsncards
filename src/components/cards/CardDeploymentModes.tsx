'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  Eye, 
  Target, 
  Brain,
  CheckCircle
} from 'lucide-react';

interface DeploymentMode {
  direct?: string;
  subtle?: string;
}

interface CardDeploymentModesProps {
  cardName: string;
  deploymentModes: DeploymentMode;
  leverageFocus?: string;
  onModeSelect?: (mode: 'direct' | 'subtle') => void;
  selectedMode?: 'direct' | 'subtle';
}

export function CardDeploymentModes({ 
  cardName, 
  deploymentModes, 
  leverageFocus,
  onModeSelect,
  selectedMode 
}: CardDeploymentModesProps) {
  const [activeMode, setActiveMode] = useState<'direct' | 'subtle'>(selectedMode || 'direct');

  const handleModeChange = (mode: 'direct' | 'subtle') => {
    setActiveMode(mode);
    onModeSelect?.(mode);
  };

  const getModeInfo = (mode: 'direct' | 'subtle') => {
    if (mode === 'direct') {
      return {
        icon: Zap,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        title: 'Direct Approach',
        description: 'Straightforward, overt strategy',
        characteristics: [
          'Clear and transparent communication',
          'Immediate presentation of evidence',
          'Direct request or proposal',
          'Lower risk of misunderstanding'
        ]
      };
    } else {
      return {
        icon: Brain,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        title: 'Subtle Approach',
        description: 'Indirect, inception-style strategy',
        characteristics: [
          'Leads counterpart to discovery',
          'Uses questions and implications',
          'Builds gradual awareness',
          'Preserves face and dignity'
        ]
      };
    }
  };

  const directInfo = getModeInfo('direct');
  const subtleInfo = getModeInfo('subtle');

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-gray-600" />
            <CardTitle className="text-base">Deployment Strategy</CardTitle>
            {leverageFocus && (
              <Badge variant="outline" className="text-xs">
                {leverageFocus.charAt(0).toUpperCase() + leverageFocus.slice(1)} Leverage
              </Badge>
            )}
          </div>
          
          {selectedMode && (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              {getModeInfo(selectedMode).title}
            </Badge>
          )}
        </div>
        
        <p className="text-sm text-gray-600">
          Choose how to deploy "{cardName}" in your negotiation
        </p>
      </CardHeader>

      <CardContent>
        <Tabs value={activeMode} onValueChange={(value) => handleModeChange(value as 'direct' | 'subtle')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="direct" 
              className="flex items-center gap-2"
              disabled={!deploymentModes.direct}
            >
              <Zap className="w-4 h-4" />
              Direct
            </TabsTrigger>
            <TabsTrigger 
              value="subtle" 
              className="flex items-center gap-2"
              disabled={!deploymentModes.subtle}
            >
              <Brain className="w-4 h-4" />
              Subtle
            </TabsTrigger>
          </TabsList>

          {deploymentModes.direct && (
            <TabsContent value="direct" className="space-y-4">
              <div className={`rounded-lg p-4 ${directInfo.bgColor} border ${directInfo.borderColor}`}>
                <div className="flex items-center gap-2 mb-2">
                  <directInfo.icon className={`w-5 h-5 ${directInfo.color}`} />
                  <h3 className="font-medium">{directInfo.title}</h3>
                </div>
                
                <p className="text-sm text-gray-700 mb-3">
                  {directInfo.description}
                </p>
                
                <div className="bg-white rounded-md p-3 border border-blue-100">
                  <p className="text-sm font-medium mb-1">Implementation:</p>
                  <p className="text-sm text-gray-700">
                    {deploymentModes.direct}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Key Characteristics:</h4>
                <ul className="text-xs space-y-1">
                  {directInfo.characteristics.map((char, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-blue-600 rounded-full" />
                      {char}
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>
          )}

          {deploymentModes.subtle && (
            <TabsContent value="subtle" className="space-y-4">
              <div className={`rounded-lg p-4 ${subtleInfo.bgColor} border ${subtleInfo.borderColor}`}>
                <div className="flex items-center gap-2 mb-2">
                  <subtleInfo.icon className={`w-5 h-5 ${subtleInfo.color}`} />
                  <h3 className="font-medium">{subtleInfo.title}</h3>
                </div>
                
                <p className="text-sm text-gray-700 mb-3">
                  {subtleInfo.description}
                </p>
                
                <div className="bg-white rounded-md p-3 border border-purple-100">
                  <p className="text-sm font-medium mb-1">Implementation:</p>
                  <p className="text-sm text-gray-700">
                    {deploymentModes.subtle}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Key Characteristics:</h4>
                <ul className="text-xs space-y-1">
                  {subtleInfo.characteristics.map((char, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-purple-600 rounded-full" />
                      {char}
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>
          )}
        </Tabs>

        {/* Selection Actions */}
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Button 
            size="sm" 
            variant={activeMode === 'direct' ? 'default' : 'outline'}
            onClick={() => handleModeChange('direct')}
            disabled={!deploymentModes.direct}
            className="flex items-center gap-1"
          >
            <Zap className="w-3 h-3" />
            Use Direct
          </Button>
          
          <Button 
            size="sm" 
            variant={activeMode === 'subtle' ? 'default' : 'outline'}
            onClick={() => handleModeChange('subtle')}
            disabled={!deploymentModes.subtle}
            className="flex items-center gap-1"
          >
            <Brain className="w-3 h-3" />
            Use Subtle
          </Button>
        </div>

        {/* Best Practice Tip */}
        <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
          <div className="flex items-start gap-2">
            <Eye className="w-4 h-4 text-gray-500 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-gray-700">Pro Tip:</p>
              <p className="text-xs text-gray-600">
                {activeMode === 'direct' 
                  ? 'Direct approaches work best when you have strong evidence and a collaborative relationship.'
                  : 'Subtle approaches are ideal when the topic is sensitive or when you want to avoid confrontation.'
                }
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}