# HabitNex Custom Subagents

These custom AI subagents are specifically designed for the HabitNex project, understanding our codebase structure, patterns, and development workflow.

## 🎯 Habit Analytics Agent
**Trigger**: "analyze habits", "show analytics", "habit insights", "usage patterns"
**Purpose**: Deep analysis of habit completion patterns and user behavior

### Capabilities:
- Analyze completion patterns across time periods
- Identify habit success/failure correlations
- Generate insights on optimal habit scheduling
- Create custom analytics views and charts
- Calculate advanced metrics (momentum scores, consistency indices)
- Predict habit success likelihood based on historical data

### Context Awareness:
- Knows our Firestore data structure (`users/{userId}/habits`, `completions`, `moods`)
- Understands our existing analytics components and Recharts integration
- Familiar with our date/time utilities and calculation functions
- Can work with our existing hooks (`useHabits`, `useMoods`, etc.)

### Example Tasks:
```
"Analyze my habit completion patterns for the last month"
"Show me which habits have the best success rate"
"Create a correlation chart between mood and habit completion"
"Generate insights about my most productive times"
```

---

## 🎨 UI/UX Enhancement Agent
**Trigger**: "improve UI", "enhance UX", "redesign component", "better interface"
**Purpose**: Enhance user interface components with modern design patterns

### Capabilities:
- Implement advanced Tailwind CSS animations and transitions
- Create responsive, mobile-first designs
- Add micro-interactions and hover effects
- Implement skeleton loaders and loading states
- Design empty states and error boundaries
- Add accessibility features (ARIA labels, keyboard navigation)
- Create reusable component patterns

### Context Awareness:
- Knows our blue-based theme system and color palette
- Understands our component structure (`components/ui/`, `components/habits/`)
- Familiar with our existing animations (`fade-in-up`, `animate-expand`)
- Can maintain consistency with our gradient patterns and card designs

### Example Tasks:
```
"Add a smooth skeleton loader for habit cards"
"Create a confetti animation when completing all daily habits"
"Improve mobile responsiveness for the dashboard"
"Add keyboard shortcuts for quick habit completion"
```

---

## 🔥 Firebase Optimization Agent
**Trigger**: "optimize firebase", "improve queries", "database performance", "reduce reads"
**Purpose**: Optimize Firebase/Firestore operations for performance and cost

### Capabilities:
- Optimize Firestore queries with proper indexing
- Implement efficient data caching strategies
- Reduce unnecessary database reads/writes
- Set up real-time listeners efficiently
- Implement batch operations for bulk updates
- Create security rules that balance access and performance
- Set up data aggregation and denormalization strategies

### Context Awareness:
- Knows our Firestore collections structure and relationships
- Understands our security rules patterns
- Familiar with our Firebase configuration and indexes
- Can work with our existing `lib/db.ts` utilities
- Aware of our usage tracking and rate limiting needs

### Example Tasks:
```
"Optimize the habit loading query to reduce reads"
"Implement offline persistence for habits"
"Create a batch update for marking multiple habits complete"
"Set up efficient real-time sync for family shared habits"
```

---

## 🧪 Testing Automation Agent
**Trigger**: "write tests", "test feature", "e2e testing", "test coverage"
**Purpose**: Create comprehensive test suites using Playwright

### Capabilities:
- Write end-to-end tests for user workflows
- Create component unit tests
- Test authentication flows and protected routes
- Validate form submissions and data persistence
- Test responsive design across devices
- Check accessibility compliance
- Performance testing and monitoring
- Visual regression testing

### Context Awareness:
- Knows our Playwright configuration and test patterns
- Understands our authentication flow (Google OAuth)
- Familiar with our routing structure and protected routes
- Can test our Firebase operations and data flow
- Aware of our component props and state management

### Example Tasks:
```
"Write e2e tests for the habit creation flow"
"Test the mood tracking feature across different devices"
"Create tests for the family sharing functionality"
"Validate that habits persist correctly after completion"
```

---

## 🤖 AI Enhancement Agent
**Trigger**: "enhance AI", "improve Claude integration", "AI features", "smart suggestions"
**Purpose**: Enhance AI-powered features and Claude integration

### Capabilities:
- Optimize Claude API prompts for better responses
- Implement smart habit suggestions based on user data
- Create AI-powered habit insights and recommendations
- Add natural language habit creation
- Implement mood prediction and analysis
- Create AI coaching messages and motivational content
- Optimize token usage and API costs

### Context Awareness:
- Knows our Claude API integration (`/api/claude/*`)
- Understands our token limits and cost structure
- Familiar with our AI enhancement UI in `HabitForm`
- Can work with our usage tracking system
- Aware of our prompt templates and response parsing

### Example Tasks:
```
"Add AI-powered habit recommendations based on mood patterns"
"Create smart reminders that adapt to user behavior"
"Implement natural language processing for habit creation"
"Generate personalized motivational messages"
```

---

## 🚀 Performance Optimization Agent
**Trigger**: "optimize performance", "speed up", "reduce bundle", "improve loading"
**Purpose**: Optimize application performance and loading times

### Capabilities:
- Implement code splitting and lazy loading
- Optimize bundle size with tree shaking
- Add progressive web app features
- Implement service workers for offline support
- Optimize images and assets
- Add performance monitoring
- Reduce First Contentful Paint time
- Implement virtual scrolling for long lists

### Context Awareness:
- Knows our Next.js configuration and build setup
- Understands our current bundle structure
- Familiar with our static export settings
- Can work with our existing performance optimizations
- Aware of our Vercel deployment configuration

### Example Tasks:
```
"Implement lazy loading for the habit cards"
"Add a service worker for offline support"
"Optimize the bundle size by removing unused dependencies"
"Implement virtual scrolling for the habits list"
```

---

## 👨‍👩‍👧‍👦 Family Features Agent
**Trigger**: "family features", "shared habits", "family dashboard", "group tracking"
**Purpose**: Develop and enhance family/group collaboration features

### Capabilities:
- Implement shared habit tracking
- Create family leaderboards and competitions
- Add family member role management
- Build notification systems for family activities
- Create family analytics and reports
- Implement privacy controls for shared data
- Add family chat or comments on habits

### Context Awareness:
- Knows our family context and data structure
- Understands our `FamilyContext` and related components
- Familiar with our family creation/join flow
- Can work with our existing family UI components
- Aware of privacy and permission considerations

### Example Tasks:
```
"Create a family habit leaderboard"
"Add notifications when family members complete habits"
"Implement family challenges and competitions"
"Create a shared family calendar view"
```

---

## 🎮 Gamification Agent
**Trigger**: "add gamification", "achievement system", "rewards", "badges"
**Purpose**: Implement engaging gamification features

### Capabilities:
- Create achievement and badge systems
- Implement experience points and leveling
- Add streak rewards and milestones
- Create habit challenges and quests
- Build reward redemption systems
- Add social sharing capabilities
- Implement progress visualization

### Context Awareness:
- Knows our streak calculation logic
- Understands our completion rate metrics
- Familiar with our motivational UI elements
- Can work with our existing reward icons and animations
- Aware of our user preference system

### Example Tasks:
```
"Create an achievement system for habit milestones"
"Add XP and leveling based on completions"
"Implement special badges for streak achievements"
"Create seasonal challenges for habits"
```

---

## 📊 Data Migration Agent
**Trigger**: "migrate data", "update schema", "database migration", "bulk update"
**Purpose**: Handle database migrations and bulk data operations

### Capabilities:
- Create migration scripts for schema changes
- Perform bulk data updates safely
- Backup and restore data
- Transform data structures
- Validate data integrity
- Handle version migrations
- Create rollback procedures

### Context Awareness:
- Knows our current Firestore schema
- Understands our data relationships
- Familiar with our TypeScript types
- Can work with Firebase Admin SDK
- Aware of our data validation requirements

### Example Tasks:
```
"Migrate all habits to include a new category field"
"Bulk update completion dates to new format"
"Create a backup of all user data"
"Transform mood data to new 4-dimensional structure"
```

---

## 🔐 Security Enhancement Agent
**Trigger**: "security audit", "improve security", "add authentication", "protect data"
**Purpose**: Enhance security and privacy features

### Capabilities:
- Audit and improve security rules
- Implement data encryption
- Add multi-factor authentication
- Create audit logs
- Implement rate limiting
- Add GDPR compliance features
- Secure API endpoints
- Implement role-based access control

### Context Awareness:
- Knows our Firebase security rules
- Understands our authentication flow
- Familiar with our API structure
- Can work with our user permission system
- Aware of sensitive data handling requirements

### Example Tasks:
```
"Audit our Firebase security rules for vulnerabilities"
"Add two-factor authentication option"
"Implement audit logging for sensitive operations"
"Add GDPR-compliant data export/deletion"
```

---

## 📱 Mobile Optimization Agent
**Trigger**: "mobile optimize", "PWA features", "mobile app", "responsive design"
**Purpose**: Optimize for mobile devices and PWA capabilities

### Capabilities:
- Implement PWA manifest and icons
- Add install prompts and app-like features
- Optimize touch interactions
- Implement swipe gestures
- Add mobile-specific navigation
- Create offline-first features
- Optimize for various screen sizes
- Add native app capabilities

### Context Awareness:
- Knows our responsive design breakpoints
- Understands our mobile-first approach
- Familiar with our touch interaction patterns
- Can work with our existing PWA configuration
- Aware of mobile performance constraints

### Example Tasks:
```
"Add swipe to complete gesture for habits"
"Implement PWA install prompt"
"Optimize dashboard for mobile screens"
"Add pull-to-refresh functionality"
```

---

## 🛠️ DevOps Automation Agent
**Trigger**: "setup CI/CD", "deployment pipeline", "automate deploy", "github actions"
**Purpose**: Automate deployment and development workflows

### Capabilities:
- Create GitHub Actions workflows
- Set up automated testing pipelines
- Configure deployment strategies
- Implement automated backups
- Set up monitoring and alerts
- Create development environment scripts
- Automate dependency updates
- Implement rollback procedures

### Context Awareness:
- Knows our Vercel deployment setup
- Understands our Firebase configuration
- Familiar with our build process
- Can work with our environment variables
- Aware of our git workflow

### Example Tasks:
```
"Create GitHub Action for automated testing on PR"
"Set up automatic Firestore backups"
"Create staging environment deployment"
"Automate dependency security updates"
```

---

## How to Use These Agents

When you need help with a specific area, invoke the agent by mentioning its trigger words. For example:

```
"Hey, I need to analyze habits to find patterns in my completion rates"
→ Triggers Habit Analytics Agent

"Help me improve the UI with better loading animations"
→ Triggers UI/UX Enhancement Agent

"Optimize our Firebase queries to reduce costs"
→ Triggers Firebase Optimization Agent
```

Each agent has deep knowledge of our codebase structure, conventions, and existing implementations, allowing them to provide contextual, accurate assistance that maintains consistency with our project.

## Agent Collaboration

These agents can work together for complex tasks:
- **Analytics + UI/UX**: Create beautiful data visualizations
- **Firebase + Performance**: Optimize database queries for speed
- **Testing + Security**: Create security-focused test suites
- **AI + Gamification**: Create intelligent achievement recommendations

---

*Last Updated: September 2025*
*HabitNex Version: 1.0.0*