import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export default function TopicsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Topics</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Topics functionality will be implemented in a future update.
            This will allow you to organize and categorize your negotiation scenarios.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}