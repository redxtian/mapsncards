'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/common';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Zap, 
  Shuffle, 
  Settings2,
  Handshake,
  Sword,
  Waves,
  Shield,
  Building2,
  Scale,
  Heart,
  Home,
  TrendingUp,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Wand2
} from 'lucide-react';

// Zod schema for quick map generation
const quickMapSchema = z.object({
  category: z.enum(['Cooperative', 'Adversarial', 'Chaotic', 'Stable', 'Random']),
  industry: z.string().optional(),
  context: z.string().optional(),
  stakesLevel: z.enum(['High', 'Routine']).optional(),
  engine: z.literal('crewai')
});

type QuickMapFormData = z.infer<typeof quickMapSchema>;

interface QuickMapGeneratorProps {
  onSubmit: (data: QuickMapFormData) => Promise<void>;
  isLoading?: boolean;
}

const CATEGORIES = [
  {
    id: 'Cooperative' as const,
    label: 'Cooperative',
    description: 'Win-win scenarios with shared interests',
    icon: Handshake,
    color: 'bg-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700'
  },
  {
    id: 'Adversarial' as const,
    label: 'Adversarial',
    description: 'Competitive scenarios with opposing interests',
    icon: Sword,
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700'
  },
  {
    id: 'Chaotic' as const,
    label: 'Chaotic',
    description: 'Dynamic scenarios with high uncertainty',
    icon: Waves,
    color: 'bg-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700'
  },
  {
    id: 'Stable' as const,
    label: 'Stable',
    description: 'Structured scenarios with clear parameters',
    icon: Shield,
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700'
  },
  {
    id: 'Random' as const,
    label: 'Random',
    description: 'Surprise me with any scenario type!',
    icon: Shuffle,
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700'
  }
];

const INDUSTRIES = [
  { id: 'business', label: 'Business/Corporate', icon: Building2 },
  { id: 'legal', label: 'Legal/Contracts', icon: Scale },
  { id: 'personal', label: 'Personal/Relationships', icon: Heart },
  { id: 'real-estate', label: 'Real Estate', icon: Home },
  { id: 'sales', label: 'Sales/Partnerships', icon: TrendingUp },
  { id: 'other', label: 'Other', icon: Briefcase }
];

const STAKES_LEVELS = [
  { id: 'High', label: 'High Stakes', description: 'Significant consequences, complex dynamics' },
  { id: 'Routine', label: 'Routine', description: 'Everyday scenarios, moderate complexity' }
];

export function QuickMapGenerator({ onSubmit, isLoading = false }: QuickMapGeneratorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showRefinement, setShowRefinement] = useState(false);

  const form = useForm<QuickMapFormData>({
    resolver: zodResolver(quickMapSchema),
    defaultValues: {
      category: undefined,
      industry: '',
      context: '',
      stakesLevel: 'Routine',
      engine: 'crewai'
    },
    mode: 'onChange'
  });

  const { register, handleSubmit, setValue, watch, formState: { isValid } } = form;
  const watchedValues = watch();

  const onFormSubmit = async (data: QuickMapFormData) => {
    await onSubmit(data);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setValue('category', categoryId as any, { shouldValidate: true });
  };

  const handleQuickGenerate = () => {
    if (selectedCategory) {
      handleSubmit(onFormSubmit)();
    }
  };

  const selectedCategoryData = CATEGORIES.find(cat => cat.id === selectedCategory);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Category Selection */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center">
            <Zap className="w-6 h-6 mr-2 text-blue-600" />
            Quick Map Generation
          </CardTitle>
          <p className="text-gray-600">Choose a negotiation style to generate your map instantly</p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;
              
              return (
                <Card
                  key={category.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    isSelected 
                      ? `${category.bgColor} ${category.borderColor} border-2 shadow-md` 
                      : 'hover:bg-gray-50 border border-gray-200'
                  }`}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 rounded-full ${category.color} flex items-center justify-center mx-auto mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className={`font-semibold ${isSelected ? category.textColor : 'text-gray-900'}`}>
                      {category.label}
                    </h3>
                    <p className={`text-sm mt-1 ${isSelected ? category.textColor : 'text-gray-600'}`}>
                      {category.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Generate Button - Always Visible */}
          <div className="mt-6 text-center space-y-3">
            {!selectedCategory && (
              <p className="text-sm text-gray-500">
                Select a category above to generate your map, or click Random for a surprise!
              </p>
            )}
            
            <Button
              onClick={handleQuickGenerate}
              disabled={!selectedCategory || isLoading}
              size="lg"
              className="min-w-[200px]"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Generating...
                </>
              ) : selectedCategory ? (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  Generate {selectedCategoryData?.label} Map
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  Generate Map
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Need More Control Toggle */}
      {selectedCategory && !isLoading && (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => setShowRefinement(!showRefinement)}
            className="text-gray-600 hover:text-gray-900"
          >
            <Settings2 className="w-4 h-4 mr-2" />
            Need more control?
            {showRefinement ? (
              <ChevronUp className="w-4 h-4 ml-2" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-2" />
            )}
          </Button>
        </div>
      )}

      {/* Refinement Options */}
      {showRefinement && selectedCategory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings2 className="w-5 h-5 mr-2" />
              Fine-tune Your {selectedCategoryData?.label} Map
            </CardTitle>
            <p className="text-gray-600">Add optional context for more specific scenarios</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
              {/* Industry Context */}
              <div className="space-y-3">
                <Label htmlFor="industry">Industry Context (Optional)</Label>
                <Select
                  value={watchedValues.industry}
                  onValueChange={(value) => setValue('industry', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an industry context..." />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((industry) => {
                      const Icon = industry.icon;
                      return (
                        <SelectItem key={industry.id} value={industry.id}>
                          <div className="flex items-center space-x-2">
                            <Icon className="w-4 h-4" />
                            <span>{industry.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Stakes Level */}
              <div className="space-y-3">
                <Label>Stakes Level</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {STAKES_LEVELS.map((stakes) => (
                    <Card
                      key={stakes.id}
                      className={`cursor-pointer transition-all ${
                        watchedValues.stakesLevel === stakes.id
                          ? 'bg-blue-50 border-blue-200 border-2'
                          : 'hover:bg-gray-50 border border-gray-200'
                      }`}
                      onClick={() => setValue('stakesLevel', stakes.id as any)}
                    >
                      <CardContent className="p-4">
                        <h4 className={`font-medium ${
                          watchedValues.stakesLevel === stakes.id ? 'text-blue-700' : 'text-gray-900'
                        }`}>
                          {stakes.label}
                        </h4>
                        <p className={`text-sm mt-1 ${
                          watchedValues.stakesLevel === stakes.id ? 'text-blue-600' : 'text-gray-600'
                        }`}>
                          {stakes.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Additional Context */}
              <div className="space-y-3">
                <Label htmlFor="context">Additional Context (Optional)</Label>
                <Textarea
                  id="context"
                  {...register('context')}
                  placeholder="Any specific details about the situation, relationships, or constraints..."
                  rows={3}
                />
                <p className="text-sm text-gray-500">
                  Provide any additional details to make the scenario more specific to your needs.
                </p>
              </div>

              {/* Generate Button */}
              <div className="text-center pt-4">
                <Button
                  type="submit"
                  disabled={!isValid || isLoading}
                  size="lg"
                  className="min-w-[200px]"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5 mr-2" />
                      Generate Refined Map
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Category Preview */}
      {selectedCategoryData && !showRefinement && (
        <Card className={`${selectedCategoryData.bgColor} ${selectedCategoryData.borderColor} border`}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full ${selectedCategoryData.color} flex items-center justify-center`}>
                <selectedCategoryData.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className={`font-medium ${selectedCategoryData.textColor}`}>
                  {selectedCategoryData.label} Negotiation Map
                </h3>
                <p className={`text-sm ${selectedCategoryData.textColor}`}>
                  Ready to generate a {selectedCategoryData.label.toLowerCase()} scenario with AI agents
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}