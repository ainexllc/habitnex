'use client';

import { useState } from 'react';
import { DiceBearAvatar } from '@/components/ui/DiceBearAvatar';
import { FamilyMember } from '@/types/family';
import { RefreshCw } from 'lucide-react';

export default function TestFamilyAvatars() {
  // Generate unique seed for demonstration
  const generateSeed = (name: string) => `${name}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  
  // Mock family members - all use adventurer style with different seeds
  const [mockMembers, setMockMembers] = useState<Partial<FamilyMember>[]>([
    {
      id: '1',
      displayName: 'Mom',
      avatarSeed: 'mom-1234567890-abc123',
      color: '#EC4899'
    },
    {
      id: '2',
      displayName: 'Dad',
      avatarSeed: 'dad-1234567891-def456',
      color: '#3B82F6'
    },
    {
      id: '3',
      displayName: 'Sarah',
      avatarSeed: 'sarah-1234567892-ghi789',
      color: '#10B981'
    },
    {
      id: '4',
      displayName: 'Alex',
      avatarSeed: 'alex-1234567893-jkl012',
      color: '#F59E0B'
    },
    {
      id: '5',
      displayName: 'Baby Emma',
      avatarSeed: 'baby-emma-1234567894-mno345',
      color: '#8B5CF6'
    }
  ]);
  
  const regenerateAvatar = (index: number) => {
    setMockMembers(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        avatarSeed: generateSeed(updated[index].displayName || 'member')
      };
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Family Avatar Test
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockMembers.map((member, index) => (
            <div 
              key={member.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
              style={{ borderColor: member.color, borderWidth: '2px' }}
            >
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {member.displayName}
                </h3>
                
                <div className="mb-4 relative">
                  {/* Always use adventurer avatar - same as FamilyMemberZone */}
                  <div className="rounded-full border-4 overflow-hidden mx-auto w-32 h-32"
                       style={{ borderColor: member.color }}>
                    <DiceBearAvatar
                      seed={member.avatarSeed || member.id}
                      style="adventurer"
                      size={128}
                      backgroundColor={'#ffffff'}
                    />
                  </div>
                  
                  {/* Regenerate button */}
                  <button
                    onClick={() => regenerateAvatar(index)}
                    className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-all hover:scale-110"
                    title="Generate new avatar"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 mt-6">
                  <div className="font-semibold">Style: Adventurer</div>
                  <div className="break-all px-2">Seed: {member.avatarSeed || member.id}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Adventurer Avatar System
          </h2>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• <strong>All members use Adventurer style avatars</strong></li>
            <li>• <strong>Seed-based generation:</strong> Uses member.avatarSeed or member.id for consistent avatars</li>
            <li>• <strong>Unique avatars:</strong> Each seed generates a unique adventurer character</li>
            <li>• <strong>Consistent appearance:</strong> Same seed always generates the same avatar</li>
            <li>• <strong>Clean aesthetic:</strong> Minimalist pixel art style perfect for family dashboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
