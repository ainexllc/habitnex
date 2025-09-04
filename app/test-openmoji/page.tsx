'use client';

import React, { useState } from 'react';
import { OpenMoji, OpenMojiSmall, OpenMojiMedium, OpenMojiLarge, OpenMojiXL, OpenMojiXXL } from '@/components/ui/OpenMoji';
import { OpenMojiPicker, OpenMojiTrigger } from '@/components/ui/OpenMojiPicker';
import { EMOJI_MAP, EMOJI_CATEGORIES } from '@/lib/openmoji/emojiMap';

export default function TestOpenMojiPage() {
  const [selectedEmoji, setSelectedEmoji] = useState('🎯');
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          OpenMoji Components Test
        </h1>

        {/* Size Variations */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Size Variations
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <OpenMojiSmall emoji="💪" />
              <p className="text-xs text-gray-500 mt-1">Small (16px)</p>
            </div>
            <div className="text-center">
              <OpenMojiMedium emoji="🏃" />
              <p className="text-xs text-gray-500 mt-1">Medium (24px)</p>
            </div>
            <div className="text-center">
              <OpenMojiLarge emoji="📖" />
              <p className="text-xs text-gray-500 mt-1">Large (32px)</p>
            </div>
            <div className="text-center">
              <OpenMojiXL emoji="🥗" />
              <p className="text-xs text-gray-500 mt-1">XL (48px)</p>
            </div>
            <div className="text-center">
              <OpenMojiXXL emoji="💧" />
              <p className="text-xs text-gray-500 mt-1">XXL (64px)</p>
            </div>
          </div>
        </div>

        {/* Fallback Test */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Fallback Test (Non-OpenMoji emojis)
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <OpenMoji emoji="👋" size={32} />
              <p className="text-xs text-gray-500 mt-1">Should fallback to system emoji</p>
            </div>
            <div className="text-center">
              <OpenMoji emoji="🔥" size={32} />
              <p className="text-xs text-gray-500 mt-1">Should fallback to system emoji</p>
            </div>
          </div>
        </div>

        {/* All Available OpenMoji */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            All Available OpenMoji ({Object.keys(EMOJI_MAP).length} total)
          </h2>
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-4">
            {Object.values(EMOJI_MAP).map((emoji) => (
              <div key={emoji.filename} className="text-center">
                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <OpenMoji emoji={emoji.unicode} size={32} alt={emoji.name} />
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate">{emoji.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Categories
          </h2>
          {Object.entries(EMOJI_CATEGORIES).map(([categoryKey, category]) => (
            <div key={categoryKey} className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span>{category.icon}</span>
                {category.name}
              </h3>
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-3">
                {category.emojis.map((emojiName) => {
                  const emojiInfo = EMOJI_MAP[emojiName];
                  return emojiInfo ? (
                    <div key={emojiName} className="text-center">
                      <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <OpenMoji emoji={emojiInfo.unicode} size={24} alt={emojiInfo.name} />
                      </div>
                      <p className="text-xs text-gray-500 mt-1 truncate">{emojiInfo.name}</p>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Picker Test */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            OpenMoji Picker Test
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Selected: {selectedEmoji}
              </p>
              <OpenMojiTrigger
                value={selectedEmoji}
                onSelect={setSelectedEmoji}
                placeholder="🎯"
                size={48}
                className="w-32"
              />
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowPicker(!showPicker)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                {showPicker ? 'Close' : 'Open'} Standalone Picker
              </button>
              <OpenMojiPicker
                value={selectedEmoji}
                onSelect={(emoji) => {
                  setSelectedEmoji(emoji);
                  setShowPicker(false);
                }}
                onClose={() => setShowPicker(false)}
                isOpen={showPicker}
                className="top-full left-0 mt-2"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}