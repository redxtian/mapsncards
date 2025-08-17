'use client';

import { useState } from 'react';
import { ScenarioLibrary } from '@/components/scenarios/ScenarioLibrary';
import { CardLibraryBrowser } from '@/components/cards/CardLibraryBrowser';
import { CardGenerator } from '@/components/cards/CardGenerator';
import { SophisticatedLeverageGenerator } from '@/components/cards/SophisticatedLeverageGenerator';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Library, Grid, Wand2, Brain, Sparkles } from 'lucide-react';

export default function GenerateCardsPage() {
  const [selectedScenario, setSelectedScenario] = useState<any>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Generate Strategic Cards
          </h1>
          <p className="text-gray-600 mt-1">
            Create sophisticated leverage cards using AI agents or browse existing scenario libraries
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/cards/library">
              <Grid className="w-4 h-4 mr-2" />
              All Cards
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/cards">
              <Library className="w-4 h-4 mr-2" />
              Deck Manager
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="leverage" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="leverage" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Sophisticated Leverage
          </TabsTrigger>
          <TabsTrigger value="scenario" className="flex items-center gap-2">
            <Wand2 className="w-4 h-4" />
            Scenario-Based
          </TabsTrigger>
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <Library className="w-4 h-4" />
            Browse Library
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leverage" className="mt-6">
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-purple-900">AI-Powered Leverage Generation</h3>
              </div>
              <p className="text-sm text-purple-700">
                Generate psychologically sophisticated, scenario-agnostic leverage cards using specialized AI agents. 
                These cards match the quality of hand-crafted examples with advanced cognitive frameworks.
              </p>
            </div>
            <SophisticatedLeverageGenerator />
          </div>
        </TabsContent>

        <TabsContent value="scenario" className="mt-6">
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Wand2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Scenario-Based Generation</h3>
              </div>
              <p className="text-sm text-blue-700">
                Generate strategic cards for specific negotiation scenarios with customizable card types and complexity.
              </p>
            </div>
            <CardGenerator />
          </div>
        </TabsContent>

        <TabsContent value="browse" className="mt-6">
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-yellow-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Library className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Card Library Browser</h3>
              </div>
              <p className="text-sm text-green-700">
                Browse existing strategic card libraries organized by negotiation scenarios.
              </p>
            </div>
            
            {selectedScenario ? (
              <CardLibraryBrowser 
                scenario={selectedScenario}
                onBack={() => setSelectedScenario(null)}
              />
            ) : (
              <ScenarioLibrary 
                onScenarioSelect={setSelectedScenario}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}