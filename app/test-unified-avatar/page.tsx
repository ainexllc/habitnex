'use client';

import React, { useState } from 'react';
import { UnifiedAvatarCreator } from '@/components/ui/deprecated/UnifiedAvatarCreator';
import type { AvatarConfig } from '@/types/family';

export default function TestUnifiedAvatarPage() {
  const [config, setConfig] = useState<AvatarConfig | null>(null);
  const [selectedRole, setSelectedRole] = useState<'parent' | 'child' | 'teen' | 'adult'>('child');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Unified Avatar Creator Test
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Test the new unified avatar creation system with two-path flow
            </p>
          </div>

          {/* Role Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Test Role
            </label>
            <div className="flex gap-2">
              {['child', 'teen', 'parent', 'adult'].map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role as any)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    selectedRole === role
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Avatar Creator */}
          <UnifiedAvatarCreator
            role={selectedRole}
            onChange={(newConfig) => {
              setConfig(newConfig);
              console.log('Avatar config changed:', newConfig);
            }}
            className="border rounded-lg p-4"
          />

          {/* Config Display */}
          {config && (
            <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Current Configuration:
              </h3>
              <pre className="text-sm text-gray-600 dark:text-gray-300 overflow-auto">
                {JSON.stringify(config, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}