import { Metadata } from 'next';
import { ScenarioLibraryPage } from '@/components/scenarios/scenario-library-page';

export const metadata: Metadata = {
  title: 'Browse Scenarios - Negotiation Maps',
  description: 'Discover proven negotiation scenarios to kickstart your map creation',
};

export default function ScenariosPage() {
  return <ScenarioLibraryPage />;
}