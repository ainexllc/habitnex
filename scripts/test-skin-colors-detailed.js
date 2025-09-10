#!/usr/bin/env node

/**
 * Detailed test script to verify skin color selection works with adventurer style
 */

const { createAvatar } = require('@dicebear/core');
const { adventurer } = require('@dicebear/collection');
const fs = require('fs');

console.log('🧪 Detailed Adventurer Avatar Skin Color Test\n');

// Test different skin colors
const skinColors = ['f2d3b1', 'ecad80', '9e5622', '763900'];
const baseOptions = {
  seed: 'test-user',
  size: 128
};

console.log('Base options:', baseOptions);
console.log('');

// Generate avatars with different skin colors
const results = {};

skinColors.forEach(skinColor => {
  console.log(`🎨 Testing skin color: ${skinColor} (${skinColor})`);

  try {
    const avatar = createAvatar(adventurer, {
      ...baseOptions,
      skinColor: [skinColor]
    });

    const svgString = avatar.toString();
    results[skinColor] = svgString;

    console.log(`  ✅ Generated: ${svgString.length} characters`);
    console.log(`  📊 First 200 chars: ${svgString.substring(0, 200)}...`);

    // Save to file for visual inspection
    const filename = `test-avatar-${skinColor}.svg`;
    fs.writeFileSync(filename, svgString);
    console.log(`  💾 Saved as: ${filename}`);

  } catch (error) {
    console.log(`  ❌ Error with skin color ${skinColor}:`, error.message);
  }

  console.log('');
});

// Compare results
console.log('🔍 Comparison Results:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const firstResult = results[skinColors[0]];
let allSame = true;

for (const [color, svg] of Object.entries(results)) {
  const isSame = svg === firstResult;
  console.log(`${color}: ${isSame ? 'SAME' : 'DIFFERENT'} (${svg.length} chars)`);

  if (!isSame) {
    allSame = false;
  }
}

console.log('');
if (allSame) {
  console.log('⚠️  WARNING: All avatars are identical! Skin colors may not be working.');
} else {
  console.log('✅ SUCCESS: Avatars are different! Skin colors are working.');
}

console.log('');
console.log('📁 Generated test files:');
skinColors.forEach(color => {
  console.log(`  - test-avatar-${color}.svg`);
});

console.log('\n🎉 Detailed testing completed!');
