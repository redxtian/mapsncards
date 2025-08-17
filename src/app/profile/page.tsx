import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            User Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Profile management functionality will be implemented here.
            This will allow users to manage their account settings and preferences.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}