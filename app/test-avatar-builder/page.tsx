'use client';

import { useState } from 'react';
import { AvatarBuilder } from '@/components/ui/AvatarBuilder';
import { DiceBearAvatar, avatarConfigToDiceBearOptions } from '@/components/ui/DiceBearAvatar';
import type { AvatarConfig } from '@/types/family';
import { cn } from '@/lib/utils';
import { theme } from '@/lib/theme';

export default function TestAvatarBuilderPage() {
  const [savedConfig, setSavedConfig] = useState<AvatarConfig | null>(null);
  const [currentConfig, setCurrentConfig] = useState<AvatarConfig | null>(null);
  
  const handleSave = (config: AvatarConfig) => {
    setSavedConfig(config);
    console.log('Saved avatar config:', config);
    alert('Avatar saved! Check console for configuration.');
  };
  
  const handleChange = (config: AvatarConfig) => {
    setCurrentConfig(config);
  };
  
  return (
    <div className={cn("min-h-screen", theme.surface.primary)}>
      <div className="container mx-auto px-4 py-8">
        <div className={cn("text-center mb-8", theme.text.primary)}>
          <h1 className="text-4xl font-bold mb-2">Avatar Builder Test</h1>
          <p className={theme.text.secondary}>
            Create your own custom avatar with full control over appearance
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <div className={cn(
            "rounded-lg p-6 mb-8",
            theme.surface.secondary,
            theme.border.default,
            "border"
          )}>
            <h2 className={cn("text-2xl font-semibold mb-6", theme.text.primary)}>
              Create Your Avatar
            </h2>
            
            <AvatarBuilder
              onChange={handleChange}
              onSave={handleSave}
            />
          </div>
          
          {savedConfig && (
            <div className={cn(
              "rounded-lg p-6",
              theme.surface.secondary,
              theme.border.default,
              "border"
            )}>
              <h2 className={cn("text-2xl font-semibold mb-6", theme.text.primary)}>
                Saved Avatar Preview
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className={cn("text-lg font-medium mb-4", theme.text.primary)}>
                    Different Sizes
                  </h3>
                  <div className="flex items-end gap-4">
                    <div className="text-center">
                      <DiceBearAvatar
                        style="avataaars"
                        options={avatarConfigToDiceBearOptions(savedConfig)}
                        size={32}
                      />
                      <p className={cn("text-xs mt-1", theme.text.muted)}>32px</p>
                    </div>
                    <div className="text-center">
                      <DiceBearAvatar
                        style="avataaars"
                        options={avatarConfigToDiceBearOptions(savedConfig)}
                        size={48}
                      />
                      <p className={cn("text-xs mt-1", theme.text.muted)}>48px</p>
                    </div>
                    <div className="text-center">
                      <DiceBearAvatar
                        style="avataaars"
                        options={avatarConfigToDiceBearOptions(savedConfig)}
                        size={64}
                      />
                      <p className={cn("text-xs mt-1", theme.text.muted)}>64px</p>
                    </div>
                    <div className="text-center">
                      <DiceBearAvatar
                        style="avataaars"
                        options={avatarConfigToDiceBearOptions(savedConfig)}
                        size={96}
                      />
                      <p className={cn("text-xs mt-1", theme.text.muted)}>96px</p>
                    </div>
                    <div className="text-center">
                      <DiceBearAvatar
                        style="avataaars"
                        options={avatarConfigToDiceBearOptions(savedConfig)}
                        size={128}
                      />
                      <p className={cn("text-xs mt-1", theme.text.muted)}>128px</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className={cn("text-lg font-medium mb-4", theme.text.primary)}>
                    Configuration JSON
                  </h3>
                  <pre className={cn(
                    "p-4 rounded-lg text-xs overflow-auto",
                    theme.surface.primary,
                    theme.border.default,
                    theme.text.primary,
                    "border"
                  )}>
                    {JSON.stringify(savedConfig, null, 2)}
                  </pre>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className={cn("text-lg font-medium mb-4", theme.text.primary)}>
                  Usage Example
                </h3>
                <div className={cn(
                  "p-4 rounded-lg",
                  theme.surface.primary,
                  theme.border.default,
                  "border"
                )}>
                  <code className={cn("text-sm", theme.text.primary)}>
                    {`// Using with custom config
<DiceBearAvatar
  style="avataaars"
  options={avatarConfigToDiceBearOptions(config)}
  size={64}
/>

// The config would be stored in Firestore as:
{
  avatarOrigin: 'custom',
  avatarStyle: 'avataaars',
  avatarConfig: ${JSON.stringify(savedConfig, null, 2).split('\n').map((line, i) => i === 0 ? line : '  ' + line).join('\n')}
}`}
                  </code>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
