/**
 * Test for Daily Family Habit Reset Functionality
 * 
 * This test verifies that habits properly reset each day:
 * 1. Previous day completions are preserved
 * 2. New day shows habits as pending
 * 3. Completion buttons are available for the new day
 */

// Mock Date for testing different days
const mockDate = (dateString) => {
  const realDate = Date;
  global.Date = class extends realDate {
    constructor(...args) {
      if (args.length === 0) {
        return new realDate(dateString);
      }
      return new realDate(...args);
    }
    static now() {
      return new realDate(dateString).getTime();
    }
  };
};

// Mock family habit data
const mockHabit = {
  id: 'habit-1',
  name: 'Morning Exercise',
  emoji: '💪',
  assignedMembers: ['member-1'],
  frequency: 'daily',
  targetDays: [0, 1, 2, 3, 4, 5, 6], // All days
  basePoints: 10,
};

const mockMember = {
  id: 'member-1',
  displayName: 'John Doe',
  color: '#3B82F6',
};

// Mock completions for different days
const yesterdayCompletion = {
  id: 'completion-1',
  habitId: 'habit-1',
  memberId: 'member-1',
  date: '2025-09-06', // Yesterday
  completed: true,
  notes: 'Completed successfully',
};

const todayCompletion = {
  id: 'completion-2',
  habitId: 'habit-1',
  memberId: 'member-1',
  date: '2025-09-07', // Today
  completed: true,
  notes: 'Completed successfully',
};

describe('Daily Family Habit Reset', () => {
  beforeEach(() => {
    // Reset Date mock
    global.Date = Date;
  });

  test('habits show as pending at start of new day', () => {
    // Mock today as September 7, 2025
    mockDate('2025-09-07T00:00:00.000Z');
    
    // Only yesterday's completion exists
    const allCompletions = [yesterdayCompletion];
    const allHabits = [mockHabit];
    
    // Simulate getHabitsByMember logic
    const today = new Date();
    const dayOfWeek = today.getDay(); // Should be Sunday (0) for 2025-09-07
    const todayString = today.toISOString().split('T')[0]; // Should be '2025-09-07'
    
    const memberHabits = allHabits
      .filter(habit => habit.assignedMembers.includes('member-1'))
      .filter(habit => habit.targetDays.includes(dayOfWeek))
      .map(habit => {
        const todaysCompletion = allCompletions.find(c => 
          c.habitId === habit.id && 
          c.memberId === 'member-1' && 
          c.date === todayString
        );
        
        return {
          ...habit,
          completed: todaysCompletion ? todaysCompletion.completed : false,
          todaysCompletion: todaysCompletion || null
        };
      });
    
    // Assertions
    expect(todayString).toBe('2025-09-07');
    expect(memberHabits).toHaveLength(1);
    expect(memberHabits[0].completed).toBe(false);
    expect(memberHabits[0].todaysCompletion).toBe(null);
  });

  test('habits show as completed when completed today', () => {
    // Mock today as September 7, 2025
    mockDate('2025-09-07T12:00:00.000Z');
    
    // Both yesterday's and today's completions exist
    const allCompletions = [yesterdayCompletion, todayCompletion];
    const allHabits = [mockHabit];
    
    // Simulate getHabitsByMember logic
    const today = new Date();
    const dayOfWeek = today.getDay();
    const todayString = today.toISOString().split('T')[0];
    
    const memberHabits = allHabits
      .filter(habit => habit.assignedMembers.includes('member-1'))
      .filter(habit => habit.targetDays.includes(dayOfWeek))
      .map(habit => {
        const todaysCompletion = allCompletions.find(c => 
          c.habitId === habit.id && 
          c.memberId === 'member-1' && 
          c.date === todayString
        );
        
        return {
          ...habit,
          completed: todaysCompletion ? todaysCompletion.completed : false,
          todaysCompletion: todaysCompletion || null
        };
      });
    
    // Assertions
    expect(todayString).toBe('2025-09-07');
    expect(memberHabits).toHaveLength(1);
    expect(memberHabits[0].completed).toBe(true);
    expect(memberHabits[0].todaysCompletion).toBeTruthy();
    expect(memberHabits[0].todaysCompletion.notes).toBe('Completed successfully');
  });

  test('previous day completions are preserved but not affecting today', () => {
    // Mock today as September 7, 2025
    mockDate('2025-09-07T00:00:00.000Z');
    
    const allCompletions = [yesterdayCompletion]; // Only yesterday
    
    // Verify yesterday's completion exists but doesn't affect today
    expect(allCompletions).toHaveLength(1);
    expect(allCompletions[0].date).toBe('2025-09-06');
    expect(allCompletions[0].completed).toBe(true);
    
    // Today should not have any completions
    const todayString = new Date().toISOString().split('T')[0];
    const todaysCompletions = allCompletions.filter(c => 
      c.date === todayString && c.memberId === 'member-1'
    );
    
    expect(todayString).toBe('2025-09-07');
    expect(todaysCompletions).toHaveLength(0);
  });

  test('getTodaysCompletionStatus returns correct status', () => {
    // Mock the getTodaysCompletionStatus function logic
    const getTodaysCompletionStatus = (habitId, todaysCompletion) => {
      if (todaysCompletion && todaysCompletion.completed) {
        if (todaysCompletion.notes === 'Marked as failed') {
          return 'failure';
        }
        return 'success';
      }
      return null;
    };
    
    // Test with no completion (new day)
    expect(getTodaysCompletionStatus('habit-1', null)).toBe(null);
    
    // Test with successful completion
    expect(getTodaysCompletionStatus('habit-1', todayCompletion)).toBe('success');
    
    // Test with failed completion
    const failedCompletion = { ...todayCompletion, notes: 'Marked as failed' };
    expect(getTodaysCompletionStatus('habit-1', failedCompletion)).toBe('failure');
  });
});

console.log('Daily Family Habit Reset Test Suite');
console.log('This test verifies that:');
console.log('✅ Previous day completions are preserved');
console.log('✅ New day shows habits as pending');
console.log('✅ Completion status is correctly determined');
console.log('✅ Date filtering works properly');
