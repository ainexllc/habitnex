// Test script to verify habit display fix
// Run with: node test-habit-display.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, orderBy } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Firebase config from your environment
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDOIADuI3Jeh-Avc0dHi84LBllgjMqeVtQ",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "habittracker-eb6bd.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "habittracker-eb6bd",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "habittracker-eb6bd.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "324797617648",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:324797617648:web:f079f1c0f19b2f3e89f323"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function testHabitDisplay() {
  try {
    // Replace with your test user credentials
    const email = 'test@example.com';
    const password = 'testpassword';
    
    console.log('Signing in...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;
    console.log('Signed in as:', userId);
    
    // First check user's families
    console.log('\nChecking user families...');
    const userFamiliesRef = collection(db, 'users', userId, 'families');
    const familiesSnapshot = await getDocs(userFamiliesRef);
    
    if (familiesSnapshot.empty) {
      console.log('No families found for user. User needs to create a family first.');
      return;
    }
    
    const userFamilies = familiesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log('User families:', userFamilies);
    
    // Get first family
    const familyId = userFamilies[0].familyId;
    const memberId = userFamilies[0].member?.id;
    console.log('Using family:', familyId, 'Member:', memberId);
    
    // Check habits in family
    console.log('\nChecking habits in family...');
    const habitsRef = collection(db, 'families', familyId, 'habits');
    const habitsQuery = query(
      habitsRef,
      where('isActive', '==', true),
      where('assignedMembers', 'array-contains', memberId),
      orderBy('createdAt', 'desc')
    );
    
    const habitsSnapshot = await getDocs(habitsQuery);
    
    if (habitsSnapshot.empty) {
      console.log('No habits found in family.');
    } else {
      console.log(`Found ${habitsSnapshot.size} habits:`);
      habitsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log('\nHabit ID:', doc.id);
        console.log('  Name:', data.name || data.title || 'MISSING NAME');
        console.log('  Description:', data.description || 'No description');
        console.log('  Color:', data.color);
        console.log('  Frequency:', data.frequency);
        console.log('  Is Active:', data.isActive);
        console.log('  Assigned Members:', data.assignedMembers);
      });
    }
    
    // Check individual habits (fallback structure)
    console.log('\nChecking individual habits (fallback)...');
    const individualHabitsRef = collection(db, 'users', userId, 'habits');
    const individualSnapshot = await getDocs(individualHabitsRef);
    
    if (!individualSnapshot.empty) {
      console.log(`Found ${individualSnapshot.size} individual habits:`);
      individualSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log('\nHabit ID:', doc.id);
        console.log('  Name:', data.name || 'MISSING NAME');
        console.log('  Description:', data.description || 'No description');
      });
    } else {
      console.log('No individual habits found (expected if using family structure).');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
  
  process.exit(0);
}

testHabitDisplay();