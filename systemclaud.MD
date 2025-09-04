# Claude Global Memory

This file contains important configuration and setup information across all projects and development environments.

## ⚠️ CRITICAL: Firebase Rules and Indexes Auto-Deployment
**MANDATORY**: Claude MUST automatically push and deploy Firebase security rules and Firestore indexes whenever:
- Firestore query errors indicate missing indexes
- Security rules need updates for new features
- Index configuration files are modified
- Any Firebase-related deployment is required

**Required Actions:**
- ✅ ALWAYS run `firebase deploy --only firestore:rules,firestore:indexes` on my behalf
- ✅ Create missing composite indexes using Firebase CLI when query errors occur
- ✅ Start and deploy indexes to Firebase Console immediately
- ✅ Verify index deployment completion before proceeding
- ✅ Monitor for additional index requirements during development

**Firebase Deployment Commands:**
```bash
# Deploy rules and indexes together
firebase deploy --only firestore:rules,firestore:indexes --project {project-id}

# Deploy indexes only
firebase deploy --only firestore:indexes --project {project-id}

# Deploy security rules only
firebase deploy --only firestore:rules --project {project-id}

# Check current indexes
firebase firestore:indexes --project {project-id}
```

## ⚠️ CRITICAL: Vercel Auto-Deployment for Next.js Projects
**IMPORTANT**: When working on Next.js projects connected to Vercel, be aware that any updates to the main branch (through direct commits or merged PRs) will trigger automatic production deployment.

**Requirements for ALL commits to main branch:**
- ✅ Code MUST build successfully (`npm run build` passes)
- ✅ TypeScript compilation MUST complete without errors
- ✅ No breaking changes that would cause Vercel build failures
- ✅ All environment variables and dependencies properly configured
- ✅ Static export compatibility maintained for deployment
- ✅ Firebase rules and indexes deployed and operational

**Before pushing to main:**
1. Run `npm run build` locally to verify successful build
2. Check TypeScript compilation with no errors
3. Deploy Firebase rules and indexes if modified
4. Test critical functionality to ensure no breaking changes
5. Verify all imports and dependencies are correctly resolved

**Vercel will automatically:**
- Build the project using `npm run build`
- Deploy to production URL if build succeeds
- Show build errors in Vercel dashboard if build fails
- Send notifications about deployment status

**If deployment fails:**
- Check Vercel dashboard for build error details
- Fix errors locally and test with `npm run build`
- Deploy Firebase components if needed
- Push fix to main branch to trigger new deployment attempt

## Vercel CLI Configuration
**Status**: ✅ Configured and Ready

**Installation and Setup:**
```bash
# Install globally
npm install -g vercel

# Login with GitHub (already completed)
vercel login --github

# Link project to Vercel
vercel link --yes

# Deploy project
vercel
```

**Authentication:**
- **Account**: dinohorn35@gmail.com
- **Method**: GitHub OAuth
- **CLI Version**: 46.0.2
- **Organization**: team_lNWTMcQWMnIRjyREXHHLAcbr

**Common Commands:**
```bash
# Deploy to preview
vercel

# Deploy to production  
vercel --prod

# List all projects
vercel project ls

# Check deployment logs
vercel inspect <deployment-url> --logs

# Set environment variables
vercel env add [name]

# Pull environment variables locally
vercel env pull

# Rollback deployment
vercel rollback <deployment-url>

# Remove deployment
vercel remove <deployment-url>
```

**Project Integration:**
- Auto-detects Next.js projects and configures build settings
- Creates `.vercel/project.json` with project metadata
- Connects GitHub repository for automatic deployments
- Sets up preview deployments for pull requests

## System Information
- **OS**: macOS (Darwin 25.0.0)
- **User**: dino
- **Home**: /Users/dino

## GitHub CLI Configuration
- **Version**: gh version 2.76.1 (2025-07-23)
- **Account**: buitwai
- **Email**: dinohorn35@gmail.com
- **Authentication**: Active (keyring)
- **Protocol**: HTTPS
- **Token Scopes**: 'gist', 'read:org', 'repo', 'workflow'
- **Config Location**: ~/.config/gh/

### Authentication Setup Commands
```bash
# Login to GitHub CLI (already completed)
gh auth login

# Configure git to use GitHub CLI authentication
gh auth setup-git

# Check authentication status
gh auth status

# Get current token (if needed)
gh auth token
```

### Git Configuration
- **Global User**: buitwai
- **Global Email**: dinohorn35@gmail.com
- **Credential Helper**: osxkeychain
- **Authentication Method**: GitHub CLI integrated
- **Status**:  No password prompts required

### Available Repositories
- ainexllc/nexttask (private)
- ainexllc/nextvibe (public) - formerly habittracker-nextjs
- ainexllc/homekeep (private)
- ainexllc/journal (private)
- ainexllc/ainex (private)

## Development Environment
- **Node.js**: Installed (check with `node --version`)
- **NPM**: Installed (check with `npm --version`)
- **Firebase CLI**: Installed and configured
- **Git**: Configured with GitHub CLI authentication

## Claude Configuration
- **Config Directory**: ~/.config/claude/
- **Memory File**: ~/.claude/CLAUDE.md (this file)
- **Project Files**: Individual CLAUDE.md files in project roots
- **Hooks Directory**: ~/.config/claude/hooks.disabled/

## MCP Servers Configuration

### Playwright MCP Server
- **Status**: ✅ Installed and configured
- **Package**: @playwright/mcp (version 0.0.34)
- **Purpose**: Browser automation and testing integration with Claude Code
- **Playwright Version**: 1.54.2

#### Installation Instructions
```bash
# Install Playwright MCP server
npm install -g @anthropics/mcp-playwright

# Install Playwright browsers
npx playwright install

# Or install specific browsers
npx playwright install chromium firefox webkit
```

#### Configuration for Claude Code
✅ **Configured** in `~/.claude/settings.json`:
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp"],
      "env": {}
    }
  }
}
```

#### Usage Examples
- **Web scraping**: Extract data from web pages
- **UI testing**: Automate browser interactions for testing
- **Screenshot capture**: Take screenshots of web pages
- **Form automation**: Fill out and submit forms
- **Performance testing**: Measure page load times and metrics

#### Browser Support
- **Chromium**: Google Chrome/Edge automation
- **Firefox**: Mozilla Firefox automation  
- **WebKit**: Safari automation (macOS)

#### Common Commands
```bash
# Check Playwright installation
npx playwright --version

# Run Playwright tests
npx playwright test

# Open Playwright test runner UI
npx playwright test --ui

# Generate test code
npx playwright codegen
```

### Firebase MCP Server
- **Status**: ✅ Installed and configured
- **Purpose**: Firebase CLI integration for project management
- **Authentication**: Uses Firebase CLI credentials (`firebase login`)
- **Capabilities**: 
  - Firestore database operations
  - Authentication management
  - Firebase Functions deployment
  - Project configuration
  - Security rules management

#### Configuration
✅ **Configured** in `~/.claude/settings.json`:
```json
{
  "mcpServers": {
    "firebase": {
      "command": "npx",
      "args": ["-y", "firebase-tools@latest", "experimental:mcp", "--dir", "/Users/dino/AiFirst/claudecode-realtest"],
      "env": {}
    }
  }
}
```

#### Prerequisites
- ✅ Firebase CLI installed (version 14.11.2)
- ✅ Firebase authentication configured
- ✅ Project directory context set

### Google Cloud CLI
- **Status**: ✅ Installed and configured
- **Version**: Google Cloud SDK 534.0.0
- **Account**: dinohorn35@gmail.com
- **Project**: habittracker-eb6bd (same as Firebase project)
- **Components**: bq, gsutil, gcloud-crc32c, core
- **Capabilities**:
  - Cloud resource management
  - BigQuery operations
  - Cloud Storage (gsutil)
  - App Engine deployment
  - Compute Engine management
  - Cloud Run deployment

#### Available Commands
```bash
gcloud --version              # Check version
gcloud auth list              # List authenticated accounts
gcloud projects list          # List available projects
gcloud config list            # Show current configuration
gcloud services list          # List enabled APIs
```

### Additional Google Cloud Options
- **Cloud Run MCP hosting**: Available for remote MCP servers
- **Vertex AI integration**: Available with CLAUDE_CODE_USE_VERTEX=1
- **BigQuery**: Direct access via bq command
- **Cloud Storage**: Direct access via gsutil command

### Other Available MCP Servers
- **GitHub MCP**: Repository management and PR operations
- **Database MCP**: For database operations
- **API Testing MCP**: For REST API testing
- **File System MCP**: For advanced file operations
- **Docker MCP**: For container management

## Standard Git Workflow
1. Clone repositories with HTTPS URLs
2. Git operations work seamlessly (no password prompts)
3. Use standard commit signature:
   ```
   > Generated with [Claude Code](https://claude.ai/code)
   
   Co-Authored-By: Claude <noreply@anthropic.com>
   ```

## Firebase Projects Template
**Template for Next.js + Firebase Projects:**

## ⚠️ CRITICAL: Firebase Firestore Workflow
**IMPORTANT**: When making ANY changes to Firebase/Firestore database structure, schema, or configuration, ALWAYS follow this mandatory workflow:

**Required Steps for ALL Firestore Changes:**
1. ✅ Update `firestore.rules` file if security rules need modification
2. ✅ Update `firestore.indexes.json` if new compound indexes are needed
3. ✅ Deploy rules: `firebase deploy --only firestore:rules`
4. ✅ Deploy indexes: `firebase deploy --only firestore:indexes`
5. ✅ Verify indexes build successfully in Firebase Console
6. ✅ Test new queries work with updated rules and indexes

**Commands to Remember:**
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules
npm run deploy:rules

# Deploy Firestore indexes  
firebase deploy --only firestore:indexes
npm run deploy:indexes

# Deploy both rules and indexes together
firebase deploy --only firestore
```

**Why This Matters:**
- New queries may require composite indexes to function
- Security rules changes affect data access permissions
- Index creation can take time to build in production
- Forgetting to deploy can cause runtime query failures
- Production apps depend on proper rules and indexes being synchronized

### Google Authentication Setup (REFERENCE TEMPLATE)
**⭐ COMPLETE WORKING IMPLEMENTATION PATTERN**

1. **Firebase Console Configuration**:
   - Enable Google Sign-in provider
   - Configure support email: {your-email}
   - Public-facing name: {project-name}

2. **Google Cloud Console OAuth 2.0 Setup**:
   - **Client ID**: {project-id}-{hash}.apps.googleusercontent.com
   - **Authorized JavaScript Origins**:
     - http://localhost
     - http://localhost:3001 (configured dev port)
     - https://{project-id}.firebaseapp.com
     - https://{custom-domain}.com
   - **Authorized Redirect URIs**:
     - http://localhost:3001/__/auth/handler
     - https://{project-id}.firebaseapp.com/__/auth/handler
     - https://{custom-domain}.com/__/auth/handler

3. **Firebase Authorized Domains**:
   - localhost
   - {project-id}.firebaseapp.com
   - {custom-domain}.com

4. **Technical Implementation**:
   - **Environment Detection**: Auto-selects popup (localhost) vs redirect (production)
   - **Error Handling**: Comprehensive auth error messages with fallback logic
   - **Cross-Origin-Opener-Policy**: Resolved with redirect fallback
   - **State Management**: Full auth context with user profile creation
   - **Navigation**: Automatic dashboard redirect for authenticated users

#### Key Implementation Files
- `lib/auth.ts`: Core auth logic with environment detection
- `contexts/AuthContext.tsx`: Complete auth state management
- `app/login/page.tsx` & `app/signup/page.tsx`: UI with error handling

#### Troubleshooting Guide
- **Popup Blocked**: Auto-fallback to redirect method
- **Redirect Issues**: Verify `/__/auth/handler` in all redirect URIs
- **Local CORS**: Use popup method (auto-detected)
- **Production**: Use redirect method (auto-selected)

#### Testing Methodology
- **Direct Firebase Test**: Create `/public/test-auth-direct.html`
- **Isolated Testing**: Separate popup vs redirect test files
- **Environment Validation**: Automatic method selection

#### Deployment Process
- **Build**: `npm run build` (static export)
- **Deploy**: `firebase deploy --only hosting`
- **Config**: Next.js configured for static export
- **Result**: https://{project-id}.firebaseapp.com or custom domain

## Troubleshooting Authentication
If you encounter password prompts on new machines:
1. Run `gh auth login`
2. Run `gh auth setup-git`
3. Verify with `gh auth status`
4. Test with a git operation

## Notes
- GitHub CLI handles token refresh automatically
- No need to store tokens in git configs or environment variables
- Works consistently across all machines with GitHub CLI installed
- This is the recommended authentication method for all GitHub operations

## Custom Claude Code Agents

These agents provide specialized expertise across all projects, based on proven implementations and best practices.

### 🔐 Firebase Auth Master Agent
- **Purpose**: Implement complete Google Authentication for Next.js projects
- **Trigger**: "firebase auth setup", "google auth implementation", "setup authentication"
- **Template**: Production-tested Next.js + Firebase pattern
- **Expertise Level**: Expert - handles complex OAuth configurations

**Capabilities:**
1. **Firebase Console Setup**:
   - Enable Google Sign-in provider with support email
   - Configure public-facing name and branding
   - Set up authorized domains (localhost, production, custom domains)

2. **Google Cloud OAuth Configuration**:
   - Create OAuth 2.0 Client ID with proper scopes
   - Configure authorized JavaScript origins for all environments
   - Set up redirect URIs with `/__/auth/handler` pattern
   - Handle SSL certificate requirements

3. **Next.js Implementation**:
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

**Key Files Created:**
- `lib/auth.ts`: Core authentication logic
- `contexts/AuthContext.tsx`: State management
- Enhanced login/signup pages with error handling

**OAuth Configuration Template:**
- Client ID format: `{project-id}-{hash}.apps.googleusercontent.com`
- Authorized Origins: `http://localhost`, `http://localhost:3001`, production domains
- Redirect URIs: `{domain}/__/auth/handler` for each environment

### 🚀 Firebase Deployment Agent
- **Purpose**: Deploy Next.js applications to Firebase Hosting
- **Trigger**: "deploy to firebase", "firebase hosting setup", "production deployment"
- **Template**: Static export configuration pattern

**Capabilities:**
1. **Next.js Configuration**:
   - Configure `next.config.js` for static export
   - Set up image optimization for static hosting
   - Handle trailing slash requirements

2. **Firebase Hosting Setup**:
   - Configure `firebase.json` with proper rewrites
   - Set up SPA routing for client-side navigation
   - Configure ignore patterns for optimization

3. **Deployment Process**:
   - Build optimization for static hosting
   - Deploy with error handling and verification
   - Custom domain configuration support

4. **Production Optimization**:
   - Bundle size optimization
   - Remove debug code and console logs
   - Configure production environment variables

**Configuration Template:**
```json
// next.config.js
{
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true }
}

// firebase.json
{
  hosting: {
    public: "out",
    rewrites: [{"source": "**", "destination": "/index.html"}]
  }
}
```

**Deployment Commands:**
- `npm run build && firebase deploy --only hosting`
- Custom script: `"deploy": "npm run build && firebase deploy --only hosting"`

### 🗄️ Firestore Schema Master Agent
- **Purpose**: Design and implement scalable Firestore database schemas
- **Trigger**: "firestore schema", "database design", "firestore setup"
- **Template**: Multi-dimensional data structure pattern

**Capabilities:**
1. **Schema Design**:
   - User-centric collection structure (`users/{userId}/subcollections`)
   - Normalized vs. denormalized data decisions
   - Optimized query patterns and indexing strategies
   - Type-safe schema definitions

2. **Security Implementation**:
   - User-based security rules
   - Field-level validation
   - Role-based access control
   - Data sanitization patterns

3. **TypeScript Integration**:
   - Complete type definitions
   - CRUD operation interfaces
   - Type-safe database utilities
   - Error handling patterns

4. **Performance Optimization**:
   - Compound index strategies
   - Pagination implementation
   - Real-time subscription management
   - Batch operation patterns

**Schema Patterns:**
- **Users**: `/users/{userId}` with profile data
- **User Data**: `/users/{userId}/habits`, `/users/{userId}/completions`
- **Shared Data**: Root collections for shared/public content
- **Aggregations**: Computed fields and summary documents

**Security Rules Template:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### 📊 Dashboard Analytics Agent
- **Purpose**: Create comprehensive analytics dashboards with data visualization
- **Trigger**: "dashboard analytics", "data visualization", "charts and metrics"
- **Template**: Multi-dimensional analytics pattern

**Capabilities:**
1. **Data Aggregation**:
   - Time-series data processing
   - Multi-dimensional metric calculations
   - Trend analysis and pattern detection
   - Performance metric tracking

2. **Visualization Implementation**:
   - Recharts integration with custom themes
   - Responsive chart configurations
   - Interactive data exploration
   - Real-time data updates

3. **Dashboard Architecture**:
   - Component-based metric cards
   - Lazy-loaded chart components
   - Optimized data fetching strategies
   - Mobile-responsive layouts

4. **Advanced Features**:
   - Date range filtering
   - Correlation analysis between metrics
   - Export capabilities (CSV, charts)
   - Customizable metric definitions

**Visualization Types:**
- Line charts for trend analysis
- Bar charts for comparisons
- Calendar heatmaps for habit tracking
- Progress indicators and KPIs
- Multi-axis charts for correlations

### 🎨 Tailwind Theme Master Agent
- **Purpose**: Implement comprehensive theming systems with dark/light mode
- **Trigger**: "tailwind theming", "dark mode setup", "theme system"
- **Template**: Blue-based theme system from habittracker project

**Capabilities:**
1. **Theme Configuration**:
   - Custom color palettes with semantic naming
   - Dark/light mode variants
   - Consistent spacing and typography scales
   - Component-specific design tokens

2. **Theme Implementation**:
   - React Context-based theme management
   - LocalStorage persistence
   - System preference detection
   - Smooth theme transitions

3. **Component Theming**:
   - Consistent button and form styling
   - Card and surface treatments
   - Interactive state management
   - Accessibility-compliant contrast ratios

4. **Advanced Features**:
   - Multiple theme variants
   - Custom CSS properties integration
   - Theme-aware component libraries
   - Runtime theme customization

**Color System Template:**
- Primary: Blue-based palette (50-950 scale)
- Secondary: Complementary colors
- Error/Success/Warning: Semantic colors
- Surface: Background and elevated surfaces
- Text: Primary and secondary text colors

**Implementation Pattern:**
```typescript
// ThemeContext with localStorage persistence
// Automatic system preference detection
// CSS custom properties for smooth transitions
// Component-level theme awareness
```

### 🧪 Playwright Testing Agent
- **Purpose**: Create comprehensive end-to-end testing suites using Playwright MCP
- **Trigger**: "setup testing", "e2e tests", "playwright tests", "test automation"
- **Template**: Production-tested authentication and user flow patterns

**Capabilities:**
1. **Authentication Flow Testing**:
   - Google Auth popup/redirect flow validation
   - Protected route access control testing
   - Session persistence and timeout testing
   - Multi-browser authentication compatibility

2. **User Journey Testing**:
   - Complete user workflows from signup to feature usage
   - Form submission and validation testing
   - Real-time data updates and synchronization
   - Mobile and desktop responsive behavior

3. **Visual and Performance Testing**:
   - Screenshot comparison and visual regression
   - Page load performance validation
   - Bundle size and Core Web Vitals monitoring
   - Cross-browser and device compatibility

4. **Playwright MCP Integration**:
   - Automated test generation from recorded interactions
   - Network condition simulation and offline testing
   - Database state management during testing
   - CI/CD pipeline integration

### 🔧 Development Workflow Agent
- **Purpose**: Streamline development processes and ensure code quality
- **Trigger**: "dev workflow", "code quality", "development setup"
- **Template**: Modern Next.js development best practices

**Capabilities:**
1. **Code Quality Pipeline**:
   - ESLint, Prettier, and TypeScript configuration
   - Pre-commit hooks and automated formatting
   - Dependency vulnerability scanning
   - Code coverage reporting

2. **Environment Management**:
   - Multi-environment configuration (.env management)
   - Firebase emulator setup for local development
   - Hot reload optimization and debugging
   - Environment-specific build configurations

3. **Monitoring and Debugging**:
   - Error tracking and logging setup
   - Performance monitoring integration
   - Development debugging tools configuration
   - Production monitoring and alerting

### 🚀 Performance Optimization Agent
- **Purpose**: Optimize applications for speed and user experience
- **Trigger**: "performance optimization", "speed optimization", "bundle optimization"
- **Template**: Production optimization strategies

**Capabilities:**
1. **Frontend Performance**:
   - Code splitting and lazy loading implementation
   - Bundle size analysis and optimization
   - Image optimization and CDN setup
   - Core Web Vitals improvement strategies

2. **Database and API Optimization**:
   - Query optimization and proper indexing
   - Real-time subscription efficiency
   - Caching strategies and implementation
   - API response time optimization

3. **Progressive Web App Features**:
   - Service Worker implementation
   - Offline functionality development
   - App manifest and installability
   - Push notification setup

### 🔐 Security Hardening Agent
- **Purpose**: Implement comprehensive security measures
- **Trigger**: "security audit", "security hardening", "vulnerability assessment"
- **Template**: Firebase and Next.js security best practices

**Capabilities:**
1. **Authentication and Authorization**:
   - Multi-factor authentication implementation
   - Role-based access control (RBAC)
   - Session security and token management
   - OAuth provider security review

2. **Data Protection**:
   - Database security rules validation
   - Data encryption and PII protection
   - Input validation and sanitization
   - GDPR/privacy compliance

3. **Infrastructure Security**:
   - Environment variable protection
   - API key rotation and management
   - Security headers configuration
   - Dependency security scanning

### 🚀 Vercel Deployment Agent
- **Purpose**: Expert assistance with Vercel deployment, configuration, and troubleshooting
- **Trigger**: "vercel deploy", "vercel setup", "deployment issues", "vercel config"
- **Template**: Complete Vercel integration patterns
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

**Authentication Setup:**
- **Account**: dinohorn35@gmail.com
- **Method**: GitHub OAuth authentication
- **Organization**: team_lNWTMcQWMnIRjyREXHHLAcbr
- **CLI Version**: 46.0.2

**Common Issues and Solutions:**
- **Build failures**: Always check `npm run build` locally first
- **Environment variables**: Use `vercel env pull` to sync locally
- **Domain issues**: Verify DNS settings and SSL certificates
- **Performance**: Analyze bundle size and implement code splitting
- **Auto-deployment**: Ensure GitHub integration is properly configured

---
*Last updated: August 2025*