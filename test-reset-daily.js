#!/usr/bin/env node

/**
 * Test script to clear today's family habit completions for testing daily reset
 * This will simulate what happens when a new day starts
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

// Firebase configuration (from your lib/firebase.ts)
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
  const today = new Date().toISOString().split('T')[0];
  console.log(`🗑️ Clearing completions for date: ${today}`);
  
  try {
    // Query all completions for today
    const completionsRef = collection(db, 'families', '0Xeabs1JHCGzb3EccUzz', 'completions');
    const q = query(completionsRef, where('date', '==', today));
    const querySnapshot = await getDocs(q);
    
    console.log(`📊 Found ${querySnapshot.docs.length} completions for today`);
    
    // Delete all today's completions
    const deletePromises = querySnapshot.docs.map(docSnap => {
      console.log(`🗑️ Deleting completion: ${docSnap.id} (${docSnap.data().habitName || 'Unknown'} for ${docSnap.data().memberId})`);
      return deleteDoc(docSnap.ref);
    });
    
    await Promise.all(deletePromises);
    
    console.log(`✅ Successfully cleared ${deletePromises.length} completions for ${today}`);
    console.log(`🔄 Now refresh your browser to see habits in pending state!`);
    
  } catch (error) {
    console.error('❌ Error clearing completions:', error);
  }
  
  process.exit(0);
}

clearTodaysCompletions();
