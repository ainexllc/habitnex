'use client';

import React, { useState } from 'react';
import { DiceBearAvatar } from '@/components/ui/DiceBearAvatar';

export default function TestSkinColorsPage() {
  const [selectedSkinColor, setSelectedSkinColor] = useState('f2d3b1');
  const [selectedMouth, setSelectedMouth] = useState('variant01');

  const skinColors = [
    { value: 'f2d3b1', label: 'Light', color: '#f2d3b1' },
    { value: 'ecad80', label: 'Medium', color: '#ecad80' },
    { value: '9e5622', label: 'Dark', color: '#9e5622' },
    { value: '763900', label: 'Deep', color: '#763900' },
  ];

  const mouthOptions = [
    { value: 'variant01', label: '😊 Happy', icon: '😊' },
    { value: 'variant05', label: '🙂 Slight Smile', icon: '🙂' },
    { value: 'variant10', label: '😴 Sleepy', icon: '😴' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🎨 Skin Color Test - Adventurer Style
        </h1>

        {/* Avatar Preview */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-xl font-semibold mb-4">Avatar Preview</h2>
          <div className="flex flex-col items-center space-y-4">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
              <DiceBearAvatar
                seed="test-user"
                style="adventurer"
                size={128}
                options={{
                  skinColor: [selectedSkinColor],
                  mouth: [selectedMouth]
                }}
              />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Skin Color: <strong>{selectedSkinColor}</strong>
              </p>
              <p className="text-sm text-gray-600">
                Mouth: <strong>{selectedMouth}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Skin Color Selection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">🎨 Skin Color</h3>
            <div className="grid grid-cols-2 gap-3">
              {skinColors.map((skinColor) => (
                <button
                  key={skinColor.value}
                  onClick={() => setSelectedSkinColor(skinColor.value)}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedSkinColor === skinColor.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: skinColor.color }}
                    />
                    <span className="text-sm font-medium">{skinColor.label}</span>
                    <span className="text-xs text-gray-500">{skinColor.value}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Mouth Expression Selection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">😀 Mouth Expression</h3>
            <div className="grid grid-cols-1 gap-3">
              {mouthOptions.map((mouth) => (
                <button
                  key={mouth.value}
                  onClick={() => setSelectedMouth(mouth.value)}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedMouth === mouth.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-2xl">{mouth.icon}</span>
                    <span className="text-sm font-medium">{mouth.label}</span>
                    <span className="text-xs text-gray-500">{mouth.value}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-gray-100 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold mb-4">🔧 Debug Info</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Style:</strong> adventurer</p>
            <p><strong>Seed:</strong> test-user</p>
            <p><strong>Selected Skin Color:</strong> {selectedSkinColor}</p>
            <p><strong>Selected Mouth:</strong> {selectedMouth}</p>
            <p><strong>Options Object:</strong></p>
            <pre className="bg-white p-2 rounded text-xs overflow-x-auto">
              {JSON.stringify({
                skinColor: [selectedSkinColor],
                mouth: [selectedMouth]
              }, null, 2)}
            </pre>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">📋 Testing Instructions</h3>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• Click different skin colors to see the avatar change</li>
            <li>• Click different mouth expressions to see facial changes</li>
            <li>• The avatar should update immediately when you make selections</li>
            <li>• Check the debug info to see the options being passed</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
