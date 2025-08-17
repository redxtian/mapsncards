export type CardType = 'leverage' | 'map' | 'exit' | 'domain' | 'challenge';

export interface BaseCard {
  name: string;
  type: CardType;
  best_for: string;
  steps: string[];
  recovery_tip: string;
  ethical_note: string;
}

export interface LeverageCard extends BaseCard {
  type: 'leverage';
  leverage_focus?: { type: string; actions: string[] };
  deployment_modes?: { direct?: string; subtle?: string };
}

export interface DomainCard extends BaseCard {
  type: 'domain';
  domain_context?: string;
  domain_adaptations?: {
    key_stakeholders?: string[];
    common_constraints?: string[];
    success_metrics?: string[];
  };
}

export interface ChallengeCard extends BaseCard {
  type: 'challenge';
  addresses_obstacle?: string;
  prevention_strategy?: string;
  escalation_path?: string;
}

export interface ExitCard extends BaseCard {
  type: 'exit';
  preservation_focus?: string[];
  re_engagement_conditions?: string;
}

export interface MapCard extends BaseCard {
  type: 'map';
  map_adaptation?: {
    chaotic?: string;
    cooperative?: string;
    adversarial?: string;
    stable?: string;
  };
}

export type AnyCard = LeverageCard | DomainCard | ChallengeCard | ExitCard | MapCard;

export interface CardDeckPayload {
  deck_id?: string;
  scenario_input?: string | null;
  cards: AnyCard[];
  metadata?: Record<string, unknown>;
  validation?: Record<string, unknown>;
  created_at?: string;
}

