import { z } from 'zod';

// Original schemas for API compatibility
export const createMapSchema = z.object({
  prompt: z
    .string()
    .min(10, 'Please provide at least 10 characters describing your scenario')
    .max(2000, 'Please keep your description under 2000 characters'),
  userId: z.string().optional(),
});

export const dimensionSchema = z.object({
  rating: z.enum(['Low', 'Medium', 'High']),
  description: z.string().min(1, 'Description is required'),
});

export const mapMechanicsSchema = z.object({
  branches: z.array(z.string()),
  events: z.array(z.string()),
});

export const negotiationMapSchema = z.object({
  mapName: z.string().min(1, 'Map name is required'),
  mapCategory: z.string().min(1, 'Map category is required'),
  dimensions: z.object({
    variability: dimensionSchema,
    opposition: dimensionSchema,
    cooperation: dimensionSchema,
  }),
  narrative: z.string().min(1, 'Narrative is required'),
  objectives: z.array(z.string()),
  mechanics: mapMechanicsSchema,
  challenges: z.array(z.string()),
});

// New comprehensive ScenarioBuilder schema
export const scenarioBuilderSchema = z.object({
  // Step 1: Basic Information
  basicInfo: z.object({
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title must be less than 100 characters'),
    description: z
      .string()
      .min(50, 'Please provide at least 50 characters describing your scenario')
      .max(1000, 'Description must be less than 1000 characters'),
    category: z.enum(['business', 'personal', 'legal', 'diplomatic', 'other']),
    urgency: z.enum(['low', 'medium', 'high']),
  }),

  // Step 2: Stakeholders
  stakeholders: z.object({
    primaryParties: z
      .array(
        z.object({
          name: z.string().min(1, 'Party name is required'),
          role: z.string().min(1, 'Role is required'),
          interests: z.string().min(10, 'Interests must be at least 10 characters'),
          power: z.enum(['low', 'medium', 'high']),
          relationship: z.enum(['ally', 'neutral', 'opponent', 'unknown']),
        })
      )
      .min(2, 'At least 2 parties are required')
      .max(10, 'Maximum 10 parties allowed'),
    influencers: z
      .array(
        z.object({
          name: z.string().min(1, 'Name is required'),
          influence: z.string().min(5, 'Influence description required'),
          impact: z.enum(['low', 'medium', 'high']),
        })
      )
      .optional(),
  }),

  // Step 3: Objectives
  objectives: z.object({
    primaryGoals: z
      .array(z.string().min(5, 'Goal must be at least 5 characters'))
      .min(1, 'At least one primary goal is required')
      .max(5, 'Maximum 5 primary goals allowed'),
    secondaryGoals: z
      .array(z.string().min(5, 'Goal must be at least 5 characters'))
      .max(5, 'Maximum 5 secondary goals allowed')
      .optional(),
    minimumAcceptable: z
      .string()
      .min(10, 'Please describe your minimum acceptable outcome')
      .max(500, 'Description too long'),
    idealOutcome: z
      .string()
      .min(10, 'Please describe your ideal outcome')
      .max(500, 'Description too long'),
    alternatives: z
      .string()
      .min(10, 'Please describe your alternatives (BATNA)')
      .max(500, 'Description too long'),
  }),

  // Step 4: Constraints and Challenges
  constraints: z.object({
    timeConstraints: z.object({
      hasDeadline: z.boolean(),
      deadline: z.string().optional(),
      timeframe: z.enum(['urgent', 'weeks', 'months', 'flexible']).optional(),
    }),
    budgetConstraints: z.object({
      hasBudget: z.boolean(),
      budgetRange: z.enum(['low', 'medium', 'high', 'unlimited']).optional(),
      budgetDetails: z.string().max(200).optional(),
    }),
    legalConstraints: z
      .array(z.string().min(5, 'Constraint must be at least 5 characters'))
      .max(5, 'Maximum 5 legal constraints')
      .optional(),
    politicalConstraints: z
      .array(z.string().min(5, 'Constraint must be at least 5 characters'))
      .max(5, 'Maximum 5 political constraints')
      .optional(),
    otherConstraints: z
      .string()
      .max(500, 'Description too long')
      .optional(),
  }),

  // Step 5: Timeline and Context
  timeline: z.object({
    background: z
      .string()
      .min(20, 'Please provide background context')
      .max(800, 'Background too long'),
    previousNegotiations: z
      .string()
      .max(500, 'Description too long')
      .optional(),
    currentSituation: z
      .string()
      .min(20, 'Please describe the current situation')
      .max(500, 'Description too long'),
    upcomingEvents: z
      .array(
        z.object({
          event: z.string().min(3, 'Event description required'),
          date: z.string().optional(),
          impact: z.enum(['low', 'medium', 'high']),
        })
      )
      .max(5, 'Maximum 5 upcoming events')
      .optional(),
  }),

  // Step 6: Additional Information
  additional: z.object({
    preparationLevel: z.enum(['minimal', 'some', 'extensive']),
    experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']),
    specificConcerns: z
      .array(z.string().min(5, 'Concern must be at least 5 characters'))
      .max(5, 'Maximum 5 concerns')
      .optional(),
    additionalNotes: z
      .string()
      .max(500, 'Notes too long')
      .optional(),
  }),
});

// Type exports
export type CreateMapFormData = z.infer<typeof createMapSchema>;
export type NegotiationMapFormData = z.infer<typeof negotiationMapSchema>;
export type ScenarioBuilderFormData = z.infer<typeof scenarioBuilderSchema>;

// Step-specific schemas for individual validation
export const basicInfoSchema = scenarioBuilderSchema.shape.basicInfo;
export const stakeholdersSchema = scenarioBuilderSchema.shape.stakeholders;
export const objectivesSchema = scenarioBuilderSchema.shape.objectives;
export const constraintsSchema = scenarioBuilderSchema.shape.constraints;
export const timelineSchema = scenarioBuilderSchema.shape.timeline;
export const additionalSchema = scenarioBuilderSchema.shape.additional;

export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;
export type StakeholdersFormData = z.infer<typeof stakeholdersSchema>;
export type ObjectivesFormData = z.infer<typeof objectivesSchema>;
export type ConstraintsFormData = z.infer<typeof constraintsSchema>;
export type TimelineFormData = z.infer<typeof timelineSchema>;
export type AdditionalFormData = z.infer<typeof additionalSchema>;