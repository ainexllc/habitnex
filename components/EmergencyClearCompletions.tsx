'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getTodayDateString } from '@/lib/utils';

export function EmergencyClearCompletions() {
  const [clearing, setClearing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const clearTodaysCompletions = async () => {
    setClearing(true);
    setResult(null);
    
    const today = getTodayDateString(); // Use local date
    console.log(`🗑️ Clearing completions for date: ${today}`);
    
    try {
      // Query all completions for today
      const completionsRef = collection(db, 'families', '0Xeabs1JHCGzb3EccUzz', 'completions');
      const q = query(completionsRef, where('date', '==', today));
      const querySnapshot = await getDocs(q);
      
      console.log(`📊 Found ${querySnapshot.docs.length} completions for today`);
      
      if (querySnapshot.docs.length === 0) {
        setResult(`No completions found for ${today}`);
        setClearing(false);
        return;
      }
      
      // Delete all today's completions
      const deletePromises = querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        console.log(`🗑️ Deleting completion: ${docSnap.id} (${data.habitName || 'Unknown'} for ${data.memberId})`);
        return deleteDoc(docSnap.ref);
      });
      
      await Promise.all(deletePromises);
      
      const message = `✅ Successfully cleared ${deletePromises.length} completions for ${today}`;
      console.log(message);
      setResult(message);
      
      // Auto-refresh after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error clearing completions:', error);
      setResult(`❌ Error: ${error.message}`);
    }
    
    setClearing(false);
  };

  return (
    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <h3 className="text-lg font-bold text-red-800 dark:text-red-200 mb-2">
        🚨 Emergency: Clear Today's Completions
      </h3>
      <p className="text-sm text-red-700 dark:text-red-300 mb-4">
        This will clear all family habit completions for today ({getTodayDateString()}) to test the daily reset functionality.
      </p>
      <Button
        onClick={clearTodaysCompletions}
        disabled={clearing}
        variant="destructive"
        size="sm"
      >
        {clearing ? 'Clearing...' : 'Clear Today\'s Completions'}
      </Button>
      {result && (
        <div className="mt-2 p-2 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-700 rounded text-sm">
          {result}
        </div>
      )}
    </div>
  );
}
