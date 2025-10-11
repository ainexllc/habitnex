import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseConfig';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';

export async function GET(request: Request) {
  try {
    // Get auth header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the token (simplified for debugging)
    // In production, you'd verify this properly
    
    // Get today's date in local format
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;
    
    // Also get ISO format for comparison
    const todayISO = today.toISOString().split('T')[0];

    // Query completions from Firestore
    const completionsRef = collection(db, 'familyCompletions');
    const q = query(
      completionsRef,
      orderBy('date', 'desc'),
      limit(20)
    );
    
    const snapshot = await getDocs(q);
    const completions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Analyze the data
    const analysis = {
      currentDateTime: today.toString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      todayLocal: todayString,
      todayISO: todayISO,
      totalCompletions: completions.length,
      completionDates: completions.map(c => c.date).filter((v, i, a) => a.indexOf(v) === i),
      todaysCompletions: completions.filter(c => c.date === todayString),
      todaysCompletionsISO: completions.filter(c => c.date === todayISO),
      recentCompletions: completions.slice(0, 5).map(c => ({
        date: c.date,
        habitId: c.habitId,
        memberId: c.memberId,
        completed: c.completed,
        timestamp: c.timestamp
      }))
    };

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch debug data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}