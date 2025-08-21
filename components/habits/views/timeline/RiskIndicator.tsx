'use client';

import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface RiskIndicatorProps {
  habitName: string;
  riskLevel: 'low' | 'medium' | 'high';
  nextRiskDate?: string;
  recommendations: string[];
  color: string;
}

export function RiskIndicator({
  habitName,
  riskLevel,
  nextRiskDate,
  recommendations,
  color
}: RiskIndicatorProps) {
  const getRiskIcon = () => {
    switch (riskLevel) {
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      case 'medium':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getRiskColor = () => {
    switch (riskLevel) {
      case 'high':
        return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200';
      case 'medium':
        return 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200';
      default:
        return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200';
    }
  };

  const getIconColor = () => {
    switch (riskLevel) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-amber-600 dark:text-amber-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getRiskColor()}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <div className={getRiskIcon().props.className.replace('w-4 h-4', `w-5 h-5 ${getIconColor()}`)}>
            {getRiskIcon()}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <h4 className="font-medium text-gray-900 dark:text-white">
              {habitName}
            </h4>
            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
              riskLevel === 'high' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
              riskLevel === 'medium' ? 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200' :
              'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
            }`}>
              {riskLevel} risk
            </span>
          </div>
          
          {nextRiskDate && (
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              <span className="font-medium">Risk spike predicted:</span> {nextRiskDate}
            </div>
          )}
          
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Recommendations:
            </div>
            <ul className="space-y-1">
              {recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="w-1 h-1 rounded-full bg-current mt-2 flex-shrink-0"></div>
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}