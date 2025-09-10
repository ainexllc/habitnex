'use client';

import React, { useState } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { DiceBearAvatar } from '@/components/ui/DiceBearAvatar';

export default function TestMemberSavePage() {
  const { currentFamily, currentMember, addDirectMember, updateFamilyMember } = useFamily();
  const [selectedSkinColor, setSelectedSkinColor] = useState('f2d3b1');
  const [selectedMouth, setSelectedMouth] = useState('variant01');
  const [memberName, setMemberName] = useState('Test Member');
  const [isEditing, setIsEditing] = useState(false);
  const [testMemberId, setTestMemberId] = useState<string | null>(null);

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

  const handleAddMember = async () => {
    if (!currentFamily || !currentMember) {
      alert('No family or current member found');
      return;
    }

    try {
      const memberId = await addDirectMember({
        name: memberName,
        displayName: memberName,
        avatarSeed: `${memberName}-${Date.now()}`,
        avatarSkinColor: selectedSkinColor,
        avatarMouth: selectedMouth,
        color: '#3B82F6',
        role: 'child' as const,
      });

      setTestMemberId(memberId);
      setIsEditing(true);
      alert(`Member added successfully! ID: ${memberId}`);
    } catch (error) {
      console.error('Error adding member:', error);
      alert(`Error adding member: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleUpdateMember = async () => {
    if (!testMemberId) {
      alert('No member to update');
      return;
    }

    try {
      await updateFamilyMember(testMemberId, {
        avatarSkinColor: selectedSkinColor,
        avatarMouth: selectedMouth,
      });

      alert('Member updated successfully!');
    } catch (error) {
      console.error('Error updating member:', error);
      alert(`Error updating member: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🧪 Test Member Save - Skin Color
        </h1>

        {/* Current Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Settings</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><strong>Name:</strong> {memberName}</div>
            <div><strong>Skin Color:</strong> {selectedSkinColor}</div>
            <div><strong>Mouth:</strong> {selectedMouth}</div>
          </div>
        </div>

        {/* Avatar Preview */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-xl font-semibold mb-4">Avatar Preview</h2>
          <div className="flex flex-col items-center space-y-4">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
              <DiceBearAvatar
                seed={memberName}
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
                Preview with current settings
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

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h3 className="text-lg font-semibold mb-4">⚡ Actions</h3>
          <div className="flex gap-4">
            <button
              onClick={handleAddMember}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              ➕ Add Member
            </button>

            {testMemberId && (
              <button
                onClick={handleUpdateMember}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                ✏️ Update Member
              </button>
            )}
          </div>

          {testMemberId && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Test Member ID:</strong> {testMemberId}
              </p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">📋 Testing Instructions</h3>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• Change skin color and mouth expression settings</li>
            <li>• Click "Add Member" to create a new test member</li>
            <li>• Change settings and click "Update Member" to test saving</li>
            <li>• Check if the changes persist by refreshing the page</li>
            <li>• Avatar should maintain the saved skin color and mouth</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
