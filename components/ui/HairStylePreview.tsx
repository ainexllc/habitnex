'use client';

import React from 'react';

interface HairStylePreviewProps {
  hairStyle: string;
  size?: number;
  className?: string;
}

export function HairStylePreview({ hairStyle, size = 32, className = "" }: HairStylePreviewProps) {
  const thumbnailUrl = `/hair-thumbnails/${hairStyle}.svg`;
  
  return (
    <div className={`relative ${className}`}>
      <img
        src={thumbnailUrl}
        alt={`${hairStyle} hair style`}
        width={size}
        height={size}
        className="rounded-sm border border-gray-200 dark:border-gray-600"
        onError={(e) => {
          // Fallback to DiceBear API if local thumbnail doesn't exist
          const target = e.target as HTMLImageElement;
          target.src = `https://api.dicebear.com/9.x/adventurer/svg?seed=${hairStyle}&hair=${hairStyle}&size=${size}`;
        }}
      />
    </div>
  );
}

interface HairStyleGridProps {
  selectedHairStyle?: string;
  onHairStyleSelect: (hairStyle: string) => void;
}

export function HairStyleGrid({ selectedHairStyle, onHairStyleSelect }: HairStyleGridProps) {
  const shortHairs = [
    'short01', 'short02', 'short03', 'short04', 'short05', 'short06', 'short07', 'short08',
    'short09', 'short10', 'short11', 'short12', 'short13', 'short14', 'short15', 'short16'
  ];
  
  const longHairs = [
    'long01', 'long02', 'long03', 'long04', 'long05', 'long06', 'long07', 'long08',
    'long09', 'long10', 'long11', 'long12', 'long13', 'long14', 'long15', 'long16',
    'long17', 'long18', 'long19', 'long20', 'long21', 'long22', 'long23', 'long24',
    'long25', 'long26'
  ];

  return (
    <div className="space-y-4">
      {/* Short Hair */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Short Hair</h4>
        <div className="grid grid-cols-8 gap-2">
          {shortHairs.map((hair) => (
            <button
              key={hair}
              onClick={() => onHairStyleSelect(hair)}
              className={`p-1 rounded border-2 transition-all ${
                selectedHairStyle === hair
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
              }`}
              title={hair}
            >
              <HairStylePreview hairStyle={hair} size={24} />
            </button>
          ))}
        </div>
      </div>

      {/* Long Hair */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Long Hair</h4>
        <div className="grid grid-cols-8 gap-2">
          {longHairs.map((hair) => (
            <button
              key={hair}
              onClick={() => onHairStyleSelect(hair)}
              className={`p-1 rounded border-2 transition-all ${
                selectedHairStyle === hair
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
              }`}
              title={hair}
            >
              <HairStylePreview hairStyle={hair} size={24} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}