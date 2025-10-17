# Custom AI Agents Guide

This project includes specialized AI agents that provide expert assistance for different aspects of development. Use simple trigger commands to activate specific expertise.

## Quick Start

Type `/agents` in Claude Code to view all available agents.

## Project-Specific Agents

These agents understand HabitNex's codebase and features:

### 🎯 Habit Analytics Expert
**Triggers**: `/analytics`, `analyze habits`, `habit insights`, `data analysis`

**Best for**:
- Analyzing habit completion patterns
- Creating data visualizations with Recharts
- Generating insights and recommendations
- Optimizing Firestore queries for analytics
- Building reports and summaries

**Example**:
```
/analytics - create a weekly summary showing completion rates by family member
```

---

### 👨‍👩‍👧‍👦 Family Features Specialist
**Triggers**: `/family`, `family features`, `shared habits`, `collaboration`

**Best for**:
- Building family collaboration features
- Implementing shared habit tracking
- Designing parent controls and permissions
- Creating family challenges
- Building appreciation and encouragement systems

**Example**:
```
/family - add a feature where parents can assign weekly chores to kids
```

---

### 🎮 Gamification Designer
**Triggers**: `/gamify`, `add rewards`, `achievements`, `streaks`, `badges`

**Best for**:
- Designing reward systems
- Creating achievement mechanics
- Building leaderboards
- Implementing streak tracking
- Adding motivational features

**Example**:
```
/gamify - create a badge system for 30-day habit streaks
```

---

### 🤖 AI Enhancement Expert
**Triggers**: `/ai`, `claude integration`, `ai features`, `enhance ai`

**Best for**:
- Improving Claude AI integration
- Optimizing prompts for better results
- Adding new AI-powered features
- Reducing API costs
- Implementing personalized insights

**Example**:
```
/ai - optimize the habit enhancement prompt to reduce token usage
```

---

## Global Agents

These agents work across all your projects:

### ⚡ Next.js Expert
**Triggers**: `/nextjs`, `app router`, `server components`

Expert in Next.js 14+ App Router, server components, data fetching, and optimization.

---

### 🔥 Firebase Master
**Triggers**: `/firebase`, `firestore`, `firebase auth`, `security rules`

Expert in Firestore, Authentication, Security Rules, Hosting, and Cloud Functions.

---

### 🎨 Tailwind CSS Designer
**Triggers**: `/tailwind`, `styling`, `design system`, `dark mode`

Expert in Tailwind CSS, design systems, theming, and responsive design.

---

### 📘 TypeScript Expert
**Triggers**: `/typescript`, `/ts`, `type safety`, `interfaces`

Expert in TypeScript type systems, generics, and advanced patterns.

---

### 🚀 Performance Optimizer
**Triggers**: `/optimize`, `/performance`, `speed up`, `bundle size`

Expert in Core Web Vitals, bundle optimization, and performance improvements.

---

### 🧪 Testing Expert
**Triggers**: `/test`, `/testing`, `playwright`, `e2e tests`

Expert in Playwright E2E testing, unit tests, and integration testing.

---

## How to Use

### 1. View All Agents
```
/agents
```

### 2. Activate an Agent
Include the trigger word in your message:
```
/analytics - show me habit completion trends for the last month
```

### 3. Combine Multiple Agents
For complex tasks:
```
I need help with /firebase security rules and /typescript types for a new feature
```

### 4. Ask Follow-up Questions
Agents maintain context through the conversation:
```
/gamify - create a points system
[agent responds]
Now add weekly leaderboards that reset on Sundays
```

## Tips for Best Results

1. **Be Specific**: Provide context and requirements
   ```
   Good: /analytics - create a calendar heatmap showing habit completions with streak highlights
   Okay: /analytics - show completions
   ```

2. **Share Existing Code**: Show what you're working with
   ```
   /tailwind - style this button component [paste code]
   ```

3. **Ask for Explanations**: Understand the "why"
   ```
   /firebase - why did you structure the security rules this way?
   ```

4. **Iterate**: Refine solutions progressively
   ```
   /nextjs - convert this to a server component
   [reviews suggestion]
   Now add loading and error states
   ```

## Agent Locations

- **Project Agents**: `.claude/agents/` (committed to repo)
- **Global Agents**: `~/.claude/agents/` (local only)
- **Commands**: `.claude/commands/` and `~/.claude/commands/`

## Creating New Agents

Want to add a custom agent? Create a new `.md` file:

```markdown
# Agent Name

**Trigger**: `/trigger`, `keywords`

## Purpose
What this agent specializes in

## Capabilities
- What it can do
- Specific expertise
- Common use cases

## Example Tasks
Show how to use the agent

## Best Practices
Key principles and tips
```

Save to:
- `.claude/agents/` for project-specific agents
- `~/.claude/agents/` for personal global agents

## Troubleshooting

**Agent not responding?**
- Check trigger word spelling
- Try alternative triggers listed in agent file
- Use `/agents` to verify agent exists

**Need different expertise?**
- Check if a global agent can help
- Create a custom agent for your specific needs
- Combine multiple agents for complex tasks

---

**Pro Tip**: Agents work best when you provide clear context, specific requirements, and iterate on solutions. Don't hesitate to ask follow-up questions or request alternatives!
