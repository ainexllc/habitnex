'use client';

import { useState } from 'react';
import { createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';
import { AvatarBuilder } from '@/components/ui/AvatarBuilder';
import { avatarConfigToDiceBearOptions } from '@/components/ui/DiceBearAvatar';
import type { AvatarConfig } from '@/types/family';

export default function TestAvatarDebug() {
  const [config, setConfig] = useState<AvatarConfig>({
    topType: 'ShortHairShortFlat',
    hairColor: 'Brown',
    eyeType: 'Default',
    eyebrowType: 'Default',
    mouthType: 'Smile',
    facialHairType: 'Blank',
    accessoriesType: 'Blank',
    clotheType: 'ShirtCrewNeck',
    clotheColor: '#3B82F6',
    skinColor: 'Light',
    backgroundColor: ['#E0E0E0'],
  });

  const handleConfigChange = (newConfig: AvatarConfig) => {
    setConfig(newConfig);
  };

  // Test direct avatar creation
  const testAvatarSvg = (() => {
    try {
      const options = avatarConfigToDiceBearOptions(config);
      console.log('Test avatar options:', options);
      const svg = createAvatar(adventurer as any, { ...options, size: 120 }).toString();
      console.log('Test avatar SVG generated, length:', svg?.length);
      return svg;
    } catch (error) {
      console.error('Test avatar generation error:', error);
      return null;
    }
  })();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Avatar Debug Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Direct Avatar Test */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Direct Avatar Test</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  SVG Generated: {testAvatarSvg ? 'Yes' : 'No'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  SVG Length: {testAvatarSvg?.length || 0} chars
                </p>
              </div>
              
              {testAvatarSvg && (
                <div className="flex justify-center">
                  <div 
                    className="w-32 h-32 rounded-full overflow-hidden bg-gray-200"
                    dangerouslySetInnerHTML={{ __html: testAvatarSvg }}
                  />
                </div>
              )}
              
              <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-auto max-h-40">
                <pre className="text-gray-700 dark:text-gray-300">
                  {JSON.stringify(avatarConfigToDiceBearOptions(config), null, 2)}
                </pre>
              </div>
            </div>
          </div>

          {/* AvatarBuilder Component Test */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">AvatarBuilder Component</h2>
            <AvatarBuilder
              initialConfig={config}
              onChange={handleConfigChange}
            />
          </div>
        </div>

        {/* Current Config Display */}
        <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Current Config</h2>
          <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-auto">
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
