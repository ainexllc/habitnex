// Browser Console Script to Clear Today's Completions
// Run this in your browser console to clear today's family habit completions for testing

async function clearTodaysCompletions() {
  console.log('🗑️ Clearing today\'s family habit completions for testing...');
  
  // Get today's date (using local timezone)
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  console.log(`📅 Today: ${todayString}`);
  console.log(`🌍 Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
  
  try {
    // Import Firebase functions (assuming they're available globally or through imports)
    const { collection, query, where, getDocs, deleteDoc } = await import('firebase/firestore');
    const { db } = await import('./lib/firebase.js');
    
    // Query today's completions
    const completionsRef = collection(db, 'families', '0Xeabs1JHCGzb3EccUzz', 'completions');
    const q = query(completionsRef, where('date', '==', todayString));
    const querySnapshot = await getDocs(q);
    
    console.log(`📊 Found ${querySnapshot.docs.length} completions for today`);
    
    if (querySnapshot.docs.length === 0) {
      console.log('✅ No completions to clear for today');
      return;
    }
    
    // Delete all today's completions
    const deletePromises = querySnapshot.docs.map(async (docSnap) => {
      const data = docSnap.data();
      console.log(`🗑️ Deleting completion: ${data.habitName || docSnap.id} (${data.memberId})`);
      return deleteDoc(docSnap.ref);
    });
    
    await Promise.all(deletePromises);
    
    console.log(`✅ Successfully cleared ${deletePromises.length} completions for ${todayString}`);
    console.log('🔄 Refresh your browser to see habits in pending state!');
    
    // Refresh the page after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    
  } catch (error) {
    console.error('❌ Error clearing completions:', error);
    
    // Fallback: Manual refresh to see if Firebase state has changed
    console.log('🔄 Try refreshing the page manually');
  }
}

// Run the function
clearTodaysCompletions();
