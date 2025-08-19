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
- **Solution**: Personal Access Token in remote URL (token secured in git config)
- **Remote URL**: Configured with embedded token (hidden from logs)
- **Credential Helper**: osxkeychain
- **User**: buitwai (dinohorn35@gmail.com)
- **Status**: ✅ No password prompts required
- **Setup Command**: `gh auth setup-git` or use `gh auth token` to get current token

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
- **Authentication**: Email/Password + Google Sign-in
- **Collections**:
  - users/{userId}/habits
  - users/{userId}/completions
  - users/{userId}/moods

## Recent Implementation Notes
- Comprehensive mood tracking system added with 4-dimensional ratings
- Dashboard integration with today's mood section
- Dedicated /moods page with analytics and trend visualization
- All TypeScript errors resolved for Vercel deployment
- ESLint configuration added for code quality

## System Environment
- **OS**: macOS (Darwin 25.0.0)
- **Node.js**: Check with `node --version`
- **NPM**: Check with `npm --version`
- **Working Directory**: /Users/dino/AiFirst/claudecode-realtest

## Claude Configuration
- **Config Location**: ~/.config/claude/
- **Hooks**: user-prompt-submit.py (disabled)

## MCP Servers
- **Playwright MCP**: Not currently installed
- **Other MCP Servers**: To be configured as needed

## Notes for Continuation
- Firebase rules and indexes are up to date
- All mood tracking functionality is complete and tested
- Repository is fully synchronized with remote
- Project passes TypeScript compilation
- Ready for continued development on any machine

## TODO
- [ ] Add mood-habit correlation features
- [ ] Consider installing Playwright MCP for testing
- [ ] Set up additional MCP servers as needed

---
*Last updated: August 2025*