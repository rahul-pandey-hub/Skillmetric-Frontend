import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down';
  };
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  description?: string;
  loading?: boolean;
}

export function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = 'text-primary-600',
  iconBgColor = 'bg-primary-100',
  description,
  loading = false,
}: StatsCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-8 bg-gray-200 rounded w-2/3" />
            <div className="h-3 bg-gray-200 rounded w-1/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-foreground">{value}</h3>
                {change && (
                  <span
                    className={cn(
                      'text-sm font-medium',
                      change.trend === 'up' ? 'text-success-600' : 'text-red-600'
                    )}
                  >
                    {change.trend === 'up' ? '↑' : '↓'} {Math.abs(change.value)}%
                  </span>
                )}
              </div>
              {description && (
                <p className="mt-2 text-xs text-muted-foreground">{description}</p>
              )}
            </div>
            <div className={cn('rounded-lg p-3', iconBgColor)}>
              <Icon className={cn('h-6 w-6', iconColor)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
