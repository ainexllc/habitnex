// Token-efficient prompts optimized for Claude Haiku

export const HABIT_ENHANCE_PROMPT = (habitName: string, tags?: string, existingHabits?: string[]) => `
Enhance this habit with detailed motivational information. Return JSON only, no explanation.

Habit: "${habitName}"
${tags ? `Tags: ${tags}` : ''}
${existingHabits?.length ? `Existing habits: ${existingHabits.join(', ')}` : ''}

Required JSON format:
{
  "description": "1 sentence, max 20 words",
  "healthBenefits": "2-3 sentences describing physical health improvements and benefits",
  "mentalBenefits": "2-3 sentences describing mental, emotional, and cognitive benefits", 
  "longTermBenefits": "2-3 sentences describing long-term life improvements and outcomes",
  "difficulty": "easy"|"medium"|"hard",
  "tip": "2-4 sentences with actionable strategies, timing advice, environmental setup, obstacle solutions, habit stacking ideas, and motivation techniques",
  "complementary": ["habit that pairs well", "another habit"]
}`;

export const QUICK_INSIGHT_PROMPT = (habitName: string, streak: number, completionRate: number) => `
Generate ONE motivational insight for this habit progress:

Habit: ${habitName}
Current streak: ${streak} days
Completion rate: ${completionRate}%

Return a single sentence of encouragement or advice (max 25 words). No JSON, just the message.`;

export const MOOD_ANALYSIS_PROMPT = (moodScores: number[], energyScores: number[], stressScores: number[]) => `
Analyze this mood pattern from last 7 days and return JSON only:

Mood (1-5): [${moodScores.join(', ')}]
Energy (1-5): [${energyScores.join(', ')}]
Stress (1-5): [${stressScores.join(', ')}]

Required JSON:
{
  "pattern": "improving"|"declining"|"stable"|"mixed",
  "insight": "main observation, max 20 words",
  "suggestion": "one actionable tip, max 15 words"
}`;

export const DAILY_MOTIVATION_PROMPT = (userName: string, todayHabits: Array<{name: string, completed: boolean, streak: number}>) => `
Create a brief daily motivation message for ${userName || 'user'}.

Today's habits:
${todayHabits.map(h => `- ${h.name}: ${h.completed ? '✓ Done' : '○ Pending'} (${h.streak} day streak)`).join('\n')}

Return one encouraging message (max 30 words) focusing on today's priority or celebrating progress.`;

export const HABIT_SUGGESTIONS_PROMPT = (userGoals: string[], currentHabits: string[], moodPatterns?: string) => `
Suggest 3 new habits based on user context. Return JSON only.

Current habits: [${currentHabits.join(', ')}]
Goals mentioned: [${userGoals.join(', ')}]
${moodPatterns ? `Recent mood trend: ${moodPatterns}` : ''}

Required JSON:
{
  "suggestions": [
    {
      "name": "habit name",
      "reason": "why this would help (max 20 words)",
      "difficulty": "easy"|"medium"|"hard",
      "impact": "high"|"medium"|"low"
    }
  ]
}`;

export const MOOD_PATTERN_ANALYSIS_PROMPT = (
  correlations: { mood: number; energy: number; stress: number; sleep: number },
  patterns: { highPerformanceDays: number; lowPerformanceDays: number },
  trends: { moodTrend: string; habitTrend: string },
  avgMoodScores: { mood: number; energy: number; stress: number; sleep: number },
  avgCompletionRate: number
) => `
Analyze this user's mood-habit correlation data and provide personalized insights. Return JSON only.

Correlations with habit completion:
- Mood: ${correlations.mood.toFixed(3)} (${Math.abs(correlations.mood) > 0.3 ? 'significant' : 'weak'})
- Energy: ${correlations.energy.toFixed(3)} (${Math.abs(correlations.energy) > 0.3 ? 'significant' : 'weak'})
- Stress: ${correlations.stress.toFixed(3)} (${Math.abs(correlations.stress) > 0.3 ? 'significant' : 'weak'})
- Sleep: ${correlations.sleep.toFixed(3)} (${Math.abs(correlations.sleep) > 0.3 ? 'significant' : 'weak'})

Performance:
- High performance days: ${patterns.highPerformanceDays}
- Low performance days: ${patterns.lowPerformanceDays}
- Average completion rate: ${avgCompletionRate.toFixed(1)}%

Recent trends:
- Mood trend: ${trends.moodTrend}
- Habit completion trend: ${trends.habitTrend}

Average mood scores (1-5 scale):
- Overall mood: ${avgMoodScores.mood.toFixed(1)}
- Energy: ${avgMoodScores.energy.toFixed(1)} 
- Stress: ${avgMoodScores.stress.toFixed(1)} (lower is better)
- Sleep quality: ${avgMoodScores.sleep.toFixed(1)}

Required JSON:
{
  "insight": "2-3 sentences summarizing the key finding about this person's mood-habit relationship",
  "primaryFactor": "mood"|"energy"|"stress"|"sleep",
  "recommendation": "specific actionable advice based on their strongest correlation (max 30 words)",
  "encouragement": "positive motivational message about their patterns and progress (max 25 words)"
}`;

// Pre-generated common habit enhancements to reduce API calls
export const COMMON_HABITS = {
  'meditation': {
    description: 'Daily mindfulness practice to reduce stress and improve focus',
    healthBenefits: 'Regular meditation reduces cortisol levels by up to 27%, lowering blood pressure and improving immune system function. It also helps regulate sleep patterns and reduces inflammation in the body.',
    mentalBenefits: 'Meditation significantly improves focus, attention span, and emotional regulation. Studies show it reduces anxiety and depression while increasing self-awareness and empathy towards others.',
    longTermBenefits: 'Long-term meditation practice leads to structural brain changes that enhance memory, creativity, and decision-making. It builds resilience against stress and creates lasting improvements in overall life satisfaction.',
    difficulty: 'easy',
    tip: 'Start with just 2 minutes using a guided app like Headspace',
    bestTime: 'morning',
    duration: '10',
    complementary: ['Journaling', 'Deep breathing']
  },
  'exercise': {
    description: 'Physical activity to boost energy, mood, and overall health',
    healthBenefits: 'Regular exercise strengthens your cardiovascular system, builds bone density, and improves muscle strength. It boosts metabolism, enhances immune function, and reduces risk of chronic diseases by up to 50%.',
    mentalBenefits: 'Exercise releases endorphins and BDNF, creating natural mood elevation and mental clarity. It reduces anxiety, improves self-confidence, and provides a healthy outlet for stress and frustration.',
    longTermBenefits: 'Consistent exercise adds years to your life while maintaining independence and mobility as you age. It creates sustainable energy levels, better sleep quality, and a positive relationship with your body.',
    difficulty: 'medium',
    tip: 'Start with 10-minute walks and gradually increase intensity',
    bestTime: 'morning',
    duration: '30',
    complementary: ['Healthy eating', 'Adequate sleep']
  },
  'reading': {
    description: 'Daily reading to expand knowledge and improve cognitive function',
    healthBenefits: 'Reading for just 6 minutes can reduce stress levels by 68%, lowering heart rate and muscle tension. It exercises your brain like a muscle, helping maintain cognitive function as you age.',
    mentalBenefits: 'Regular reading expands vocabulary, improves concentration, and enhances analytical thinking skills. It stimulates imagination, increases empathy by exposing you to different perspectives, and provides mental escape from daily stressors.',
    longTermBenefits: 'Lifelong readers show significantly reduced rates of cognitive decline and dementia. Reading creates a growth mindset, continuous learning habits, and opens doors to new opportunities and deeper conversations.',
    difficulty: 'easy',
    tip: 'Read for 10 minutes before bed instead of scrolling social media',
    bestTime: 'evening',
    duration: '20',
    complementary: ['Note-taking', 'Discussion groups']
  },
  'no sugar': {
    description: 'Eliminate added sugars to improve energy and reduce health risks',
    healthBenefits: 'Cutting sugar reduces inflammation, stabilizes blood glucose levels, and improves dental health. It leads to better weight management, reduced risk of diabetes, and improved heart health markers.',
    mentalBenefits: 'Eliminating sugar crashes creates stable energy throughout the day and improves mood consistency. It reduces brain fog, enhances focus, and breaks the cycle of sugar cravings and emotional eating.',
    longTermBenefits: 'Long-term sugar reduction significantly lowers risk of chronic diseases, maintains youthful skin appearance, and supports healthy aging. It creates sustainable eating habits and improved relationship with food.',
    difficulty: 'medium',
    tip: 'Replace sugary drinks with sparkling water and fruit',
    bestTime: 'morning',
    duration: '5',
    complementary: ['Healthy meal prep', 'Reading nutrition labels']
  },
  'water': {
    description: 'Drink adequate water throughout the day for optimal health',
    healthBenefits: 'Proper hydration improves kidney function, regulates body temperature, and supports healthy digestion. It maintains blood pressure, lubricates joints, and helps transport nutrients throughout your body.',
    mentalBenefits: 'Even mild dehydration can impair concentration, memory, and mood. Staying hydrated enhances mental clarity, reduces fatigue, and improves overall cognitive performance throughout the day.',
    longTermBenefits: 'Consistent hydration supports healthy aging, maintains skin elasticity, and prevents kidney stones. It creates sustainable energy levels and reduces risk of chronic health issues related to dehydration.',
    difficulty: 'easy',
    tip: 'Keep a water bottle visible on your desk as a reminder',
    bestTime: 'morning',
    duration: '1',
    complementary: ['Healthy eating', 'Morning routine']
  },
  'journaling': {
    description: 'Daily writing practice for self-reflection and mental clarity',
    healthBenefits: 'Journaling reduces stress hormones like cortisol, improves immune system function, and can help lower blood pressure. It also promotes better sleep quality and faster recovery from illness.',
    mentalBenefits: 'Writing thoughts and feelings reduces anxiety, improves emotional processing, and enhances self-awareness. It helps organize thoughts, process difficult experiences, and develop problem-solving skills.',
    longTermBenefits: 'Regular journaling creates a valuable record of personal growth and life patterns. It builds emotional intelligence, improves communication skills, and provides a healthy outlet for lifelong stress management.',
    difficulty: 'easy',
    tip: 'Write 3 sentences about your day every evening',
    bestTime: 'evening',
    duration: '10',
    complementary: ['Meditation', 'Gratitude practice']
  }
} as const;

export type CommonHabit = keyof typeof COMMON_HABITS;