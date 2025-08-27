import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Eye, Upload, BarChart3, LogIn } from 'lucide-react';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Negotiation Cards
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Master your negotiations with strategic leverage cards. Build, organize, and deploy 
          powerful negotiation tactics with our comprehensive card management system.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button asChild size="lg">
            <Link href="/login">
              <LogIn className="w-5 h-5 mr-2" />
              Get Started
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/login">
              <Eye className="w-5 h-5 mr-2" />
              Sign In
            </Link>
          </Button>
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-green-600" />
              Strategic Cards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Create and manage negotiation cards with leverage types, deployment modes, 
              and recovery strategies for any negotiation scenario.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
              Analytics Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Track your leverage distribution, analyze card effectiveness, 
              and optimize your negotiation strategy with detailed insights.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="bg-green-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to master your negotiations?
        </h2>
        <p className="text-gray-600 mb-6">
          Start by adding your first negotiation cards and build your strategic toolkit.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button asChild size="lg">
            <Link href="/login">
              Get Started Now
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/login">
              <CreditCard className="w-4 h-4 mr-2" />
              Sign In
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
