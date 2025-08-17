import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
  variant?: 'error' | 'warning';
}

export function ErrorMessage({ 
  title = 'Error',
  message, 
  onDismiss, 
  className,
  variant = 'error'
}: ErrorMessageProps) {
  const variantClasses = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  };

  return (
    <div className={cn(
      'border rounded-lg p-4 flex items-start space-x-3',
      variantClasses[variant],
      className
    )}>
      <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm mt-1">{message}</p>
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="p-1 h-auto hover:bg-transparent"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}