'use client';

import { useState } from 'react';
import { createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';
import { AdventurerAvatarBuilder } from '@/components/ui/AdventurerAvatarBuilder';

export default function TestAdventurer() {
  const [seed, setSeed] = useState('test-avatar');
  const [backgroundColor, setBackgroundColor] = useState<string[]>([]);
  
  // Test direct avatar creation
  const testSvg = createAvatar(adventurer, {
    seed: 'test-direct',
    size: 120,
  }).toString();
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Adventurer Avatar Test
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Direct Test */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Direct Avatar Creation
            </h2>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                SVG Length: {testSvg?.length || 0} characters
              </p>
              <div className="flex justify-center">
                <div 
                  className="w-32 h-32 rounded-full overflow-hidden bg-gray-200"
                  dangerouslySetInnerHTML={{ __html: testSvg }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 break-all">
                First 200 chars: {testSvg?.substring(0, 200)}...
              </p>
            </div>
          </div>
          
          {/* Component Test */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              AdventurerAvatarBuilder Component
            </h2>
            <AdventurerAvatarBuilder
              initialSeed={seed}
              onChange={(newSeed, newBg) => {
                setSeed(newSeed);
                setBackgroundColor(newBg || []);
                console.log('Avatar changed:', { seed: newSeed, bg: newBg });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
