import React from 'react';
import { AnyCard } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Props = { card: AnyCard; index?: number };

const typeColor: Record<string, string> = {
  leverage: 'bg-purple-100 text-purple-800',
  domain: 'bg-blue-100 text-blue-800',
  challenge: 'bg-rose-100 text-rose-800',
  exit: 'bg-amber-100 text-amber-800',
  map: 'bg-teal-100 text-teal-800',
};

export function CardItem({ card, index }: Props) {
  const color = typeColor[card.type] || 'bg-gray-100 text-gray-800';

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {index !== undefined && <span className="text-gray-400 mr-2">{index + 1}.</span>}
            {card.name}
          </CardTitle>
          <Badge className={color}>{card.type}</Badge>
        </div>
        <p className="text-sm text-gray-600 mt-1">Best for: {card.best_for}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Steps */}
        {card.steps?.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Steps</h4>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              {card.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Type specific */}
        {card.type === 'leverage' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {'leverage_focus' in card && card.leverage_focus && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Leverage Focus</h4>
                <p className="text-sm text-gray-700">Type: {card.leverage_focus.type}</p>
                <p className="text-sm text-gray-700">Actions: {card.leverage_focus.actions?.join(', ')}</p>
              </div>
            )}
            {'deployment_modes' in card && card.deployment_modes && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Deployment Modes</h4>
                <p className="text-sm text-gray-700">Direct: {card.deployment_modes.direct}</p>
                <p className="text-sm text-gray-700">Subtle: {card.deployment_modes.subtle}</p>
              </div>
            )}
          </div>
        )}

        {card.type === 'domain' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {'domain_context' in card && card.domain_context && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Domain</h4>
                <p className="text-sm text-gray-700">{card.domain_context}</p>
              </div>
            )}
            {'domain_adaptations' in card && card.domain_adaptations && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Domain Adaptations</h4>
                <div className="text-sm text-gray-700">
                  {card.domain_adaptations.key_stakeholders?.length ? (
                    <p><span className="font-medium">Stakeholders:</span> {card.domain_adaptations.key_stakeholders.join(', ')}</p>
                  ) : null}
                  {card.domain_adaptations.common_constraints?.length ? (
                    <p><span className="font-medium">Constraints:</span> {card.domain_adaptations.common_constraints.join(', ')}</p>
                  ) : null}
                  {card.domain_adaptations.success_metrics?.length ? (
                    <p><span className="font-medium">Success:</span> {card.domain_adaptations.success_metrics.join(', ')}</p>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        )}

        {card.type === 'challenge' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {'addresses_obstacle' in card && card.addresses_obstacle && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Addresses</h4>
                <p className="text-sm text-gray-700">{card.addresses_obstacle}</p>
              </div>
            )}
            <div>
              {'prevention_strategy' in card && card.prevention_strategy && (
                <p className="text-sm text-gray-700"><span className="font-medium">Prevention:</span> {card.prevention_strategy}</p>
              )}
              {'escalation_path' in card && card.escalation_path && (
                <p className="text-sm text-gray-700"><span className="font-medium">Escalation:</span> {card.escalation_path}</p>
              )}
            </div>
          </div>
        )}

        {card.type === 'map' && 'map_adaptation' in card && card.map_adaptation && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Adaptations</h4>
            <ul className="text-sm text-gray-700 list-disc list-inside">
              {Object.entries(card.map_adaptation).map(([k, v]) => (
                <li key={k}><span className="capitalize font-medium">{k}:</span> {v as string}</li>)
              )}
            </ul>
          </div>
        )}

        {card.type === 'exit' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {'preservation_focus' in card && Array.isArray(card.preservation_focus) && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Preserves</h4>
                <p className="text-sm text-gray-700">{card.preservation_focus.join(', ')}</p>
              </div>
            )}
            {'re_engagement_conditions' in card && card.re_engagement_conditions && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Re-engage When</h4>
                <p className="text-sm text-gray-700">{card.re_engagement_conditions}</p>
              </div>
            )}
          </div>
        )}

        {/* Ethics */}
        <div className="border-t pt-3">
          <p className="text-xs text-gray-600"><span className="font-medium">Recovery tip:</span> {card.recovery_tip}</p>
          <p className="text-xs text-gray-600"><span className="font-medium">Ethical note:</span> {card.ethical_note}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default CardItem;

