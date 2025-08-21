'use client';

import React, { useState } from 'react';
import { useUserAnalytics } from '@/hooks/useUsageAnalytics';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export default function MyUsage() {
  const { 
    userStats, 
    usageRecords, 
    efficiencyMetrics, 
    loading: analyticsLoading, 
    error: analyticsError 
  } = useUserAnalytics();
  
  const { 
    usageSummary, 
    usagePercentage, 
    usageStatus, 
    loading: trackingLoading 
  } = useUsageTracking();

  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'efficiency' | 'tips'>('overview');

  const loading = analyticsLoading || trackingLoading;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (analyticsError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
        <div className="text-red-800 dark:text-red-200">
          <h3 className="text-lg font-semibold mb-2">Error Loading Usage Data</h3>
          <p>{analyticsError}</p>
        </div>
      </div>
    );
  }

  if (!usageSummary && !userStats) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <div className="text-blue-800 dark:text-blue-200">
          <h3 className="text-lg font-semibold mb-2">No Usage Data Yet</h3>
          <p>Start using AI features to see your usage analytics here!</p>
        </div>
      </div>
    );
  }

  const renderOverview = () => {
    if (!usageSummary) return null;

    const { dailyUsage, weeklyUsage, monthlyUsage } = usageSummary;

    const usageData = [
      { name: 'Today', requests: dailyUsage.requests, cost: dailyUsage.cost },
      { name: 'This Week', requests: weeklyUsage.requests, cost: weeklyUsage.cost },
      { name: 'This Month', requests: monthlyUsage.requests, cost: monthlyUsage.cost }
    ];

    return (
      <div className="space-y-6">
        {/* Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Today's Usage</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {dailyUsage.requests}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  of {dailyUsage.limit} requests
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                usageStatus.status === 'good' ? 'bg-green-100 text-green-600' :
                usageStatus.status === 'moderate' ? 'bg-yellow-100 text-yellow-600' :
                usageStatus.status === 'warning' ? 'bg-orange-100 text-orange-600' :
                'bg-red-100 text-red-600'
              }`}>
                {Math.round(usagePercentage)}%
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    usageStatus.status === 'good' ? 'bg-green-500' :
                    usageStatus.status === 'moderate' ? 'bg-yellow-500' :
                    usageStatus.status === 'warning' ? 'bg-orange-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Today's Cost</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                ${dailyUsage.cost.toFixed(4)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                ~${(dailyUsage.cost / (dailyUsage.requests || 1)).toFixed(4)} per request
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Remaining</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {dailyUsage.remaining}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                requests until {new Date(dailyUsage.resetTime).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* Usage Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Usage Overview
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgb(31 41 55)', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: 'white'
                  }} 
                />
                <Bar dataKey="requests" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const renderHistory = () => {
    if (!usageRecords || usageRecords.length === 0) {
      return (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">No usage history available</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Recent AI Requests
        </h3>
        <div className="bg-white dark:bg-gray-800 rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Feature
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tokens
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {usageRecords.slice(0, 20).map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {new Date(record.timestamp.toDate()).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      <span className="capitalize">{record.endpoint.replace('-', ' ')}</span>
                      {record.cacheHit && (
                        <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                          Cached
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {record.success ? (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                          Success
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded">
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {record.duration}ms
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      ${record.cost.toFixed(4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {record.totalTokens}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderEfficiency = () => {
    if (!efficiencyMetrics) {
      return (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">Efficiency metrics will appear after you use AI features</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Usage Efficiency
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Performance Metrics</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Cost Efficiency</span>
                <span className="font-medium">${efficiencyMetrics.costEfficiency.toFixed(4)} per request</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Avg Response Time</span>
                <span className="font-medium">{Math.round(efficiencyMetrics.timeEfficiency)}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Cache Hit Rate</span>
                <span className="font-medium">{efficiencyMetrics.cacheEfficiency.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Success Rate</span>
                <span className="font-medium">{(100 - efficiencyMetrics.errorRate).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Usage Patterns</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Peak Usage Hour</span>
                <span className="font-medium">{efficiencyMetrics.peakUsageHour}:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Most Used Feature</span>
                <span className="font-medium capitalize">{efficiencyMetrics.mostUsedEndpoint.replace('-', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Least Used Feature</span>
                <span className="font-medium capitalize">{efficiencyMetrics.leastUsedEndpoint.replace('-', ' ')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Recommendations</h4>
          <div className="space-y-3">
            {efficiencyMetrics.recommendations.map((recommendation: string, index: number) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p className="text-gray-700 dark:text-gray-300">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTips = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Usage Tips & Best Practices
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Cost Optimization
            </h4>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>• Use cached results when possible</li>
              <li>• Be specific in your requests to reduce token usage</li>
              <li>• Batch similar requests together</li>
              <li>• Monitor your daily usage to stay within limits</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Feature Usage
            </h4>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>• Habit enhancement: Get personalized tips</li>
              <li>• Quick insights: Motivation for your journey</li>
              <li>• Mood analysis: Understand your patterns</li>
              <li>• Use AI features strategically for best results</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Privacy & Data
            </h4>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>• Your data is used only for personalization</li>
              <li>• Usage analytics help improve the service</li>
              <li>• You can view all your AI interactions</li>
              <li>• Data is secured and never shared</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
              Limits & Resets
            </h4>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>• Daily limit: {usageSummary?.dailyUsage.limit || 10} requests</li>
              <li>• Limits reset at midnight</li>
              <li>• Plan your AI usage throughout the day</li>
              <li>• Contact support for limit increases</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          My AI Usage
        </h2>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'history', label: 'History' },
              { key: 'efficiency', label: 'Efficiency' },
              { key: 'tips', label: 'Tips' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'history' && renderHistory()}
        {activeTab === 'efficiency' && renderEfficiency()}
        {activeTab === 'tips' && renderTips()}
      </div>
    </div>
  );
}