'use client';

import React, { useState } from 'react';
import { useSystemAnalytics } from '@/hooks/useUsageAnalytics';
import { useUsageAlertsManagement } from '@/hooks/useUsageAnalytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AdminUsageAnalytics() {
  const { 
    systemStats, 
    trends, 
    topUsers, 
    loading, 
    error, 
    isAdmin 
  } = useSystemAnalytics();

  const { 
    alerts, 
    criticalAlerts, 
    resolveAlert 
  } = useUsageAlertsManagement();
  
  const warningAlerts = alerts.filter(a => a.type === 'budget_warning' || a.type === 'user_limit');

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'alerts' | 'trends'>('overview');

  if (!isAdmin) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
        <div className="text-red-800 dark:text-red-200">
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p>Admin privileges required to view usage analytics.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
        <div className="text-red-800 dark:text-red-200">
          <h3 className="text-lg font-semibold mb-2">Error Loading Analytics</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const renderOverview = () => {
    if (!systemStats) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">No system usage data available for today.</p>
        </div>
      );
    }

    const budgetData = [
      { name: 'Used', value: systemStats.totalCost, color: '#ef4444' },
      { name: 'Remaining', value: Math.max(0, 5 - systemStats.totalCost), color: '#22c55e' }
    ];

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {systemStats.totalUsers}
              </p>
              <p className="text-sm text-gray-500">Active today</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {systemStats.totalRequests}
              </p>
              <p className="text-sm text-gray-500">
                {systemStats.successRate.toFixed(1)}% success rate
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Cost</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                ${systemStats.totalCost.toFixed(4)}
              </p>
              <p className="text-sm text-gray-500">
                ${systemStats.avgCostPerRequest.toFixed(4)} avg
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {Math.round(systemStats.avgResponseTime)}ms
              </p>
              <p className="text-sm text-gray-500">
                {Math.round(systemStats.avgTokensPerRequest)} tokens avg
              </p>
            </div>
          </div>
        </div>

        {/* Budget Usage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Daily Budget Usage
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={budgetData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {budgetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`$${value.toFixed(4)}`, 'Amount']}
                    contentStyle={{ 
                      backgroundColor: 'rgb(31 41 55)', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {((systemStats.totalCost / 5) * 100).toFixed(1)}% of daily budget used
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Top Endpoints
            </h3>
            <div className="space-y-3">
              {systemStats.topEndpoints.slice(0, 5).map((endpoint, index) => (
                <div key={endpoint.endpoint} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                      {endpoint.endpoint.replace('-', ' ')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {endpoint.requests} requests
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      ${endpoint.cost.toFixed(4)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {Math.round(endpoint.avgResponseTime)}ms avg
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hourly Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Hourly Usage Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={systemStats.hourlyDistribution}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="hour" />
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

  const renderAlerts = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 dark:text-red-200">Critical Alerts</h3>
            <p className="text-2xl font-bold text-red-900 dark:text-red-100">
              {criticalAlerts.length}
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Warning Alerts</h3>
            <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
              {warningAlerts.length}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200">Total Alerts</h3>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {alerts.length}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Active Alerts
          </h3>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 py-8 text-center">
                No active alerts
              </p>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className={`p-4 rounded-lg border ${
                  alert.type === 'budget_critical' || alert.type === 'system_limit'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : alert.type === 'budget_warning' || alert.type === 'user_limit'
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {alert.message}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(alert.timestamp.toDate()).toLocaleString()}
                      </p>
                    </div>
                    {!alert.resolved && (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Usage Analytics Dashboard
        </h2>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'alerts', label: `Alerts (${alerts.length})` },
              { key: 'trends', label: 'Trends' },
              { key: 'users', label: 'Users' }
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
        {activeTab === 'alerts' && renderAlerts()}
        {activeTab === 'trends' && (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              Trends analysis coming soon...
            </p>
          </div>
        )}
        {activeTab === 'users' && (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              User analytics coming soon...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}