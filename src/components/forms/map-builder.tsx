'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/common';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Save, 
  RotateCcw, 
  Eye, 
  Copy,
  Wand2,
  FileText,
  Target,
  AlertTriangle,
  Settings
} from 'lucide-react';
import { NegotiationMap, DimensionRating } from '@/types/map';
import { toast } from 'sonner';

// Zod schema for map editing
const mapEditSchema = z.object({
  mapName: z.string().min(5, 'Map name must be at least 5 characters'),
  mapCategory: z.enum(['Chaotic', 'Stable', 'Adversarial', 'Cooperative']),
  dimensions: z.object({
    variability: z.object({
      rating: z.enum(['Low', 'Medium', 'High']),
      description: z.string().min(10, 'Description required')
    }),
    opposition: z.object({
      rating: z.enum(['Low', 'Medium', 'High']),
      description: z.string().min(10, 'Description required')
    }),
    cooperation: z.object({
      rating: z.enum(['Low', 'Medium', 'High']),
      description: z.string().min(10, 'Description required')
    })
  }),
  narrative: z.string().min(20, 'Narrative must be at least 20 characters'),
  objectives: z.array(z.string().min(5, 'Objective must be at least 5 characters')),
  challenges: z.array(z.string().min(5, 'Challenge must be at least 5 characters')),
  imagePrompt: z.string().optional()
});

type MapEditFormData = z.infer<typeof mapEditSchema>;

interface MapBuilderProps {
  originalMap: NegotiationMap;
  onSave: (updatedMap: NegotiationMap) => Promise<void>;
  isLoading?: boolean;
}

const CATEGORY_COLORS = {
  Chaotic: 'bg-red-500',
  Adversarial: 'bg-orange-500',
  Cooperative: 'bg-green-500',
  Stable: 'bg-blue-500'
};

const DIMENSION_OPTIONS: DimensionRating[] = ['Low', 'Medium', 'High'];

const IMAGE_PROMPT_TEMPLATES = {
  Cooperative: "A modern conference room with warm lighting, two professionals in business attire sitting across from a polished table, documents and charts visible, handshake gesture, collaborative atmosphere, professional photography style",
  Adversarial: "A formal boardroom with dramatic lighting, two people in business suits facing each other across a large table, tense body language, serious expressions, documents scattered, high-contrast professional photography",
  Chaotic: "A busy office environment with multiple people, papers flying, dynamic movement, urgent gestures, cluttered desk with multiple devices, fast-paced atmosphere, documentary photography style",
  Stable: "A traditional executive office with formal furniture, two professionals in conservative attire, structured meeting setup, organized documents, calm lighting, classic professional photography"
};

export function MapBuilder({ originalMap, onSave, isLoading = false }: MapBuilderProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showComparison, setShowComparison] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const form = useForm<MapEditFormData>({
    resolver: zodResolver(mapEditSchema),
    defaultValues: {
      mapName: originalMap.mapName,
      mapCategory: originalMap.mapCategory as any,
      dimensions: originalMap.dimensions,
      narrative: originalMap.narrative,
      objectives: originalMap.objectives,
      challenges: originalMap.challenges.map(c => typeof c === 'string' ? c : c.description),
      imagePrompt: originalMap.imagePrompt || ''
    },
    mode: 'onChange'
  });

  const { register, handleSubmit, watch, setValue, getValues, formState: { errors, isDirty } } = form;
  const watchedValues = watch();

  // Track unsaved changes
  useEffect(() => {
    setUnsavedChanges(isDirty);
  }, [isDirty]);

  // Auto-generate image prompt when category changes
  useEffect(() => {
    const category = watchedValues.mapCategory;
    if (category && !watchedValues.imagePrompt) {
      setValue('imagePrompt', IMAGE_PROMPT_TEMPLATES[category]);
    }
  }, [watchedValues.mapCategory, setValue, watchedValues.imagePrompt]);

  const onFormSubmit = async (data: MapEditFormData) => {
    const updatedMap: NegotiationMap = {
      ...originalMap,
      ...data,
      id: originalMap.id
    };
    
    await onSave(updatedMap);
    setUnsavedChanges(false);
  };

  const resetForm = () => {
    form.reset({
      mapName: originalMap.mapName,
      mapCategory: originalMap.mapCategory as any,
      dimensions: originalMap.dimensions,
      narrative: originalMap.narrative,
      objectives: originalMap.objectives,
      challenges: originalMap.challenges.map(c => typeof c === 'string' ? c : c.description),
      imagePrompt: originalMap.imagePrompt || ''
    });
    setUnsavedChanges(false);
  };

  const addObjective = () => {
    const currentObjectives = getValues('objectives');
    setValue('objectives', [...currentObjectives, ''], { shouldDirty: true });
  };

  const removeObjective = (index: number) => {
    const currentObjectives = getValues('objectives');
    setValue('objectives', currentObjectives.filter((_, i) => i !== index), { shouldDirty: true });
  };

  const addChallenge = () => {
    const currentChallenges = getValues('challenges');
    setValue('challenges', [...currentChallenges, ''], { shouldDirty: true });
  };

  const removeChallenge = (index: number) => {
    const currentChallenges = getValues('challenges');
    setValue('challenges', currentChallenges.filter((_, i) => i !== index), { shouldDirty: true });
  };

  const copyImagePrompt = () => {
    navigator.clipboard.writeText(watchedValues.imagePrompt || '');
    toast.success('Image prompt copied to clipboard!');
  };

  const generateImagePrompt = () => {
    const category = watchedValues.mapCategory;
    if (category) {
      setValue('imagePrompt', IMAGE_PROMPT_TEMPLATES[category], { shouldDirty: true });
      toast.success('Image prompt generated based on category!');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Edit Negotiation Map</h1>
          <p className="text-gray-600">Fine-tune your generated negotiation map</p>
        </div>
        <div className="flex items-center space-x-2">
          {unsavedChanges && (
            <div className="flex items-center text-orange-600 text-sm">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
              Unsaved changes
            </div>
          )}
          <Button
            variant="outline"
            onClick={() => setShowComparison(!showComparison)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {showComparison ? 'Hide' : 'Show'} Original
          </Button>
        </div>
      </div>

      <div className={`grid ${showComparison ? 'grid-cols-2' : 'grid-cols-1'} gap-6`}>
        {/* Original Map Display */}
        {showComparison && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Original Map
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="font-medium">Name</Label>
                <p className="text-sm text-gray-700">{originalMap.mapName}</p>
              </div>
              
              <div>
                <Label className="font-medium">Category</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <div className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[originalMap.mapCategory as keyof typeof CATEGORY_COLORS]}`} />
                  <span className="text-sm">{originalMap.mapCategory}</span>
                </div>
              </div>

              <div>
                <Label className="font-medium">Narrative</Label>
                <p className="text-sm text-gray-700 mt-1">{originalMap.narrative}</p>
              </div>

              <div>
                <Label className="font-medium">Objectives</Label>
                <ul className="text-sm text-gray-700 mt-1 space-y-1">
                  {originalMap.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start">
                      <span className="mr-2">•</span>
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Editable Map Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Edit Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onFormSubmit)}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
                  <TabsTrigger value="narrative">Narrative</TabsTrigger>
                  <TabsTrigger value="objectives">Objectives</TabsTrigger>
                  <TabsTrigger value="challenges">Challenges</TabsTrigger>
                  <TabsTrigger value="image">Image</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="mapName">Map Name</Label>
                    <Input
                      id="mapName"
                      {...register('mapName')}
                      className={errors.mapName ? 'border-red-500' : ''}
                    />
                    {errors.mapName && (
                      <p className="text-sm text-red-600">{errors.mapName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mapCategory">Category</Label>
                    <Select
                      value={watchedValues.mapCategory}
                      onValueChange={(value) => setValue('mapCategory', value as any, { shouldDirty: true })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(CATEGORY_COLORS).map((category) => (
                          <SelectItem key={category} value={category}>
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]}`} />
                              <span>{category}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="dimensions" className="space-y-6">
                  {(['variability', 'opposition', 'cooperation'] as const).map((dimension) => (
                    <div key={dimension} className="space-y-3">
                      <Label className="text-base font-medium capitalize">{dimension}</Label>
                      
                      <div className="space-y-2">
                        <Label>Rating</Label>
                        <Select
                          value={watchedValues.dimensions?.[dimension]?.rating}
                          onValueChange={(value) => 
                            setValue(`dimensions.${dimension}.rating`, value as DimensionRating, { shouldDirty: true })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DIMENSION_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          {...register(`dimensions.${dimension}.description`)}
                          rows={3}
                          className={errors.dimensions?.[dimension]?.description ? 'border-red-500' : ''}
                        />
                        {errors.dimensions?.[dimension]?.description && (
                          <p className="text-sm text-red-600">
                            {errors.dimensions[dimension]?.description?.message}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="narrative" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="narrative">Scenario Narrative</Label>
                    <Textarea
                      id="narrative"
                      {...register('narrative')}
                      rows={8}
                      className={errors.narrative ? 'border-red-500' : ''}
                      placeholder="Describe the negotiation scenario in detail..."
                    />
                    {errors.narrative && (
                      <p className="text-sm text-red-600">{errors.narrative.message}</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="objectives" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Objectives</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addObjective}>
                      <Target className="w-4 h-4 mr-2" />
                      Add Objective
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {watchedValues.objectives?.map((_, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="flex-1 space-y-1">
                          <Input
                            {...register(`objectives.${index}`)}
                            placeholder={`Objective ${index + 1}`}
                          />
                          {errors.objectives?.[index] && (
                            <p className="text-sm text-red-600">
                              {errors.objectives[index]?.message}
                            </p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeObjective(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="challenges" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Challenges</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addChallenge}>
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Add Challenge
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {watchedValues.challenges?.map((_, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="flex-1 space-y-1">
                          <Textarea
                            {...register(`challenges.${index}`)}
                            rows={2}
                            placeholder={`Challenge ${index + 1}`}
                          />
                          {errors.challenges?.[index] && (
                            <p className="text-sm text-red-600">
                              {errors.challenges[index]?.message}
                            </p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeChallenge(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="image" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Image Generation Prompt</Label>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateImagePrompt}
                      >
                        <Wand2 className="w-4 h-4 mr-2" />
                        Auto-Generate
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={copyImagePrompt}
                        disabled={!watchedValues.imagePrompt}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                  </div>
                  
                  <Textarea
                    {...register('imagePrompt')}
                    rows={6}
                    placeholder="A detailed prompt for AI image generation that captures the essence of this negotiation scenario..."
                  />
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Image Prompt Tips</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Include setting details (conference room, office, etc.)</li>
                      <li>• Describe the stakeholders and their body language</li>
                      <li>• Specify mood and atmosphere</li>
                      <li>• Add visual elements (documents, charts, handshakes)</li>
                      <li>• Include photography/art style preferences</li>
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={!unsavedChanges}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset to Original
                </Button>

                <Button
                  type="submit"
                  disabled={!unsavedChanges || isLoading}
                  className="min-w-[120px]"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}