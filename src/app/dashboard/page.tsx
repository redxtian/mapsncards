import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Map, Eye, Edit } from 'lucide-react';

export default function DashboardPage() {
  // This will be replaced with real data from API
  const recentMaps = [
    {
      id: '1',
      name: 'Salary Negotiation with New Manager',
      category: 'Cooperative',
      createdAt: '2024-01-15',
    },
    {
      id: '2',  
      name: 'Contract Terms Discussion',
      category: 'Competitive',
      createdAt: '2024-01-14',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage your negotiation maps and track your progress
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/maps/create">
              <PlusCircle className="w-4 h-4 mr-2" />
              New Map
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Maps</CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              +1 from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <PlusCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              All maps created this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Cooperative, Competitive
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Maps */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Maps</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/maps">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentMaps.length === 0 ? (
            <div className="text-center py-8">
              <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No maps yet
              </h3>
              <p className="text-gray-600 mb-4">
                Get started by creating your first negotiation map.
              </p>
              <Button asChild>
                <Link href="/maps/create">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create Map
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentMaps.map((map) => (
                <div
                  key={map.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Map className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{map.name}</h4>
                      <p className="text-sm text-gray-500">
                        {map.category} • {new Date(map.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/maps/view/${map.id}`}>
                        <Eye className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/maps/edit/${map.id}`}>
                        <Edit className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}