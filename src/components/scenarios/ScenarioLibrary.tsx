'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Star, Clock, Users, Target } from 'lucide-react';

// Gold standard scenarios data
const GOLD_STANDARD_SCENARIOS = {
  metadata: {
    version: "1.0",
    created_at: "2025-01-07",
    total_scenarios: 100,
    categories: [
      "Workplace", "Business", "Sales", "Personal", 
      "Relationships", "Purchasing", "Conflict Resolution"
    ]
  },
  scenarios: [
    {
      title: "Asking for a Salary Increase",
      description: "Requesting higher pay from your boss after a strong performance period.",
      category: "Workplace",
      template_data: {
        stakeholders_template: "You and your direct manager, potentially HR representative if company policy requires",
        objectives_template: "Secure a salary increase that reflects your contributions, performance, and current market value for your role",
        constraints_template: "Company budget cycles, existing salary bands, performance review timing, departmental budget constraints",
        timeline_template: "During performance review period, annual salary review cycle, or after completing major project/milestone",
        context_template: "You have documented strong performance over the past year with specific achievements, positive feedback, and increased responsibilities"
      },
      metadata: {
        complexity: "intermediate",
        time_investment: 25,
        industry: ["General", "Technology", "Finance", "Healthcare"],
        stakeholder_types: ["Manager-Employee"],
        power_dynamics: "Hierarchical",
        relationship_type: "Professional",
        common_outcomes: ["Salary increase approved", "Performance improvement plan", "Promotion discussion", "Deferred to next review cycle"]
      },
      tags: ["salary", "manager", "performance", "compensation", "career", "raise"],
      keywords: ["raise", "increase", "pay", "boss", "review", "performance", "money", "promotion"],
      is_featured: true
    },
    {
      title: "Negotiating a Job Offer",
      description: "Discussing terms like salary and benefits with a potential employer.",
      category: "Workplace",
      template_data: {
        stakeholders_template: "You, hiring manager, HR representative, potentially future team lead",
        objectives_template: "Secure optimal compensation package including salary, benefits, equity, and working conditions",
        constraints_template: "Company salary bands, budget constraints, equity pool limitations, benefit plan structure",
        timeline_template: "After receiving initial offer, typically within 1-2 weeks of offer presentation",
        context_template: "You have received a job offer and want to negotiate terms before accepting the position"
      },
      metadata: {
        complexity: "advanced",
        time_investment: 35,
        industry: ["General", "Technology", "Finance", "Healthcare", "Legal"],
        stakeholder_types: ["Employer-Candidate"],
        power_dynamics: "Negotiating",
        relationship_type: "Professional",
        common_outcomes: ["Improved offer", "Original terms accepted", "Additional benefits", "Start date adjustment"]
      },
      tags: ["job", "offer", "salary", "benefits", "negotiation", "hiring"],
      keywords: ["offer", "salary", "benefits", "equity", "compensation", "hiring", "job"],
      is_featured: true
    },
    {
      title: "Negotiating Remote Work Arrangements",
      description: "Proposing to work from home permanently with your company.",
      category: "Workplace",
      template_data: {
        stakeholders_template: "You, your manager, HR, potentially team members affected by the arrangement",
        objectives_template: "Establish permanent or hybrid remote work arrangement that maintains productivity and team collaboration",
        constraints_template: "Company policy, team collaboration needs, client requirements, industry regulations, workspace setup",
        timeline_template: "During policy reviews, after demonstrating remote work success, or when relocating",
        context_template: "You have proven ability to work effectively remotely and have compelling reasons for permanent remote work"
      },
      metadata: {
        complexity: "intermediate",
        time_investment: 25,
        industry: ["Technology", "Marketing", "Finance", "Consulting"],
        stakeholder_types: ["Manager-Employee"],
        power_dynamics: "Hierarchical",
        relationship_type: "Professional",
        common_outcomes: ["Full remote approved", "Hybrid arrangement", "Trial period", "Policy change needed"]
      },
      tags: ["remote", "work", "home", "arrangement", "policy", "flexibility"],
      keywords: ["remote", "work", "home", "virtual", "distance", "location", "flexibility"],
      is_featured: true
    }
  ]
};

interface ScenarioLibraryProps {
  onScenarioSelect: (scenario: any) => void;
}

const COMPLEXITY_COLORS = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800'
};

export function ScenarioLibrary({ onScenarioSelect }: ScenarioLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedComplexity, setSelectedComplexity] = useState('all');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  const filteredScenarios = useMemo(() => {
    return GOLD_STANDARD_SCENARIOS.scenarios.filter(scenario => {
      const matchesSearch = searchTerm === '' || 
        scenario.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scenario.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scenario.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || scenario.category === selectedCategory;
      const matchesComplexity = selectedComplexity === 'all' || scenario.metadata.complexity === selectedComplexity;
      const matchesFeatured = !showFeaturedOnly || scenario.is_featured;

      return matchesSearch && matchesCategory && matchesComplexity && matchesFeatured;
    });
  }, [searchTerm, selectedCategory, selectedComplexity, showFeaturedOnly]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Scenario Library</h2>
        <p className="text-gray-600 mt-1">
          Choose from {GOLD_STANDARD_SCENARIOS.metadata.total_scenarios} gold standard negotiation scenarios
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search scenarios..."
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {GOLD_STANDARD_SCENARIOS.metadata.categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Complexity</label>
              <select
                value={selectedComplexity}
                onChange={(e) => setSelectedComplexity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Filter</label>
              <Button
                variant={showFeaturedOnly ? "default" : "outline"}
                onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
                className="w-full"
              >
                <Star className="h-4 w-4 mr-2" />
                Featured Only
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredScenarios.length} of {GOLD_STANDARD_SCENARIOS.scenarios.length} scenarios
      </div>

      {/* Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredScenarios.map((scenario, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold line-clamp-2 mb-2">
                    {scenario.title}
                    {scenario.is_featured && <Star className="inline ml-2 h-4 w-4 text-yellow-500" />}
                  </CardTitle>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {scenario.description}
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">{scenario.category}</Badge>
                <Badge className={COMPLEXITY_COLORS[scenario.metadata.complexity as keyof typeof COMPLEXITY_COLORS]}>
                  {scenario.metadata.complexity}
                </Badge>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {scenario.metadata.time_investment}min
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Users className="h-3 w-3" />
                <span>{scenario.metadata.stakeholder_types.join(', ')}</span>
              </div>

              <div className="flex flex-wrap gap-1">
                {scenario.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {scenario.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{scenario.tags.length - 3}
                  </Badge>
                )}
              </div>

              <Button 
                onClick={() => onScenarioSelect(scenario)}
                className="w-full mt-4"
              >
                <Target className="h-4 w-4 mr-2" />
                Generate Strategy Cards
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredScenarios.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Filter className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No scenarios found</h3>
          <p>Try adjusting your filters or search terms.</p>
        </div>
      )}
    </div>
  );
}

export default ScenarioLibrary;