'use client';
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from './Card';

interface StatsWidgetProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: number;
    trend: 'up' | 'down' | 'neutral';
    period: string;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  onClick?: () => void;
}

const StatsWidget: React.FC<StatsWidgetProps> = ({
  title,
  value,
  icon: Icon,
  change,
  color = 'blue',
  onClick
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      trend: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      trend: 'text-green-600'
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-600',
      trend: 'text-purple-600'
    },
    orange: {
      bg: 'bg-orange-100',
      text: 'text-orange-600',
      trend: 'text-orange-600'
    },
    red: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      trend: 'text-red-600'
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      default:
        return '→';
    }
  };

  return (
    <Card 
      className={`transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:scale-105' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${colorClasses[color].bg}`}>
            <Icon className={`h-6 w-6 ${colorClasses[color].text}`} />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-baseline">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {change && (
                <div className={`ml-2 flex items-center text-sm ${
                  change.trend === 'up' ? 'text-green-600' : 
                  change.trend === 'down' ? 'text-red-600' : 
                  'text-gray-500'
                }`}>
                  <span className="mr-1">{getTrendIcon(change.trend)}</span>
                  <span>{Math.abs(change.value)}% {change.period}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsWidget;