'use client';
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface QuickActionProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

interface QuickActionsProps {
  actions: QuickActionProps[];
  title?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({ 
  actions, 
  title = "Quick Actions" 
}) => {
  const getColorClasses = (color: QuickActionProps['color'] = 'primary') => {
    const classes = {
      primary: 'hover:bg-primary-50 hover:text-primary-700 text-primary-600',
      secondary: 'hover:bg-gray-50 hover:text-gray-700 text-gray-600',
      success: 'hover:bg-green-50 hover:text-green-700 text-green-600',
      warning: 'hover:bg-yellow-50 hover:text-yellow-700 text-yellow-600',
      danger: 'hover:bg-red-50 hover:text-red-700 text-red-600',
    };
    return classes[color];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.onClick}
              className={`p-4 rounded-lg border border-gray-200 text-left transition-all duration-200 hover:shadow-md hover:scale-105 ${getColorClasses(action.color)}`}
            >
              <div className="flex items-start space-x-3">
                <Icon className="w-6 h-6 mt-1" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{action.title}</p>
                  <p className="text-sm opacity-75 mt-1">{action.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;