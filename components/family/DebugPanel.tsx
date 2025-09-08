'use client';

import { useAllFamilyHabits } from '@/hooks/useFamilyHabits';
import { useFamily } from '@/contexts/FamilyContext';
import { useGlobalData } from '@/contexts/GlobalDataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export function DebugPanel() {
  const { currentFamily, currentMember } = useFamily();
  const { familyCompletions } = useGlobalData();
  const { allHabits, getHabitsByMember } = useAllFamilyHabits();
  
  if (!currentFamily || !currentMember) {
    return <div>Not logged in to a family</div>;
  }

  // Get current date info
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayLocal = `${year}-${month}-${day}`;
  const todayISO = today.toISOString().split('T')[0];
  
  // Get member habits
  const memberHabits = currentFamily.members.map(member => {
    const habits = getHabitsByMember(member.id);
    return {
      memberId: member.id,
      memberName: member.displayName,
      habitsCount: habits.length,
      completedCount: habits.filter(h => h.completed).length,
      habits: habits.map(h => ({
        name: h.name,
        id: h.id,
        completed: h.completed,
        yesterdayStatus: h.yesterdayStatus
      }))
    };
  });

  // Get recent completions
  const recentCompletions = familyCompletions
    .slice(0, 10)
    .map(c => ({
      date: c.date,
      habitId: c.habitId,
      memberId: c.memberId,
      completed: c.completed,
      notes: c.notes
    }));

  // Check for date mismatches
  const uniqueDates = [...new Set(familyCompletions.map(c => c.date))].sort().reverse();

  return (
    <Card className="m-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500">
      <CardHeader>
        <CardTitle className="text-red-600">🔍 Debug Panel - Date Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-white dark:bg-gray-800 p-2 rounded">
            <h3 className="font-bold text-blue-600">Date Information:</h3>
            <p>Current Time: {today.toString()}</p>
            <p>Today (Local Format): {todayLocal}</p>
            <p>Today (ISO Format): {todayISO}</p>
            <p>Day of Week: {today.getDay()} ({['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][today.getDay()]})</p>
            <p>Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-2 rounded">
            <h3 className="font-bold text-green-600">Family Members & Habits:</h3>
            {memberHabits.map(m => (
              <div key={m.memberId} className="ml-2 mb-2">
                <p className="font-semibold">{m.memberName}: {m.completedCount}/{m.habitsCount} completed</p>
                {m.habits.map(h => (
                  <p key={h.id} className="ml-4">
                    - {h.name}: {h.completed ? '✅ Completed' : '⬜ Not completed'}
                    {h.yesterdayStatus && ` (Yesterday: ${h.yesterdayStatus})`}
                  </p>
                ))}
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-800 p-2 rounded">
            <h3 className="font-bold text-purple-600">Recent Completions (Last 10):</h3>
            {recentCompletions.map((c, i) => (
              <p key={i} className="ml-2">
                {c.date} | Habit: {c.habitId.slice(0, 8)} | Member: {c.memberId.slice(0, 8)} | 
                {c.completed ? ' ✅' : ' ❌'} {c.notes && `(${c.notes})`}
              </p>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-800 p-2 rounded">
            <h3 className="font-bold text-orange-600">Unique Completion Dates:</h3>
            <p className="ml-2">{uniqueDates.slice(0, 5).join(', ')}</p>
            <p className="ml-2 text-red-600">
              {uniqueDates[0] === todayLocal ? '✅ Today\'s date matches' : `❌ Latest date (${uniqueDates[0]}) doesn't match today (${todayLocal})`}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-2 rounded">
            <h3 className="font-bold text-red-600">Total Data:</h3>
            <p>Total Habits: {allHabits.length}</p>
            <p>Total Completions: {familyCompletions.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}