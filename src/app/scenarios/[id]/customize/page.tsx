'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';

const ScenarioCustomizerPage = dynamic(
  () => import('@/components/scenarios/scenario-customizer-page').then(mod => mod.default),
  { 
    ssr: false,
    loading: () => (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-2"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }
);

export default function ScenarioCustomizePage({ params: _params }: { params: Promise<{ id: string }> }) {
  useEffect(() => {
    document.title = 'Customize Scenario - Negotiation Maps';
  }, []);

  return <ScenarioCustomizerPage />;
}