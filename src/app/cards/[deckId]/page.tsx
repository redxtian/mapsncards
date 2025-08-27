import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction, ArrowLeft } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function CardDeckDetailPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Construction className="w-8 h-8 text-gray-500" />
            </div>
            <CardTitle className="text-xl">Feature Temporarily Disabled</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              Card viewing features are currently disabled. Please focus on creating and managing negotiation maps.
            </p>
            <Button asChild>
              <Link href="/maps">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go to Maps
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      </div>
    </ProtectedRoute>
  );
}