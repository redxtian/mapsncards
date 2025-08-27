'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuickMapGenerator } from '@/components/forms/quick-map-generator';
import { ScenarioBuilder } from '@/components/forms/scenario-builder';
import { ArrowLeft, Zap, Edit3 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/auth/protected-route';

type CreateMode = 'quick' | 'custom';

export default function CreateMapPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [createMode, setCreateMode] = useState<CreateMode>('quick');
  const router = useRouter();

  const handleQuickMapSubmit = async (data: {
    category: string;
    industry?: string;
    context?: string;
    stakesLevel?: string;
    engine: 'crewai';
  }) => {
    setIsLoading(true);
    
    try {
      // Generate scenario prompt based on selections
      let scenarioPrompt = `Generate a ${data.category.toLowerCase()} negotiation scenario`;
      
      if (data.industry) {
        scenarioPrompt += ` in the ${data.industry} industry`;
      }
      
      if (data.stakesLevel) {
        scenarioPrompt += ` with ${data.stakesLevel.toLowerCase()} stakes`;
      }
      
      if (data.context) {
        scenarioPrompt += `. Additional context: ${data.context}`;
      }
      
      scenarioPrompt += '. Create a realistic, detailed negotiation scenario with specific stakeholders, objectives, and challenges.';

      // Call the API to generate the map
      const response = await fetch('/api/maps/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenario: scenarioPrompt,
          engine: data.engine,
          quickGeneration: true,
          category: data.category,
          industry: data.industry,
          stakesLevel: data.stakesLevel
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.map_id) {
        toast.success('Map generated successfully!');
        // Navigate to the generated map
        router.push(`/maps/${result.map_id}`);
      } else {
        throw new Error(result.message || 'Failed to generate map');
      }
    } catch (error) {
      console.error('Error generating map:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate map');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomScenarioSubmit = async (data: {
    title: string;
    description: string;
    engine: 'crewai' | 'langchain';
  }) => {
    setIsLoading(true);
    
    try {
      // Call the API to generate the map
      const response = await fetch('/api/maps/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenario: data.description,
          engine: data.engine,
          customScenario: true
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.map_id) {
        toast.success('Map generated successfully!');
        // Navigate to the generated map
        router.push(`/maps/${result.map_id}`);
      } else {
        throw new Error(result.message || 'Failed to generate map');
      }
    } catch (error) {
      console.error('Error generating map:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate map');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/maps">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Maps
          </Link>
        </Button>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Map</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Generate strategic negotiation maps instantly or create custom scenarios
          </p>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="grid md:grid-cols-2 gap-4">
          <Card 
            className={`cursor-pointer transition-all ${
              createMode === 'quick' 
                ? 'bg-blue-50 border-blue-200 border-2 shadow-md' 
                : 'hover:bg-gray-50 border border-gray-200'
            }`}
            onClick={() => setCreateMode('quick')}
          >
            <CardHeader className="text-center">
              <div className={`w-12 h-12 rounded-full ${
                createMode === 'quick' ? 'bg-blue-500' : 'bg-gray-400'
              } flex items-center justify-center mx-auto mb-2`}>
                <Zap className="w-6 h-6 text-white" />
              </div>
              <CardTitle className={createMode === 'quick' ? 'text-blue-700' : 'text-gray-900'}>
                Quick Generate
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className={`text-sm ${createMode === 'quick' ? 'text-blue-600' : 'text-gray-600'}`}>
                Choose a category and let AI create a complete negotiation scenario for you
              </p>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all ${
              createMode === 'custom' 
                ? 'bg-purple-50 border-purple-200 border-2 shadow-md' 
                : 'hover:bg-gray-50 border border-gray-200'
            }`}
            onClick={() => setCreateMode('custom')}
          >
            <CardHeader className="text-center">
              <div className={`w-12 h-12 rounded-full ${
                createMode === 'custom' ? 'bg-purple-500' : 'bg-gray-400'
              } flex items-center justify-center mx-auto mb-2`}>
                <Edit3 className="w-6 h-6 text-white" />
              </div>
              <CardTitle className={createMode === 'custom' ? 'text-purple-700' : 'text-gray-900'}>
                Custom Scenario
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className={`text-sm ${createMode === 'custom' ? 'text-purple-600' : 'text-gray-600'}`}>
                Build a detailed custom scenario with guided steps and specific requirements
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content Based on Mode */}
      {createMode === 'quick' ? (
        <QuickMapGenerator 
          onSubmit={handleQuickMapSubmit}
          isLoading={isLoading}
        />
      ) : (
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6 bg-purple-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Edit3 className="w-6 h-6 text-purple-600" />
                <div>
                  <h3 className="font-medium text-purple-900">Custom Scenario Builder</h3>
                  <p className="text-sm text-purple-700">
                    Create a detailed negotiation scenario with specific stakeholders, objectives, and constraints
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <ScenarioBuilder 
            onSubmit={handleCustomScenarioSubmit}
            isLoading={isLoading}
          />
        </div>
      )}
      </div>
    </ProtectedRoute>
  );
}