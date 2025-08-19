# Claude Code Memory File

This file contains important configuration and setup information for this project and development environment.

## Project Overview
- **Project Name**: HabitTracker Next.js App
- **Repository**: https://github.com/ainexllc/habittracker-nextjs
- **Technology Stack**: Next.js 14, TypeScript, Firebase, Tailwind CSS 3, Recharts
- **Features**: Habit tracking, mood tracking, analytics, dark/light mode

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
- ainexllc/habittracker-nextjs (public) - **Current Project**
- ainexllc/homekeep (private)
- ainexllc/journal (private)
- ainexllc/ainex (private)

## Development Commands
### Firebase
- `npm run deploy:rules` - Deploy Firestore rules
- `npm run deploy:indexes` - Deploy Firestore indexes
- `firebase deploy --only firestore:rules` - Deploy rules directly
- `firebase deploy --only firestore:indexes` - Deploy indexes directly

### Build & Deploy
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run lint` - ESLint checking
- `npx tsc --noEmit` - TypeScript type checking

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
  - users/{userId}/habits
  - users/{userId}/completions
  - users/{userId}/moods

### Google Authentication Complete Setup
- **Status**: ✅ FULLY WORKING - Local & Production
- **OAuth Client ID**: 324797617648-prrbq679kjb59vfg59purusqi8474qu5.apps.googleusercontent.com
- **Local Method**: Popup (works immediately, no CORS issues)
- **Production Method**: Redirect (better for mobile, SEO-friendly)
- **Authorized Domains**: localhost, habittracker-eb6bd.firebaseapp.com, nextvibe.app
- **Redirect URIs**: 
  - http://localhost:3000/__/auth/handler
  - https://habittracker-eb6bd.firebaseapp.com/__/auth/handler
  - https://nextvibe.app/__/auth/handler

#### Authentication Implementation Details
- **Environment Detection**: Auto-selects popup/redirect based on hostname
- **Error Handling**: Comprehensive error messages for all auth scenarios
- **Cross-Origin-Opener-Policy**: Properly handled with fallback logic
- **Redirect Result Handling**: Full implementation in AuthContext
- **State Management**: Complete auth state with user profile creation
- **Navigation Logic**: Automatic dashboard redirect for authenticated users

## Google Authentication Workflow & Troubleshooting

### Complete Setup Process (REFERENCE FOR FUTURE)
1. **Firebase Console** → Authentication → Sign-in method → Enable Google
2. **Google Cloud Console** → APIs & Credentials → OAuth 2.0 Client IDs
3. **Configure Authorized Domains**: localhost, production domain
4. **Configure Redirect URIs**: `/__/auth/handler` for each domain
5. **Environment-based Implementation**: popup for localhost, redirect for production

### Key Files Modified
- `lib/auth.ts`: Core authentication logic with environment detection
- `contexts/AuthContext.tsx`: Complete auth state management
- `app/login/page.tsx` & `app/signup/page.tsx`: Enhanced UI with error handling

### Common Issues & Solutions
- **Cross-Origin-Opener-Policy**: Use redirect method on localhost
- **Redirect Not Working**: Ensure redirect URIs include `/__/auth/handler`
- **Localhost Issues**: Use popup method (auto-detected)
- **Production Issues**: Verify authorized domains in both Firebase and Google Cloud Console

### Testing Approach
- **Direct Firebase Test**: `/public/test-auth-direct.html` for isolated testing
- **Popup vs Redirect**: `/public/test-popup-auth.html` for popup testing
- **Environment Detection**: Automatic based on `window.location.hostname`

### Deployment Configuration
- **Next.js Config**: Static export with `output: 'export'`
- **Firebase Hosting**: Configured in `firebase.json`
- **Build Command**: `npm run build` (static export)
- **Deploy Command**: `firebase deploy --only hosting`

## Recent Implementation Notes
- ✅ **COMPLETE Google Authentication** with popup/redirect hybrid approach
- ✅ **Production Deployment** to https://habittracker-eb6bd.web.app
- ✅ **Environment-based Auth Method Selection** (popup local, redirect production)
- ✅ **Comprehensive Error Handling** with user-friendly messages
- ✅ **Cross-Origin-Opener-Policy Resolution** with fallback logic
- Comprehensive mood tracking system added with 4-dimensional ratings
- Dashboard integration with today's mood section
- Dedicated /moods page with analytics and trend visualization
- All TypeScript errors resolved for production deployment
- Firebase Hosting configured for static site deployment

## System Environment
- **OS**: macOS (Darwin 25.0.0)
- **Node.js**: Check with `node --version`
- **NPM**: Check with `npm --version`
- **Working Directory**: /Users/dino/AiFirst/claudecode-realtest

## Claude Configuration
- **Config Location**: ~/.config/claude/
- **Hooks**: user-prompt-submit.py (disabled)

## MCP Servers Configuration

### Playwright MCP Server
- **Status**: ✅ Configured in Claude settings
- **Package**: @playwright/mcp (version 1.54.2)
- **Purpose**: Browser automation and testing integration
- **Capabilities**:
  - Web page interactions and automation
  - Screenshot capture
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

## TODO
- [ ] Add mood-habit correlation features
- [ ] Explore BigQuery integration for advanced analytics
- [ ] Set up Cloud Functions for background processing
- [ ] Consider App Engine deployment for scaling

---
*Last updated: August 2025*