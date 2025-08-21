import Anthropic from '@anthropic-ai/sdk';

// Optional Claude client initialization
export const anthropic = process.env.ANTHROPIC_API_KEY 
  ? new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  : null;

// Check if AI features are available
export const isAIEnabled = (): boolean => {
  return !!process.env.ANTHROPIC_API_KEY && !!anthropic;
};

// Cost-effective model configuration
export const AI_CONFIG = {
  model: 'claude-3-haiku-20240307',
  maxTokens: 300, // Keep responses concise for cost control
  temperature: 0.3, // Lower temperature for consistent, practical responses
} as const;

// Token cost tracking (per 1M tokens)
export const TOKEN_COSTS = {
  input: 0.25,  // $0.25 per 1M input tokens
  output: 1.25, // $1.25 per 1M output tokens
} as const;

// Calculate cost for a request
export function calculateCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1_000_000) * TOKEN_COSTS.input;
  const outputCost = (outputTokens / 1_000_000) * TOKEN_COSTS.output;
  return inputCost + outputCost;
}

// Rate limiting configuration
export const RATE_LIMITS = {
  free: 10,      // 10 AI requests per day
  pro: 100,      // 100 AI requests per day
  unlimited: -1, // Unlimited requests
} as const;

export type UserTier = keyof typeof RATE_LIMITS;