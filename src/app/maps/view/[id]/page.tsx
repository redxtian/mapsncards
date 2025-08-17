import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit } from 'lucide-react';

export default async function ViewMapPage({ params }: { params: Promise<{ id: string }> }) {
  // TODO: Fetch map data using useMap hook
  const { id: mapId } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/maps">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Maps
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Map View
            </h1>
            <p className="text-gray-600 mt-1">
              Map ID: {mapId}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/maps/edit/${mapId}`}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Map
          </Link>
        </Button>
      </div>

      {/* Map Content */}
      <Card>
        <CardHeader>
          <CardTitle>Map Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Map viewing functionality will be implemented here.
            This will display the negotiation map with all dimensions,
            objectives, mechanics, and challenges.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}