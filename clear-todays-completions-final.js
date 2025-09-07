#!/usr/bin/env node

/**
 * Clear Today's Family Habit Completions
 * 
 * This script clears all family habit completions for today (2025-09-07)
 * that were incorrectly stored due to the timezone bug we fixed.
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs,
  deleteDoc,
  doc
} = require('firebase/firestore');

// Firebase configuration from your lib/firebase.ts
const firebaseConfig = {
  apiKey: "AIzaSyDojt2j9hrgI8_lXcfzUvVcn64RUuvrZ14",
  authDomain: "habittracker-eb6bd.firebaseapp.com",
  projectId: "habittracker-eb6bd",
  storageBucket: "habittracker-eb6bd.firebasestorage.app",
  messagingSenderId: "324797617648",
  appId: "1:324797617648:web:f412c1ba7f2c770201f935",
  measurementId: "G-TL3TYRC6GX"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clearTodaysCompletions() {
  // Get today's date in local timezone (Central Time)
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  console.log(`🗑️ Clearing family habit completions for: ${todayString}`);
  console.log(`🌍 Your timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
  console.log(`⏰ Current local time: ${today.toLocaleString()}`);
  
  try {
    // Query all completions for today in the family collection
    const completionsRef = collection(db, 'families', '0Xeabs1JHCGzb3EccUzz', 'completions');
    const q = query(completionsRef, where('date', '==', todayString));
    const querySnapshot = await getDocs(q);
    
    console.log(`📊 Found ${querySnapshot.docs.length} completions to clear`);
    
    if (querySnapshot.docs.length === 0) {
      console.log('✅ No completions found for today - already clean!');
      process.exit(0);
    }
    
    // Log what we're about to delete
    console.log('\n📋 Completions to be deleted:');
    querySnapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      const timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
      console.log(`  • ${data.habitName || docSnap.id} (${data.memberId}) - ${timestamp.toLocaleString()}`);
    });
    
    // Delete all today's completions
    console.log('\n🗑️ Deleting completions...');
    const deletePromises = querySnapshot.docs.map(docSnap => {
      return deleteDoc(docSnap.ref);
    });
    
    await Promise.all(deletePromises);
    
    console.log(`✅ Successfully cleared ${deletePromises.length} completions for ${todayString}`);
    console.log('🔄 Now refresh your browser to see habits in clean pending state!');
    console.log('✨ Daily reset should work correctly going forward with timezone fixes applied');
    
  } catch (error) {
    console.error('❌ Error clearing completions:', error);
    console.log('💡 This might be due to Firebase security rules requiring authentication');
    console.log('💡 Try running this script with proper authentication or use the browser-based approach');
  }
  
  process.exit(0);
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error);
  process.exit(1);
});

console.log('🚀 Starting completion cleanup...');
clearTodaysCompletions();
