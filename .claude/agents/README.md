# HabitNex Custom Agents

Custom AI agents specialized for HabitNex development. Use trigger commands to activate specific expertise.

## Project-Specific Agents

### 🎯 Habit Analytics Expert
**Trigger**: `/analytics`, `analyze habits`, `habit insights`
**Purpose**: Analyze habit data, create visualizations, generate insights
**Expertise**: Recharts, statistics, Firestore queries, trend analysis

### 👨‍👩‍👧‍👦 Family Features Specialist
**Trigger**: `/family`, `family features`, `shared habits`
**Purpose**: Build family collaboration, shared tracking, multi-member features
**Expertise**: RBAC, real-time sync, family data models, parent controls

### 🎮 Gamification Designer
**Trigger**: `/gamify`, `add rewards`, `achievements`, `streaks`
**Purpose**: Design reward systems, achievements, badges, leaderboards
**Expertise**: Motivation systems, progress tracking, friendly competition

### 🤖 AI Enhancement Expert
**Trigger**: `/ai`, `claude integration`, `ai features`
**Purpose**: Integrate Claude AI, optimize prompts, personalized insights
**Expertise**: Claude API, prompt engineering, cost optimization, AI UX

## Global Agents (All Projects)

### ⚡ Next.js Expert
**Trigger**: `/nextjs`, `app router`, `server components`
**Purpose**: Next.js App Router, routing, optimization, deployment
**Files**: `~/.claude/agents/nextjs-expert.md`

### 🔥 Firebase Master
**Trigger**: `/firebase`, `firestore`, `firebase auth`
**Purpose**: Firestore, Authentication, Security Rules, Cloud Functions
**Files**: `~/.claude/agents/firebase-master.md`

### 🎨 Tailwind CSS Designer
**Trigger**: `/tailwind`, `styling`, `design system`
**Purpose**: Design systems, theming, dark mode, responsive design
**Files**: `~/.claude/agents/tailwind-designer.md`

### 📘 TypeScript Expert
**Trigger**: `/typescript`, `/ts`, `type safety`
**Purpose**: Type systems, interfaces, generics, type-safe development
**Files**: `~/.claude/agents/typescript-expert.md`

### 🚀 Performance Optimizer
**Trigger**: `/optimize`, `/performance`, `speed up`
**Purpose**: Core Web Vitals, bundle optimization, performance tuning
**Files**: `~/.claude/agents/performance-optimizer.md`

### 🧪 Testing Expert
**Trigger**: `/test`, `/testing`, `playwright`, `e2e tests`
**Purpose**: Playwright E2E, unit tests, integration tests, TDD
**Files**: `~/.claude/agents/testing-expert.md`

## How to Use

1. **Type the trigger** in your message to activate an agent
   ```
   /analytics - help me understand habit completion patterns
   ```

2. **Ask specific questions** related to the agent's expertise
   ```
   /gamify - create a badge system for 7-day streaks
   ```

3. **Request implementations** within the agent's domain
   ```
   /family - build a family leaderboard with weekly resets
   ```

## Adding New Agents

Create a new `.md` file in:
- `.claude/agents/` for project-specific agents
- `~/.claude/agents/` for global agents

Include:
- Trigger keywords
- Purpose statement
- Capabilities list
- Example tasks
- Technical stack
- Best practices

## Tips

- Agents provide specialized expertise but work together
- You can combine multiple agents in complex tasks
- Agents understand the codebase context
- They follow project best practices automatically
- Check agent files for detailed capabilities
