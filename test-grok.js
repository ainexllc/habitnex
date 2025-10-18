#!/usr/bin/env node

/**
 * Test script for Grok API integration
 */

async function testGrokAPI() {
  console.log('🧪 Testing Grok API Integration...\n');

  // Test 1: Habit Insight
  console.log('1️⃣  Testing habit insight endpoint...');
  try {
    const response = await fetch('http://localhost:3001/api/grok/habit-insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        habitName: 'Morning Exercise',
        completionHistory: [true, true, false, true, true, true, false],
        context: 'User wants to build consistency'
      })
    });

    const data = await response.json();
    console.log('✅ Status:', response.status);
    console.log('📊 Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n' + '─'.repeat(60) + '\n');

  // Test 2: Habit Recommendations
  console.log('2️⃣  Testing habit recommendations endpoint...');
  try {
    const response = await fetch('http://localhost:3001/api/grok/recommend-habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        existingHabits: ['Morning Exercise', 'Meditation', 'Reading'],
        userGoals: 'Improve overall health and productivity'
      })
    });

    const data = await response.json();
    console.log('✅ Status:', response.status);
    console.log('📊 Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n' + '─'.repeat(60) + '\n');

  // Test 3: Enhance Habit
  console.log('3️⃣  Testing habit enhancement endpoint...');
  try {
    const response = await fetch('http://localhost:3001/api/grok/enhance-habit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        habitTitle: 'Drink Water',
        currentDescription: 'Stay hydrated'
      })
    });

    const data = await response.json();
    console.log('✅ Status:', response.status);
    console.log('📊 Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n✨ Testing complete!\n');
}

testGrokAPI().catch(console.error);
