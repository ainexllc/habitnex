'use client';

import { useState } from 'react';
import { AdventurerAvatarBuilder } from '@/components/ui/AvataaarsAvatarBuilder';
import { theme } from '@/lib/theme';
import { cn } from '@/lib/utils';

export default function TestAvataaarsPage() {
  const [savedAvatar, setSavedAvatar] = useState<any>(null);

  const handleAvatarSave = (avatarData: any) => {
    console.log('Avatar saved:', avatarData);
    setSavedAvatar(avatarData);
  };

  return (
    <div className={cn("min-h-screen", theme.surface.primary)}>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className={cn("text-3xl font-bold mb-2", theme.text.primary)}>
              Adventurer Avatar Builder Test
            </h1>
            <p className={theme.text.secondary}>
              Test the adventurer-style avatar builder with color customization and probability controls
            </p>
          </div>

          {/* Avatar Builder */}
          <div className={cn("rounded-lg border p-6", theme.surface.secondary, theme.border.default)}>
            <AdventurerAvatarBuilder
              initialData={{
                seed: 'test-avatar',
                eyes: 'variant03',
                eyebrows: 'variant02',
                mouth: 'variant01',
                hair: 'short08',
                skinColor: '#EDB98A',
                hairColor: '#724133',
                backgroundColor: 'transparent',
                hairProbability: 100,
                glassesProbability: 20,
                featuresProbability: 10,
                earringsProbability: 30
              }}
              onSave={handleAvatarSave}
            />
          </div>

          {/* Saved Avatar Display */}
          {savedAvatar && (
            <div className={cn("mt-8 p-6 rounded-lg border", theme.surface.secondary, theme.border.default)}>
              <h2 className={cn("text-xl font-semibold mb-4", theme.text.primary)}>
                Saved Avatar
              </h2>
              <div className="flex items-start gap-6">
                <div className="w-32 h-32">
                  <img 
                    src={savedAvatar.avatarUrl}
                    alt="Saved avatar"
                    className="w-full h-full rounded-full border-2 border-gray-300"
                  />
                </div>
                <div className="flex-1">
                  <h3 className={cn("font-medium mb-2", theme.text.primary)}>Avatar Configuration:</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><strong>Seed:</strong> {savedAvatar.seed}</div>
                    <div><strong>Eyes:</strong> {savedAvatar.eyes || 'Random'}</div>
                    <div><strong>Eyebrows:</strong> {savedAvatar.eyebrows || 'Random'}</div>
                    <div><strong>Mouth:</strong> {savedAvatar.mouth || 'Random'}</div>
                    <div><strong>Hair:</strong> {savedAvatar.hair || 'Random'}</div>
                    <div><strong>Skin Color:</strong> {savedAvatar.skinColor}</div>
                    <div><strong>Hair Color:</strong> {savedAvatar.hairColor}</div>
                    <div><strong>Background:</strong> {savedAvatar.backgroundColor}</div>
                    <div><strong>Hair Prob:</strong> {savedAvatar.hairProbability}%</div>
                    <div><strong>Glasses Prob:</strong> {savedAvatar.glassesProbability}%</div>
                    <div><strong>Features Prob:</strong> {savedAvatar.featuresProbability}%</div>
                    <div><strong>Earrings Prob:</strong> {savedAvatar.earringsProbability}%</div>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs text-gray-600 break-all">
                      <strong>URL:</strong> {savedAvatar.avatarUrl}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Feature Highlights */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={cn("p-6 rounded-lg border", theme.surface.secondary, theme.border.default)}>
              <h3 className={cn("font-semibold mb-2 flex items-center gap-2", theme.text.primary)}>
                👁️ Facial Features
              </h3>
              <p className={theme.text.secondary}>
                Direct selection of eyes, eyebrows, mouth, and hair styles with visual thumbnails
              </p>
            </div>
            <div className={cn("p-6 rounded-lg border", theme.surface.secondary, theme.border.default)}>
              <h3 className={cn("font-semibold mb-2 flex items-center gap-2", theme.text.primary)}>
                🎨 Colors & Probabilities
              </h3>
              <p className={theme.text.secondary}>
                Choose specific colors and adjust probability sliders for additional features
              </p>
            </div>
            <div className={cn("p-6 rounded-lg border", theme.surface.secondary, theme.border.default)}>
              <h3 className={cn("font-semibold mb-2 flex items-center gap-2", theme.text.primary)}>
                ✨ Feature Probabilities
              </h3>
              <p className={theme.text.secondary}>
                Adjust probability sliders for hair, glasses, features, and earrings
              </p>
            </div>
            <div className={cn("p-6 rounded-lg border", theme.surface.secondary, theme.border.default)}>
              <h3 className={cn("font-semibold mb-2 flex items-center gap-2", theme.text.primary)}>
                ⚙️ Advanced Options
              </h3>
              <p className={theme.text.secondary}>
                Fine-tune with seed control, horizontal flip, rotation, and scaling options
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
