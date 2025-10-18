/**
 * Grok AI Integration for HabitNex
 *
 * This module provides integration with xAI's Grok API for AI-powered features.
 * Grok is used alongside Claude for enhanced habit insights and recommendations.
 */

interface GrokMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GrokResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface GrokRequestOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

/**
 * Call Grok API with messages
 */
export async function callGrokAPI(
  messages: GrokMessage[],
  options: GrokRequestOptions = {}
): Promise<GrokResponse> {
  const apiKey = process.env.XAI_API_KEY;
  const baseURL = process.env.XAI_API_BASE_URL || 'https://api.x.ai/v1';
  const model = options.model || process.env.XAI_MODEL || 'grok-2-1212';

  if (!apiKey) {
    throw new Error('XAI_API_KEY environment variable is not set');
  }

  const response = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 1000,
      stream: options.stream ?? false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Grok API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Generate habit insights using Grok
 */
export async function generateHabitInsight(
  habitName: string,
  completionHistory: boolean[],
  context?: string
): Promise<string> {
  const messages: GrokMessage[] = [
    {
      role: 'system',
      content: 'You are an expert habit coach helping users understand their habit patterns and stay motivated. Provide concise, actionable insights.',
    },
    {
      role: 'user',
      content: `Analyze this habit: "${habitName}"

Recent completion history: ${completionHistory.map(c => c ? '✓' : '✗').join(' ')}
${context ? `Additional context: ${context}` : ''}

Provide a brief, encouraging insight (2-3 sentences) about their progress and one specific tip to improve consistency.`,
    },
  ];

  const response = await callGrokAPI(messages, {
    temperature: 0.8,
    max_tokens: 150,
  });

  return response.choices[0]?.message?.content || 'Keep up the great work!';
}

/**
 * Generate personalized habit recommendations using Grok
 */
export async function generateHabitRecommendations(
  existingHabits: string[],
  userGoals?: string
): Promise<string[]> {
  const messages: GrokMessage[] = [
    {
      role: 'system',
      content: 'You are a habit formation expert. Suggest complementary habits that work well together and support user goals.',
    },
    {
      role: 'user',
      content: `Current habits: ${existingHabits.join(', ')}
${userGoals ? `User goals: ${userGoals}` : ''}

Suggest 3 new habits that complement their existing routine. Format: Return ONLY a JSON array of habit names, like: ["Habit 1", "Habit 2", "Habit 3"]`,
    },
  ];

  const response = await callGrokAPI(messages, {
    temperature: 0.9,
    max_tokens: 200,
  });

  const content = response.choices[0]?.message?.content || '[]';

  try {
    // Extract JSON array from response
    const jsonMatch = content.match(/\[.*\]/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Failed to parse habit recommendations:', error);
  }

  return [];
}

/**
 * Enhance habit description with motivational content using Grok
 */
export async function enhanceHabitDescription(
  habitTitle: string,
  currentDescription?: string
): Promise<{
  description: string;
  benefits: string[];
  tips: string[];
}> {
  const messages: GrokMessage[] = [
    {
      role: 'system',
      content: 'You are a wellness expert creating engaging habit descriptions. Be concise but inspiring.',
    },
    {
      role: 'user',
      content: `Create an enhanced description for this habit: "${habitTitle}"
${currentDescription ? `Current description: ${currentDescription}` : ''}

Return a JSON object with:
- description: A compelling 1-2 sentence description
- benefits: Array of 3 key benefits (short phrases)
- tips: Array of 2 practical tips for success (short phrases)

Format: {"description": "...", "benefits": ["...", "...", "..."], "tips": ["...", "..."]}`,
    },
  ];

  const response = await callGrokAPI(messages, {
    temperature: 0.8,
    max_tokens: 300,
  });

  const content = response.choices[0]?.message?.content || '{}';

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Failed to parse enhanced description:', error);
  }

  return {
    description: currentDescription || habitTitle,
    benefits: [],
    tips: [],
  };
}

/**
 * Generate family challenge ideas using Grok
 */
export async function generateFamilyChallenge(
  familyHabits: string[],
  familySize: number
): Promise<{
  title: string;
  description: string;
  goal: string;
  duration: number;
}> {
  const messages: GrokMessage[] = [
    {
      role: 'system',
      content: 'You are a family wellness coach creating fun, achievable challenges that bring families together.',
    },
    {
      role: 'user',
      content: `Create a family challenge for ${familySize} people with these habits: ${familyHabits.join(', ')}

Return a JSON object:
{
  "title": "Short, catchy challenge name",
  "description": "2-3 sentences explaining the challenge",
  "goal": "Specific, measurable goal",
  "duration": 7 or 14 or 30 (days)
}`,
    },
  ];

  const response = await callGrokAPI(messages, {
    temperature: 0.9,
    max_tokens: 250,
  });

  const content = response.choices[0]?.message?.content || '{}';

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Failed to parse family challenge:', error);
  }

  return {
    title: 'Family Habit Challenge',
    description: 'Work together to build healthy habits!',
    goal: 'Complete habits together for 7 days',
    duration: 7,
  };
}

export default {
  callGrokAPI,
  generateHabitInsight,
  generateHabitRecommendations,
  enhanceHabitDescription,
  generateFamilyChallenge,
};
