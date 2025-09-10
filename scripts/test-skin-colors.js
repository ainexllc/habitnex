#!/usr/bin/env node

/**
 * Test script to verify skin color selection works with adventurer style
 */

const { createAvatar } = require('@dicebear/core');
const { adventurer } = require('@dicebear/collection');

console.log('🧪 Testing Adventurer Avatar Skin Colors\n');

// Test different skin colors
const skinColors = ['f2d3b1', 'ecad80', '9e5622', '763900'];
const mouthVariants = ['variant01', 'variant05', 'variant10'];

console.log('Available skin colors:', skinColors);
console.log('Available mouth variants:', mouthVariants);
console.log('');

skinColors.forEach(skinColor => {
  console.log(`Testing skin color: ${skinColor}`);

  try {
    // Test with just skin color
    const avatar1 = createAvatar(adventurer, {
      seed: 'test-user',
      skinColor: [skinColor],
      size: 64
    }).toString();

    console.log(`  ✅ Skin color ${skinColor}: ${avatar1.length} chars`);

    // Test with skin color + mouth
    const avatar2 = createAvatar(adventurer, {
      seed: 'test-user',
      skinColor: [skinColor],
      mouth: ['variant01'],
      size: 64
    }).toString();

    console.log(`  ✅ Skin color ${skinColor} + mouth: ${avatar2.length} chars`);
    console.log(`  📊 Difference: ${avatar2.length - avatar1.length} chars`);
    console.log('');

  } catch (error) {
    console.log(`  ❌ Error with skin color ${skinColor}:`, error.message);
    console.log('');
  }
});

console.log('🎉 Skin color testing completed!');
