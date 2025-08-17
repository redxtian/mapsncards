'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Heart, 
  LifeBuoy, 
  Shield, 
  ChevronDown, 
  ChevronRight 
} from 'lucide-react';

interface CardRecoveryTipsProps {
  cardName: string;
  recoveryTip: string;
  ethicalNote: string;
  cardType?: 'leverage' | 'domain' | 'map' | 'exit' | 'challenge';
  isExpanded?: boolean;
}

export function CardRecoveryTips({ 
  cardName, 
  recoveryTip, 
  ethicalNote, 
  cardType = 'leverage',
  isExpanded = false 
}: CardRecoveryTipsProps) {
  const [expanded, setExpanded] = useState(isExpanded);

  const getCardTypeInfo = (type: string) => {
    switch (type) {
      case 'leverage':
        return { color: 'bg-blue-50 border-blue-200', icon: Shield, label: 'Leverage Strategy' };
      case 'domain':
        return { color: 'bg-green-50 border-green-200', icon: Heart, label: 'Domain Specific' };
      case 'map':
        return { color: 'bg-purple-50 border-purple-200', icon: LifeBuoy, label: 'Adaptive Strategy' };
      case 'exit':
        return { color: 'bg-orange-50 border-orange-200', icon: AlertTriangle, label: 'Exit Strategy' };
      case 'challenge':
        return { color: 'bg-red-50 border-red-200', icon: AlertTriangle, label: 'Challenge Response' };
      default:
        return { color: 'bg-gray-50 border-gray-200', icon: LifeBuoy, label: 'Strategy' };
    }
  };

  const typeInfo = getCardTypeInfo(cardType);
  const IconComponent = typeInfo.icon;

  return (
    <Card className={`${typeInfo.color} transition-all duration-200`}>
      <CardHeader 
        className="cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconComponent className="w-5 h-5 text-gray-600" />
            <CardTitle className="text-base">
              Recovery & Ethics Guide
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {typeInfo.label}
            </Badge>
          </div>
          
          <Button variant="ghost" size="sm">
            {expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        <p className="text-sm text-gray-600">
          What to do if "{cardName}" doesn't work as expected
        </p>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          {/* Recovery Strategy */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <LifeBuoy className="w-4 h-4 text-blue-600" />
              <h4 className="font-medium text-sm">Recovery Strategy</h4>
            </div>
            
            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-sm">
                {recoveryTip}
              </AlertDescription>
            </Alert>
          </div>

          {/* Ethical Guidelines */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-green-600" />
              <h4 className="font-medium text-sm">Ethical Considerations</h4>
            </div>
            
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-sm">
                {ethicalNote}
              </AlertDescription>
            </Alert>
          </div>

          {/* General Principles */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <h4 className="font-medium text-sm">General Principles</h4>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
              <ul className="text-xs space-y-1 text-purple-800">
                <li>• Always prioritize long-term relationships over short-term gains</li>
                <li>• If resistance increases, step back and reassess the situation</li>
                <li>• Look for win-win solutions that address underlying interests</li>
                <li>• Be prepared to gracefully exit if the strategy isn't working</li>
                <li>• Maintain transparency and avoid deceptive tactics</li>
              </ul>
            </div>
          </div>

          {/* Warning Signs */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <h4 className="font-medium text-sm">Warning Signs to Watch For</h4>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
              <ul className="text-xs space-y-1 text-orange-800">
                <li>• Increased tension or defensive responses</li>
                <li>• Counterpart becoming less communicative</li>
                <li>• Your strategy feeling forced or unnatural</li>
                <li>• Ethical concerns arising during execution</li>
                <li>• Damage to trust or relationship quality</li>
              </ul>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" className="text-xs">
              Need More Help?
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              Report Issue
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}