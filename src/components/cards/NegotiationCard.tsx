'use client';

import React from 'react';
import { AnyCard } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Shield, 
  Users, 
  Map, 
  DoorOpen, 
  AlertTriangle,
  Target,
  Zap,
  Clock,
  Star
} from 'lucide-react';

interface NegotiationCardProps {
  card: AnyCard;
  index?: number;
}

export function NegotiationCard({ card, index }: NegotiationCardProps) {
  const getCardIcon = (type: string) => {
    const icons = {
      leverage: Shield,
      domain: Users,
      map: Map,
      exit: DoorOpen,
      challenge: AlertTriangle
    };
    return icons[type as keyof typeof icons] || Target;
  };

  const getCardTheme = (type: string) => {
    const themes = {
      leverage: {
        bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
        border: 'border-blue-300',
        headerBg: 'bg-blue-600',
        iconColor: 'text-blue-100',
        costBg: 'bg-blue-500',
        textColor: 'text-blue-900'
      },
      domain: {
        bg: 'bg-gradient-to-br from-green-50 to-green-100',
        border: 'border-green-300',
        headerBg: 'bg-green-600',
        iconColor: 'text-green-100',
        costBg: 'bg-green-500',
        textColor: 'text-green-900'
      },
      map: {
        bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
        border: 'border-purple-300',
        headerBg: 'bg-purple-600',
        iconColor: 'text-purple-100',
        costBg: 'bg-purple-500',
        textColor: 'text-purple-900'
      },
      exit: {
        bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
        border: 'border-orange-300',
        headerBg: 'bg-orange-600',
        iconColor: 'text-orange-100',
        costBg: 'bg-orange-500',
        textColor: 'text-orange-900'
      },
      challenge: {
        bg: 'bg-gradient-to-br from-red-50 to-red-100',
        border: 'border-red-300',
        headerBg: 'bg-red-600',
        iconColor: 'text-red-100',
        costBg: 'bg-red-500',
        textColor: 'text-red-900'
      }
    };
    return themes[type as keyof typeof themes] || themes.leverage;
  };

  const getCostInfo = (card: AnyCard) => {
    // Determine "cost" based on card type and complexity
    if (card.type === 'leverage') {
      return { icon: Zap, label: 'Research', difficulty: 'Medium' };
    } else if (card.type === 'domain') {
      return { icon: Users, label: 'Context', difficulty: 'Low' };
    } else if (card.type === 'exit') {
      return { icon: Clock, label: 'Timing', difficulty: 'High' };
    } else if (card.type === 'challenge') {
      return { icon: AlertTriangle, label: 'Response', difficulty: 'High' };
    } else {
      return { icon: Star, label: 'Strategy', difficulty: 'Medium' };
    }
  };

  const getConcreteScripts = (card: AnyCard): string[] => {
    // Convert placeholder steps into concrete examples
    if (!card.steps) return [];
    
    return card.steps.map(step => {
      // Replace common placeholders with realistic examples
      return step
        .replace(/\[salary range\]/g, '$85,000-95,000')
        .replace(/\[specific data\]/g, 'market research from Glassdoor and PayScale')
        .replace(/\[company name\]/g, 'our company')
        .replace(/\[your name\]/g, 'your name')
        .replace(/\[specific achievement\]/g, 'the Q3 project delivery')
        .replace(/\[percentage\]/g, '15%')
        .replace(/\[timeframe\]/g, 'within the next quarter')
        .replace(/\[alternative\]/g, 'flexible work arrangements')
        .replace(/\[benefit\]/g, 'additional vacation days')
        .replace(/\[skill\]/g, 'project management certification')
        .replace(/\[deadline\]/g, 'end of this month')
        .replace(/\[concern\]/g, 'workload balance')
        .replace(/\[solution\]/g, 'gradual transition plan');
    });
  };

  const theme = getCardTheme(card.type);
  const IconComponent = getCardIcon(card.type);
  const costInfo = getCostInfo(card);
  const CostIcon = costInfo.icon;
  const concreteScripts = getConcreteScripts(card);

  return (
    <Card className={`${theme.bg} ${theme.border} border-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 w-full max-w-sm mx-auto`}>
      {/* Header */}
      <div className={`${theme.headerBg} p-3 rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconComponent className={`w-5 h-5 ${theme.iconColor}`} />
            <h3 className="font-bold text-white text-sm leading-tight">
              {card.name}
            </h3>
          </div>
          <div className={`${theme.costBg} px-2 py-1 rounded text-xs text-white font-medium flex items-center gap-1`}>
            <CostIcon className="w-3 h-3" />
            {costInfo.label}
          </div>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Type Badge */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={`${theme.textColor} border-current text-xs`}>
            {card.type.toUpperCase()}
          </Badge>
          <div className="text-xs text-gray-600">
            {costInfo.difficulty} Complexity
          </div>
        </div>

        {/* Best For Section */}
        <div className="bg-white/70 rounded p-3 border">
          <h4 className={`font-semibold text-xs ${theme.textColor} mb-1`}>
            BEST FOR
          </h4>
          <p className="text-xs text-gray-700 leading-relaxed">
            {card.best_for}
          </p>
        </div>

        {/* Ability/Mechanics Section */}
        {concreteScripts.length > 0 && (
          <div className="bg-white/70 rounded p-3 border">
            <h4 className={`font-semibold text-xs ${theme.textColor} mb-2`}>
              HOW TO USE
            </h4>
            <div className="space-y-2">
              {concreteScripts.slice(0, 2).map((script, idx) => (
                <div key={idx} className="text-xs text-gray-700 leading-relaxed">
                  <span className="font-medium">{idx + 1}.</span> {script}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sample Scripts Section */}
        {card.type === 'leverage' && 'deployment_modes' in card && card.deployment_modes && (
          <div className="bg-white/70 rounded p-3 border">
            <h4 className={`font-semibold text-xs ${theme.textColor} mb-2`}>
              SAMPLE SCRIPTS
            </h4>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-xs text-gray-600">Direct:</span>
                <p className="text-xs text-gray-700 italic">
                  "{card.deployment_modes.direct}"
                </p>
              </div>
              <div>
                <span className="font-medium text-xs text-gray-600">Subtle:</span>
                <p className="text-xs text-gray-700 italic">
                  "{card.deployment_modes.subtle}"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Flavor Text (Recovery + Ethics) */}
        <div className="border-t pt-2 space-y-1">
          {card.recovery_tip && (
            <p className="text-xs text-gray-600 italic">
              <span className="font-medium">If blocked:</span> {card.recovery_tip}
            </p>
          )}
          {card.ethical_note && (
            <p className="text-xs text-gray-500 italic">
              💡 {card.ethical_note}
            </p>
          )}
        </div>

        {/* Card Number (optional) */}
        {index !== undefined && (
          <div className="text-xs text-gray-400 text-center pt-1">
            #{index + 1}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default NegotiationCard;