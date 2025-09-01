# Claude Code Memory File

This file contains important configuration and setup information for this project and development environment.

## Project Overview
- **Project Name**: NextVibe - Habit & Mood Tracking App
- **Repository**: https://github.com/ainexllc/nextvibe
- **Technology Stack**: Next.js 14.2.31, TypeScript 5.9.2, Firebase 12.1.0, Tailwind CSS 3.4.17, Recharts 3.1.2
- **Features**: Habit tracking, mood tracking, AI-enhanced habits, analytics, dark/light mode
- **Current Status**: ✅ Production ready with enhanced AI features and improved UX

## GitHub CLI Configuration
- **Version**: gh version 2.76.1 (2025-07-23)
- **Account**: buitwai
- **Authentication**: Active (keyring)
- **Protocol**: HTTPS
- **Token Scopes**: 'gist', 'read:org', 'repo', 'workflow'
- **Config Location**: ~/.config/gh/

### Git Authentication Setup
- **Solution**: GitHub CLI integrated authentication
- **Authentication**: Uses `gh auth login` + `gh auth setup-git`
- **Remote URL**: Standard GitHub HTTPS URL
- **Credential Helper**: osxkeychain (configured by GitHub CLI)
- **User**: buitwai (dinohorn35@gmail.com)
- **Status**: ✅ No password prompts required
- **Setup Commands**: 
  - `gh auth login` (already completed)
  - `gh auth setup-git` (configures git to use GH CLI auth)
  - This is the recommended approach for seamless authentication

### Available Repositories
- ainexllc/nexttask (private)
- ainexllc/nextvibe (public) - **Current Project** (formerly habittracker-nextjs)
- ainexllc/homekeep (private)
- ainexllc/journal (private)
- ainexllc/ainex (private)

## Development Commands
### Firebase
- `npm run firebase:rules` - Deploy Firestore rules
- `npm run firebase:indexes` - Deploy Firestore indexes  
- `npm run firebase:deploy` - Deploy both rules and indexes
- `firebase deploy --only firestore:rules` - Deploy rules directly
- `firebase deploy --only firestore:indexes` - Deploy indexes directly

### Build & Deploy
- `npm run dev` - Development server
- `npm run dev:safe` - Safe development with scripts
- `npm run dev:clean` - Clean cache and start dev server
- `npm run build` - Production build (static export)
- `npm run start` - Start production server
- `npm run lint` - ESLint checking (currently has config issues)
- `npm run test` - Run Playwright tests
- `npm run deploy` - Build and deploy to Firebase hosting

### Git Workflow
- All commits should include the signature:
  ```
  🤖 Generated with [Claude Code](https://claude.ai/code)
  
  Co-Authored-By: Claude <noreply@anthropic.com>
  ```

## Firebase Configuration
- **Project ID**: habittracker-eb6bd
- **Database**: Firestore
- **Authentication**: Email/Password + Google Sign-in ✅ FULLY CONFIGURED
- **Production URL**: https://habittracker-eb6bd.web.app
- **Collections**:
  - users/{userId}/habits (habit definitions with AI enhancements)
  - users/{userId}/completions (daily habit completions)
  - users/{userId}/moods (4-dimensional mood tracking)
  - users/{userId}/usage (AI usage tracking and rate limiting)

### Google Authentication Complete Setup
- **Status**: ✅ FULLY WORKING - Local & Production
- **OAuth Client ID**: 324797617648-prrbq679kjb59vfg59purusqi8474qu5.apps.googleusercontent.com
- **Local Method**: Popup (works immediately, no CORS issues)
- **Production Method**: Redirect (better for mobile, SEO-friendly)
- **Authorized Domains**: localhost, habittracker-eb6bd.firebaseapp.com, nextvibe.app
- **Redirect URIs**:
  - http://localhost:3000/__/auth/handler (default Next.js port)
  - https://habittracker-eb6bd.firebaseapp.com/__/auth/handler
  - https://nextvibe.app/__/auth/handler

#### Key Implementation Files
- **Authentication**: `lib/auth.ts`, `contexts/AuthContext.tsx`
- **Form Components**: `components/forms/HabitForm.tsx` (enhanced with AI)
- **UI Components**: `components/ui/Input.tsx` (improved focus states)
- **AI Integration**: `hooks/useClaudeAI.ts`, `app/api/claude/*`
- **Styling**: Enhanced form focus states in `app/globals.css`

## AI Enhancement Features

### Claude AI Integration
- **Status**: ✅ FULLY OPERATIONAL
- **Model**: Claude 3 Haiku (claude-3-haiku-20240307)
- **Token Limit**: 800 tokens (increased for comprehensive responses)
- **Cost Tracking**: $0.25/1M input, $1.25/1M output tokens
- **Rate Limiting**: Implemented per user tier

### AI Capabilities
1. **Habit Enhancement** (`/api/claude/enhance-habit`):
   - Auto-generates optimized habit titles and descriptions
   - Provides detailed health, mental, and long-term benefits (4-5 sentences each)
   - Comprehensive success strategies with 6-8 sentence guides
   - Suggests complementary habits
   - Form auto-population with AI-generated content

2. **Error Handling & Reliability**:
   - JSON truncation detection and recovery
   - Comprehensive field validation
   - User-friendly error messages
   - Graceful fallbacks when AI is unavailable

3. **Usage Tracking** (`/hooks/useUsageTracking.ts`):
   - Per-user request counting
   - Cost calculation and monitoring
   - Rate limiting enforcement
   - Analytics and usage patterns

### AI Enhancement Implementation
- **Frontend**: `components/forms/HabitForm.tsx` with AI enhance button
- **Hook**: `hooks/useClaudeAI.ts` for API integration
- **API**: `app/api/claude/enhance-habit/route.ts` (simplified, no telemetry)
- **Types**: `types/claude.ts` with comprehensive interfaces
- **Prompts**: `lib/claude/prompts.ts` with detailed enhancement templates

### Deployment Configuration
- **Next.js Config**: Standard build (no static export, API routes enabled)
- **Firebase Hosting**: Configured in `firebase.json` with SPA rewrites
- **Build Command**: `npm run build`
- **Deploy Command**: `npm run deploy` or `firebase deploy --only hosting`
- **Current Config**: TypeScript and ESLint checking disabled during builds
- **Production URLs**: 
  - Firebase: https://habittracker-eb6bd.web.app
  - Vercel: https://nextvibe.app (auto-deployment enabled)

## Recent Implementation Notes (Current State)
- ✅ **Enhanced AI Features** with Claude Haiku integration
- ✅ **Fixed AI Enhancement System** with 800-token limit and comprehensive responses
- ✅ **Improved Form UX** with enhanced focus states and visual feedback
- ✅ **Auto-population of habit fields** from AI enhancement (title, description)
- ✅ **Robust Error Handling** for AI responses with truncation detection
- ✅ **Production Deployment** to Firebase Hosting and Vercel
- ✅ **Complete Google Authentication** with popup/redirect hybrid approach
- ✅ **Comprehensive mood tracking** with 4-dimensional ratings
- ✅ **White screen issues resolved** with improved build configuration
- ✅ **OpenTelemetry issues fixed** by removing from API routes
- ✅ **Enhanced form UX** with prominent focus states, hover effects, and visual feedback
- ✅ **Comprehensive testing** with Playwright integration
- ✅ **Development workflow** optimized with safe restart scripts

## System Environment
- **OS**: macOS (Darwin 25.0.0)
- **Node.js**: Check with `node --version`
- **NPM**: Check with `npm --version`
- **Working Directory**: /Users/dino/AiFirst/nextvibeapp

## Claude Configuration
- **Config Location**: ~/.config/claude/
- **Hooks**: user-prompt-submit.py (disabled)

## MCP Servers Configuration

### Playwright Testing Integration
- **Status**: ✅ Configured and operational
- **Package**: @playwright/test (version 1.54.2)
- **Purpose**: End-to-end testing and automation
- **Test Scripts**:
  - `npm run test` - Run all tests
  - `npm run test:headed` - Run with browser UI
  - `npm run test:ui` - Interactive test runner
  - `npm run test:diagnose` - White screen diagnosis
- **Test Coverage**:
  - Authentication flows
  - Page rendering validation
  - Form interactions
  - AI feature testing
  - Form automation and testing
  - UI testing and validation
  - Performance testing

### Firebase MCP Server
- **Status**: ✅ Active and configured
- **Package**: firebase-tools experimental MCP
- **Version**: Firebase CLI 14.11.2
- **Purpose**: Firebase project management integration
- **Project Context**: This directory (/Users/dino/AiFirst/claudecode-realtest)
- **Capabilities**:
  - Firestore database operations (read/write/query)
  - Authentication management (users, providers)
  - Security rules deployment and testing
  - Firebase Functions deployment
  - Project configuration management
  - Real-time database operations

#### Firebase MCP Usage Examples
```bash
# Use Claude Code to:
# - Enable/disable authentication providers
# - Query Firestore collections
# - Deploy security rules
# - Manage user accounts
# - Configure Firebase services
```

## CLI Tools Integration

### GitHub CLI (gh)
- **Status**: ✅ Authenticated and active
- **Version**: 2.76.1
- **Account**: buitwai
- **Integration**: Seamless git operations, PR management, repository access
- **Usage**: Repository management, issue tracking, PR operations

### Firebase CLI
- **Status**: ✅ Authenticated and active
- **Version**: 14.11.2
- **Project**: habittracker-eb6bd
- **Integration**: Project deployment, rules management, emulator testing
- **Usage**: Deploy functions, update rules, manage hosting

### Google Cloud CLI (gcloud)
- **Status**: ✅ Installed and authenticated
- **Version**: Google Cloud SDK 534.0.0
- **Account**: dinohorn35@gmail.com
- **Project**: habittracker-eb6bd (same as Firebase)
- **Components**: gcloud, bq, gsutil, gcloud-crc32c
- **Integration**: Full Google Cloud Platform access
- **Capabilities**:
  - BigQuery data operations (`bq` command)
  - Cloud Storage management (`gsutil` command)
  - App Engine deployment
  - Cloud Functions management
  - Cloud Run deployment
  - Resource monitoring and logging

#### Google Cloud Services Available
- **Firebase Services**: Firestore, Auth, Hosting, Functions
- **BigQuery**: Data warehouse and analytics
- **Cloud Storage**: File storage and CDN
- **Cloud Logging**: Application and system logs
- **Cloud Monitoring**: Performance and uptime monitoring
- **Pub/Sub**: Messaging and event streaming
- **Cloud SQL**: Managed PostgreSQL/MySQL
- **App Engine**: Serverless web application hosting

### Gemini CLI
- **Status**: ✅ Available
- **Version**: @google/gemini-cli@0.1.16
- **Purpose**: Google Gemini AI model integration
- **Usage**: Alternative AI assistance and specialized tasks

## Claude Code Tool Permissions
- **bash**: Command execution and system operations
- **edit**: File editing and modifications
- **glob**: File pattern matching and search
- **grep**: Text search across codebase
- **ls**: Directory listing and file exploration
- **read**: File content reading
- **write**: File creation and content writing

## Integration Workflow
When working on this project, Claude Code can:
1. **Use Firebase MCP** to manage database, auth, and deployment
2. **Use GitHub CLI** for repository operations and PR management
3. **Use Google Cloud CLI** for advanced cloud operations and analytics
4. **Use Playwright MCP** for browser testing and automation
5. **Use built-in tools** for code editing and file management

## Recommended Usage Patterns
- **Database operations**: Use Firebase MCP for Firestore queries and updates
- **Authentication**: Use Firebase MCP to manage auth providers and users
- **Repository management**: Use GitHub CLI for commits, PRs, and issues
- **Cloud resources**: Use Google Cloud CLI for advanced GCP features
- **Testing**: Use Playwright MCP for browser automation and testing
- **Analytics**: Use BigQuery via gcloud/bq for advanced data analysis

## Notes for Continuation
- Firebase rules and indexes are up to date
- All mood tracking functionality is complete and tested
- Repository is fully synchronized with remote
- Project passes TypeScript compilation
- Ready for continued development on any machine

## ⚠️ CRITICAL: Vercel Auto-Deployment
**IMPORTANT**: This Next.js project is connected to Vercel with automatic deployment enabled. Any updates to the main branch (through direct commits or merged PRs) will trigger an automatic production deployment to Vercel.

**Requirements for ALL commits to main branch:**
- ✅ Code MUST build successfully (`npm run build` passes)
- ✅ TypeScript compilation MUST complete without errors
- ✅ No breaking changes that would cause Vercel build failures
- ✅ All environment variables and dependencies properly configured
- ✅ Static export compatibility maintained for deployment

**Before pushing to main:**
1. Run `npm run build` locally to verify successful build
2. Check TypeScript compilation with no errors
3. Test critical functionality to ensure no breaking changes
4. Verify all imports and dependencies are correctly resolved

**Vercel will automatically:**
- Build the project using `npm run build`
- Deploy to production URL if build succeeds
- Show build errors in Vercel dashboard if build fails
- Send notifications about deployment status

**If deployment fails:**
- Check Vercel dashboard for build error details
- Fix errors locally and test with `npm run build`
- Push fix to main branch to trigger new deployment attempt

## Vercel CLI Configuration
**Status**: ✅ Configured and Connected

**Project Details:**
- **Project ID**: prj_Q5kEz6FMiQI0Tq4GgBICYrlWqnu9
- **Project Name**: nextvibe (Vercel project name)
- **Production URL**: https://nextvibe.app
- **Repository**: https://github.com/ainexllc/nextvibe
- **Vercel CLI Version**: 46.0.2
- **Account**: dinohorn35@gmail.com (GitHub authenticated)
- **Organization**: team_lNWTMcQWMnIRjyREXHHLAcbr

**Useful Commands:**
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel project ls

# View build logs
vercel inspect <deployment-url> --logs

# Link project (already done)
vercel link --yes

# View project settings
vercel project

# Roll back to previous deployment
vercel rollback <deployment-url>

# Set environment variables
vercel env add [name]

# Pull environment variables
vercel env pull
```

**Auto-Deployment Setup:**
- ✅ GitHub repository connected to Vercel
- ✅ Auto-deployment enabled on main branch pushes
- ✅ Preview deployments created for PRs
- ✅ Build settings auto-detected (Next.js)
- ✅ Node.js 22.x runtime configured

## Custom Claude Code Agents

These agents provide specialized expertise for this project and can be referenced for similar implementations in other projects.

### 🔐 Firebase Auth Master Agent
- **Purpose**: Implement complete Google Authentication for Next.js projects
- **Trigger**: "firebase auth setup", "google auth implementation", "setup authentication"
- **Template**: This project (✅ PRODUCTION-TESTED)
- **Expertise Level**: Expert - handles complex OAuth configurations

**Capabilities:**
1. **Firebase Console Setup**:
   - Enable Google Sign-in provider with support email (dinohorn35@gmail.com)
   - Configure public-facing name and branding
   - Set up authorized domains (localhost, habittracker-eb6bd.firebaseapp.com, nextvibe.app)

2. **Google Cloud OAuth Configuration**:
   - OAuth Client ID: 324797617648-prrbq679kjb59vfg59purusqi8474qu5.apps.googleusercontent.com
   - Configure authorized JavaScript origins for all environments
   - Set up redirect URIs with `/__/auth/handler` pattern
   - Handle SSL certificate requirements

3. **Next.js Implementation** (see implementation in this project):
   - Environment-based auth method selection (popup for localhost, redirect for production)
   - Comprehensive error handling with user-friendly messages
   - Cross-Origin-Opener-Policy resolution with fallback logic
   - Complete AuthContext with profile management
   - Automatic dashboard redirect for authenticated users

4. **Troubleshooting Expertise**:
   - Resolve popup blocking issues
   - Fix redirect URI mismatches
   - Handle SSL certificate problems
   - Debug auth state persistence issues

**Reference Files:**
- `lib/auth.ts`: Core authentication logic with environment detection
- `contexts/AuthContext.tsx`: Complete auth state management
- `app/login/page.tsx` & `app/signup/page.tsx`: Enhanced UI with error handling

### 🚀 Firebase Deployment Agent
- **Purpose**: Deploy Next.js applications to Firebase Hosting
- **Trigger**: "deploy to firebase", "firebase hosting setup", "production deployment"
- **Template**: This project's static export configuration

**Capabilities:**
1. **Next.js Configuration** (see `next.config.js`):
   - Configure for static export with `output: 'export'`
   - Set up image optimization for static hosting
   - Handle trailing slash requirements

2. **Firebase Hosting Setup** (see `firebase.json`):
   - Configure hosting with proper rewrites for SPA
   - Set up client-side routing support
   - Configure ignore patterns for optimization

3. **Deployment Process**:
   - Build command: `npm run build`
   - Deploy command: `firebase deploy --only hosting`
   - Combined script: `npm run deploy`
   - Production URL: https://habittracker-eb6bd.web.app

4. **Production Optimization**:
   - Bundle size optimization (removed debug code)
   - Clean console logs for production
   - Optimized static asset handling

### 🗄️ Firestore Schema Master Agent
- **Purpose**: Design and implement scalable Firestore database schemas
- **Trigger**: "firestore schema", "database design", "firestore setup"
- **Template**: This project's multi-dimensional data structure

**Capabilities:**
1. **Schema Design** (implemented in this project):
   - User-centric collection structure: `users/{userId}/habits`, `users/{userId}/completions`, `users/{userId}/moods`
   - Normalized data structure with efficient queries
   - Type-safe schema definitions in `types/index.ts`
   - Optimized for real-time subscriptions

2. **Security Implementation** (see `firestore.rules`):
   - User-based security rules
   - Field-level validation
   - Authenticated user access only
   - Data sanitization patterns

3. **TypeScript Integration** (see `lib/db.ts`):
   - Complete type definitions for all collections
   - CRUD operation interfaces with type safety
   - Error handling patterns
   - Real-time subscription utilities

4. **Performance Optimization**:
   - Compound indexes for complex queries (see `firestore.indexes.json`)
   - Efficient pagination patterns
   - Batch operation implementations
   - Real-time subscription management

### 📊 Dashboard Analytics Agent
- **Purpose**: Create comprehensive analytics dashboards with data visualization
- **Trigger**: "dashboard analytics", "data visualization", "charts and metrics"
- **Template**: This project's habit and mood analytics implementation

**Capabilities:**
1. **Data Aggregation** (see dashboard implementation):
   - Time-series data processing for habits and moods
   - Multi-dimensional metric calculations (4D mood tracking)
   - Trend analysis and pattern detection
   - Performance metric tracking (streak calculations)

2. **Visualization Implementation** (see components/charts/):
   - Recharts integration with custom blue theme
   - Responsive chart configurations
   - Interactive data exploration
   - Real-time data updates via Firestore subscriptions

3. **Dashboard Architecture** (see app/dashboard/):
   - Component-based metric cards (StatsCard)
   - Lazy-loaded chart components
   - Optimized data fetching with custom hooks
   - Mobile-responsive layouts with Tailwind

4. **Advanced Features**:
   - Calendar heatmap for habit tracking (HabitCalendar)
   - Progress charts with trend lines (ProgressChart)  
   - Multi-dimensional mood analytics
   - Today's snapshot with quick actions

### 🎨 Tailwind Theme Master Agent
- **Purpose**: Implement comprehensive theming systems with dark/light mode
- **Trigger**: "tailwind theming", "dark mode setup", "theme system"
- **Template**: This project's blue-based theme system

**Capabilities:**
1. **Theme Configuration** (see `tailwind.config.js`):
   - Custom blue-based color palette (primary-50 to primary-950)
   - Secondary colors and semantic naming
   - Dark/light mode variants for all colors
   - Consistent spacing and typography scales

2. **Theme Implementation** (see `contexts/ThemeContext.tsx`):
   - React Context-based theme management
   - LocalStorage persistence across sessions
   - System preference detection
   - Smooth theme transitions

3. **Component Theming** (see components/ui/):
   - Consistent button styling with variants
   - Form input theming with error states
   - Card and surface treatments
   - Interactive state management with proper contrast

4. **Advanced Features**:
   - Theme-aware component library
   - Gradient backgrounds for different modes
   - Accessibility-compliant contrast ratios
   - Seamless theme switching without flash

**Color System:**
- **Primary**: Blue palette (50: #eff6ff → 950: #1e3a8a)
- **Secondary**: Complementary grays and accent colors
- **Semantic**: Error (red), success (green), warning (yellow)
- **Surface**: Background and elevated surface treatments
- **Text**: Primary and secondary text with proper contrast

### 🧪 Playwright Testing Agent
- **Purpose**: Create comprehensive end-to-end testing suites with Playwright MCP
- **Trigger**: "setup testing", "e2e tests", "playwright tests", "test automation"
- **Template**: Authentication and user flow testing patterns

**Capabilities:**
1. **Authentication Flow Testing**:
   - Test Google Auth popup and redirect flows
   - Verify login/logout functionality
   - Test protected route redirections
   - Mock authentication states

2. **User Journey Testing**:
   - Complete habit creation and tracking flows
   - Mood entry and visualization testing
   - Dashboard interaction validation
   - Mobile responsive testing

3. **Visual Testing**:
   - Screenshot comparison testing
   - Cross-browser compatibility
   - Dark/light theme validation
   - Component visual regression testing

4. **Performance Testing**:
   - Page load time validation
   - API response time testing
   - Bundle size monitoring
   - Real User Metrics (RUM) collection

**Test Patterns for This Project:**
- **Auth Tests**: Login flow, protected routes, session persistence
- **Habit Tests**: Create habit, mark complete, streak tracking
- **Mood Tests**: Entry forms, analytics visualization, trend analysis
- **Dashboard Tests**: Data loading, chart rendering, responsive design

**Playwright MCP Integration:**
- Automated test generation from user interactions
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile device emulation and testing
- Network condition simulation

### 🔧 Development Workflow Agent
- **Purpose**: Streamline common development tasks and quality assurance
- **Trigger**: "dev workflow", "code quality", "development setup"
- **Template**: This project's development patterns

**Capabilities:**
1. **Code Quality Enforcement**:
   - ESLint configuration and rule management
   - TypeScript strict mode validation
   - Prettier formatting consistency
   - Pre-commit hook setup

2. **Development Environment**:
   - Environment variable management (.env.local setup)
   - Database connection validation
   - Firebase emulator configuration
   - Hot reload optimization

3. **Build and Deploy Pipeline**:
   - Build error diagnosis and resolution
   - Bundle analysis and optimization
   - Deployment verification and rollback
   - Environment-specific configuration

4. **Debugging and Monitoring**:
   - Error logging and tracking setup
   - Performance monitoring integration
   - User analytics implementation
   - Debug mode configuration

### 📊 Data Migration Agent
- **Purpose**: Handle database migrations and data transformations
- **Trigger**: "data migration", "database update", "schema changes"
- **Template**: Firestore collection structure evolution

**Capabilities:**
1. **Schema Evolution**:
   - Safe field addition/removal procedures
   - Data type migration strategies
   - Index optimization during migrations
   - Backward compatibility maintenance

2. **Data Transformation**:
   - Batch data processing with Firestore
   - Cloud Function-based migrations
   - Data validation and cleanup
   - Progress monitoring and rollback

3. **Production Safety**:
   - Migration testing in staging environment
   - Gradual rollout strategies
   - Data backup and recovery procedures
   - Migration status monitoring

### 🚀 Performance Optimization Agent
- **Purpose**: Optimize application performance and user experience
- **Trigger**: "performance optimization", "speed optimization", "bundle optimization"
- **Template**: This project's optimization strategies

**Capabilities:**
1. **Frontend Optimization**:
   - Code splitting and lazy loading
   - Image optimization and CDN setup
   - Bundle size analysis and reduction
   - Core Web Vitals optimization

2. **Database Optimization**:
   - Query optimization and indexing
   - Real-time subscription management
   - Caching strategies implementation
   - Pagination and infinite scroll

3. **Network Optimization**:
   - API response optimization
   - Service Worker implementation
   - Offline functionality setup
   - Progressive Web App (PWA) features

4. **Monitoring and Analytics**:
   - Performance metrics tracking
   - User behavior analytics
   - Error monitoring and alerting
   - A/B testing framework setup

### 🔐 Security Hardening Agent
- **Purpose**: Implement comprehensive security best practices
- **Trigger**: "security audit", "security hardening", "vulnerability assessment"
- **Template**: Firebase security rules and authentication patterns

**Capabilities:**
1. **Authentication Security**:
   - Multi-factor authentication setup
   - Session management and timeout
   - Password policy enforcement
   - Social login security review

2. **Data Protection**:
   - Firestore security rules validation
   - Data encryption at rest and in transit
   - PII data handling and anonymization
   - GDPR compliance implementation

3. **Frontend Security**:
   - XSS prevention and CSP headers
   - CORS configuration optimization
   - Secure cookie configuration
   - Input validation and sanitization

4. **Infrastructure Security**:
   - Environment variable protection
   - API key rotation and management
   - Dependency vulnerability scanning
   - Security header configuration

### 🚀 Vercel Deployment Agent
- **Purpose**: Expert assistance with Vercel deployment, configuration, and troubleshooting
- **Trigger**: "vercel deploy", "vercel setup", "deployment issues", "vercel config"
- **Template**: This project's complete Vercel integration
- **Expertise Level**: Expert - handles complex deployment scenarios

**Capabilities:**
1. **Initial Setup and Configuration**:
   - Install and configure Vercel CLI (`npm install -g vercel`)
   - GitHub authentication setup (`vercel login --github`)
   - Project linking and auto-detection (`vercel link --yes`)
   - Build settings optimization for Next.js projects

2. **Deployment Management**:
   - Preview deployments (`vercel`) for testing changes
   - Production deployments (`vercel --prod`) for releases
   - Deployment inspection and log analysis (`vercel inspect --logs`)
   - Rollback procedures for failed deployments

3. **Environment and Configuration**:
   - Environment variable management (`vercel env add/pull`)
   - Custom domain setup and SSL configuration
   - Build and runtime configuration optimization
   - Performance monitoring and optimization

4. **Troubleshooting and Maintenance**:
   - Build failure diagnosis and resolution
   - Auto-deployment webhook issues
   - GitHub integration troubleshooting
   - Production environment debugging

**Key Commands Reference:**
```bash
# Essential deployment commands
vercel                    # Deploy to preview
vercel --prod            # Deploy to production
vercel project ls        # List all projects
vercel inspect <url>     # Check deployment details
vercel env add           # Add environment variable
vercel rollback <url>    # Rollback deployment
```

**This Project Configuration:**
- **Project ID**: prj_Q5kEz6FMiQI0Tq4GgBICYrlWqnu9
- **Project Name**: nextvibe (Vercel project name)
- **Production URL**: https://nextvibe.app
- **Repository**: https://github.com/ainexllc/nextvibe
- **Auto-deployment**: ✅ Enabled on main branch
- **Preview deployments**: ✅ Enabled for PRs
- **Build Command**: `next build` (auto-detected)
- **Node.js Runtime**: 22.x

**Common Issues and Solutions:**
- **Build failures**: Check `npm run build` locally first
- **Environment variables**: Use `vercel env pull` to sync locally
- **Domain issues**: Verify DNS settings and SSL certificates
- **Performance**: Analyze bundle size and implement code splitting

## Current Development Status (August 2025)

### Recently Completed ✅
- Enhanced AI habit enhancement with comprehensive 4-5 sentence benefits
- Auto-population of form fields from AI suggestions (title, description)
- Fixed invalid JSON response errors with increased token limits
- Improved form UX with prominent focus states and visual feedback
- Resolved white screen issues with optimized build configuration
- Removed problematic OpenTelemetry dependencies from API routes
- Updated to latest dependencies and improved error handling

### Known Issues 🔧
- ESLint configuration needs updating (unknown options errors)
- TypeScript checking temporarily disabled during builds
- Some telemetry dependencies still present but not used

### Next Potential Features 💡
- Mood-habit correlation analytics
- Advanced usage analytics dashboard
- Additional AI features (mood analysis, insights)
- Progressive Web App (PWA) capabilities

### Development Environment ⚙️
- **Port**: Development server runs on default Next.js port (usually 3000)
- **Build**: Static export disabled, API routes enabled
- **Testing**: Playwright integrated with comprehensive test suite
- **AI**: Claude Haiku integration with cost tracking and rate limiting
- **Authentication**: Google OAuth fully operational
- **Deployment**: Dual deployment (Firebase + Vercel) with auto-deployment

---
*Last updated: August 2025 - Post AI Enhancement & UX Improvements*