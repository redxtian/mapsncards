'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Map, 
  MessageSquare, 
  User, 
  Settings,
  PlusCircle,
  CreditCard
} from 'lucide-react';

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Maps',
    href: '/maps',
    icon: Map,
  },
  {
    title: 'Cards',
    href: '/cards',
    icon: CreditCard,
  },
  {
    title: 'Topics',
    href: '/topics',
    icon: MessageSquare,
  },
  {
    title: 'Profile',
    href: '/profile',
    icon: User,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn('pb-12 w-64', className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <Link 
              href="/maps/create"
              className="flex items-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Map
            </Link>
          </div>
        </div>
        
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Navigation
          </h2>
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100',
                  pathname === item.href
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-700'
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}