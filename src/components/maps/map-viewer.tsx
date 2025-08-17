'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Share2, 
  Copy,
  MapPin,
  Target,
  AlertTriangle,
  Users,
  Clock,
  TrendingUp
} from 'lucide-react';
import { NegotiationMap } from '@/types/map';

interface MapViewerProps {
  map: NegotiationMap;
  onExport?: () => void;
  onShare?: () => void;
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Chaotic':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'Adversarial':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Cooperative':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Stable':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getDimensionColor = (rating: string) => {
  switch (rating) {
    case 'High':
      return 'bg-red-500';
    case 'Medium':
      return 'bg-yellow-500';
    case 'Low':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

export function MapViewer({ map, onExport, onShare }: MapViewerProps) {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(map, null, 2));
      // You might want to show a toast notification here
    } catch (err) {
      console.error('Failed to copy map data:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{map.mapName}</h1>
          <div className="flex items-center space-x-3">
            <Badge className={getCategoryColor(map.mapCategory)}>
              {map.mapCategory}
            </Badge>
            <span className="text-gray-500 text-sm">
              Generated on {new Date(map.metadata?.generation_timestamp || Date.now()).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          {onShare && (
            <Button variant="outline" size="sm" onClick={onShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          )}
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Dimensions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Map Dimensions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(map.dimensions).map(([key, dimension]) => (
              <div key={key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium capitalize">{key}</h3>
                  <Badge variant="outline" className={`${getDimensionColor(dimension.rating)} text-white border-0`}>
                    {dimension.rating}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{dimension.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Narrative */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Scenario Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{map.narrative}</p>
        </CardContent>
      </Card>

      {/* Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Strategic Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {map.objectives.map((objective, index) => (
              <li key={index} className="flex items-start">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                  {index + 1}
                </div>
                <span className="text-gray-700">{objective}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Mechanics */}
      {(map.mechanics?.branches?.length > 0 || map.mechanics?.events?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Branches */}
          {map.mechanics.branches && map.mechanics.branches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Strategic Branches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {map.mechanics.branches.map((branch, index) => (
                    <li key={index} className="text-sm text-gray-700 p-3 bg-blue-50 rounded-lg">
                      {branch}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Events */}
          {map.mechanics.events && map.mechanics.events.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Potential Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {map.mechanics.events.map((event, index) => (
                    <li key={index} className="text-sm text-gray-700 p-3 bg-yellow-50 rounded-lg">
                      {event}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Challenges */}
      {map.challenges && map.challenges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Potential Challenges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {map.challenges.map((challenge, index) => (
                <li key={index} className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="text-gray-700">
                    {typeof challenge === 'string' ? (
                      <span>{challenge}</span>
                    ) : (
                      <div className="space-y-2">
                        <p className="font-medium">{challenge.description}</p>
                        {challenge.mitigationStrategy && (
                          <p className="text-sm text-gray-600 bg-green-50 p-2 rounded">
                            <strong>Mitigation:</strong> {challenge.mitigationStrategy}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      {map.metadata && (
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg">Generation Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {map.metadata.engine && (
                <div>
                  <span className="font-medium">Engine:</span>
                  <div className="text-gray-600 capitalize">{map.metadata.engine}</div>
                </div>
              )}
              {map.metadata.execution_time && (
                <div>
                  <span className="font-medium">Generation Time:</span>
                  <div className="text-gray-600">{map.metadata.execution_time}s</div>
                </div>
              )}
              {map.metadata.generation_timestamp && (
                <div>
                  <span className="font-medium">Created:</span>
                  <div className="text-gray-600">
                    {new Date(map.metadata.generation_timestamp).toLocaleString()}
                  </div>
                </div>
              )}
              <div>
                <span className="font-medium">Map ID:</span>
                <div className="text-gray-600 font-mono text-xs">{map.id}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}