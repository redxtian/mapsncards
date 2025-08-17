import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Application Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Settings functionality will be implemented here.
            This will allow users to configure application preferences,
            notifications, and other settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}