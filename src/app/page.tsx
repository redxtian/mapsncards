import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map, PlusCircle, Eye, Layers } from 'lucide-react';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Map className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Maps & Cards
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Create strategic negotiation maps to understand leverage, identify opportunities, 
          and achieve better outcomes in your negotiations.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/maps/create">
              <PlusCircle className="w-5 h-5 mr-2" />
              Create Your First Map
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/dashboard">
              <Eye className="w-5 h-5 mr-2" />
              View Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Map className="w-5 h-5 mr-2 text-blue-600" />
              Strategic Mapping
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Visualize negotiation dynamics with our comprehensive mapping system 
              that analyzes variability, opposition, and cooperation.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Layers className="w-5 h-5 mr-2 text-blue-600" />
              Leverage Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Identify and maximize your relational, resource, and structural 
              leverage points for more effective negotiations.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PlusCircle className="w-5 h-5 mr-2 text-blue-600" />
              Scenario Planning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Prepare for different negotiation paths with branching scenarios 
              and event-driven decision trees.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to improve your negotiation outcomes?
        </h2>
        <p className="text-gray-600 mb-6">
          Start by creating your first negotiation map and discover the power of strategic preparation.
        </p>
        <Button asChild size="lg">
          <Link href="/maps/create">
            Get Started Now
          </Link>
        </Button>
      </div>
    </div>
  );
}
