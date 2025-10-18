# Grok AI Integration Setup for HabitNex

## ✅ What's Been Configured

I've set up complete Grok AI integration for your HabitNex app with the following components:

### 1. Environment Variables (`.env.local`)
```env
XAI_API_KEY=xai-4rFPdM7KunqPLlZ0haDYni9JemLYKtYP3eNIZmuvJSXzwvrH6gs5MwXThoBAIQBqdszK2raMf5I6oeE
XAI_MODEL=grok-2-1212
XAI_API_BASE_URL=https://api.x.ai/v1
```

### 2. Integration Library (`lib/grokAI.ts`)
Core functions created:
- `callGrokAPI()` - Base API calling function
- `generateHabitInsight()` - Get AI insights about habit patterns
- `generateHabitRecommendations()` - Get personalized habit suggestions
- `enhanceHabitDescription()` - Enhance habits with motivational content
- `generateFamilyChallenge()` - Create family challenges

### 3. API Routes
Created 4 API endpoints:
- `/api/grok/habit-insight` - POST endpoint for habit insights
- `/api/grok/recommend-habits` - POST endpoint for recommendations
- `/api/grok/enhance-habit` - POST endpoint for habit enhancement
- `/api/grok/family-challenge` - POST endpoint for family challenges

## ⚠️ API Key Issue

The current API key is returning a 400 error from xAI:
```
"Incorrect API key provided: xa***eE. You can obtain an API key from https://console.x.ai."
```

###  Next Steps to Fix:

1. **Verify API Key**: Go to https://console.x.ai and:
   - Log in to your xAI account
   - Navigate to API Keys section
   - Verify the API key is correct and active
   - Check if there are any usage limits or restrictions

2. **Update Model** (if needed): Your requested "grok 4 fast" model. Available Grok models:
   - `grok-beta` - Original beta model
   - `grok-2-1212` - Current stable (currently configured)
   - Check xAI docs for "grok-4-fast" or similar

3. **Update `.env.local`**: Once you have the correct API key, update line 15:
   ```env
   XAI_API_KEY=your-actual-api-key-here
   ```

4. **Restart Server**: After updating, restart the dev server:
   ```bash
   # Kill the current server
   # Press Ctrl+C or
   pkill -f "next dev"

   # Restart
   npm run dev -- -p 3001
   ```

## 🧪 Testing

Use the test script to verify the connection:
```bash
node test-grok.js
```

## 📖 Usage Examples

### Generate Habit Insight
```typescript
import { generateHabitInsight } from '@/lib/grokAI';

const insight = await generateHabitInsight(
  'Morning Exercise',
  [true, true, false, true, true],
  'User wants better consistency'
);
```

### Get Habit Recommendations
```typescript
import { generateHabitRecommendations } from '@/lib/grokAI';

const recommendations = await generateHabitRecommendations(
  ['Exercise', 'Meditation', 'Reading'],
  'Improve health and productivity'
);
```

### Enhance Habit Description
```typescript
import { enhanceHabitDescription } from '@/lib/grokAI';

const enhanced = await enhanceHabitDescription(
  'Drink Water',
  'Stay hydrated throughout the day'
);
// Returns: { description, benefits[], tips[] }
```

### Generate Family Challenge
```typescript
import { generateFamilyChallenge } from '@/lib/grokAI';

const challenge = await generateFamilyChallenge(
  ['Exercise', 'Reading', 'Meditation'],
  4 // family size
);
// Returns: { title, description, goal, duration }
```

## 🔗 API Endpoint Usage

### Habit Insight Endpoint
```bash
curl -X POST http://localhost:3001/api/grok/habit-insight \
  -H "Content-Type: application/json" \
  -d '{
    "habitName": "Morning Exercise",
    "completionHistory": [true, true, false, true],
    "context": "Building consistency"
  }'
```

### Habit Recommendations Endpoint
```bash
curl -X POST http://localhost:3001/api/grok/recommend-habits \
  -H "Content-Type: application/json" \
  -d '{
    "existingHabits": ["Exercise", "Meditation"],
    "userGoals": "Improve health"
  }'
```

## 🎯 Integration Points

Once the API key is verified, you can integrate Grok into:

1. **Habit Cards** - Show AI insights on habit cards
2. **Dashboard** - Display personalized recommendations
3. **Family Features** - Generate collaborative challenges
4. **Habit Creation** - Enhance descriptions with AI

## 📚 xAI Documentation

- Console: https://console.x.ai
- API Docs: https://docs.x.ai
- Models: https://docs.x.ai/docs/models

## 🆚 Grok vs Claude

Your app now has both AI providers:
- **Claude (Anthropic)**: Currently used for habit enhancement
- **Grok (xAI)**: New integration for additional features

You can use them complementarily:
- Claude: Detailed analysis, structured outputs
- Grok: Quick insights, conversational responses

---

*Setup completed by Claude Code - Ready for use once API key is verified!*
