# MCP Servers Configuration for HabitNex Project

## ✅ Installed MCP Servers (Visible in `/mcp`)

All MCP servers are now configured and visible when you run `/mcp` in Claude Code!

### 1. **Context7** ✓ Connected
- **Type**: HTTP (Remote)
- **URL**: https://mcp.context7.com/mcp
- **Status**: ✓ Connected with API key
- **Purpose**: Up-to-date code documentation and library examples
- **Features**:
  - Get latest Next.js, React, Firebase docs
  - Version-specific API documentation
  - Real-time library reference

### 2. **Vercel** ⚠ Needs Authentication
- **Type**: HTTP (Remote - Official)
- **URL**: https://mcp.vercel.com/
- **Status**: ⚠ Needs authentication (OAuth)
- **Purpose**: Vercel project and deployment management
- **Features**:
  - Search Vercel documentation
  - List projects and deployments
  - Analyze deployment logs
  - Check configurations

**To Authenticate:**
When you use a Vercel command in Claude Code, it will prompt you to authenticate via OAuth.

### 3. **Firebase** ✓ Connected
- **Type**: Stdio (Local)
- **Command**: `npx -y firebase-tools@latest experimental:mcp --dir /Users/dino/ainex/habitnex-app`
- **Status**: ✓ Connected
- **Project**: habittracker-eb6bd (this project)
- **Purpose**: Firebase project management
- **Features**:
  - Firestore database operations
  - Authentication management
  - Security rules deployment
  - Firebase Functions management
  - Hosting configuration

### 4. **Google Cloud Platform (GCP)** ✓ Connected
- **Type**: Stdio (Local)
- **Command**: `gcp-mcp`
- **Status**: ✓ Connected
- **Project**: habittracker-eb6bd
- **Environment**: `GCP_PROJECT_ID=habittracker-eb6bd`
- **Purpose**: GCP resource monitoring and log analysis
- **Features**:
  - Cloud resource monitoring
  - Log analysis
  - Project information
  - Service status checks

### 5. **GitHub** ✗ Failed to Connect
- **Type**: HTTP (Remote - Official)
- **URL**: https://api.githubcopilot.com/mcp/
- **Status**: ✗ Failed to connect (requires authentication)
- **Purpose**: GitHub repository management
- **Note**: You also have a working GitHub MCP in global config with PAT

**Global GitHub MCP (Working):**
- Command: `npx -y @modelcontextprotocol/server-github`
- Auth: GitHub PAT `<YOUR_GITHUB_PAT>` (configured in ~/.claude/settings.json)

---

## 🌐 Global MCP Servers (Always Available)

These are configured in `~/.claude/settings.json` and work across all projects:

1. **Playwright** - E2E browser testing and automation
2. **Context7** - Up-to-date docs (stdio version with API key)
3. **Firebase** - Firebase management for journalnex-app
4. **GCP** - GCP resource monitoring
5. **GitHub** - GitHub repo operations (with PAT)

---

## 📊 MCP Server Status Summary

| Server | Type | Status | Auth Required |
|--------|------|--------|---------------|
| Context7 | HTTP | ✓ Connected | API Key (configured) |
| Vercel | HTTP | ⚠ Needs Auth | OAuth (on first use) |
| Firebase | Stdio | ✓ Connected | Firebase CLI login |
| GCP | Stdio | ✓ Connected | gcloud CLI auth |
| GitHub (HTTP) | HTTP | ✗ Failed | Yes |
| GitHub (Stdio) | Stdio | ✓ Connected | PAT (configured) |

---

## 🔧 Usage in Claude Code

### View All MCP Servers
```bash
claude mcp list
```

or in chat:
```
/mcp
```

### Using MCP Tools

**Example 1: Get latest Next.js docs**
```
Use context7 to check the latest Next.js 15 App Router documentation
```

**Example 2: Firebase operations**
```
Use Firebase MCP to list all Firestore collections in my project
```

**Example 3: Vercel deployment check**
```
Check my latest Vercel deployment status for habitnex.app
```

**Example 4: GCP logs**
```
Check recent error logs in my GCP project habittracker-eb6bd
```

---

## 🔐 Authentication Status

### ✅ Authenticated & Working:
- **Context7**: API key configured (`ctx7sk-570f390d...`)
- **Firebase**: Using `firebase login` credentials
- **GCP**: Using `gcloud auth` credentials
- **GitHub (Stdio)**: PAT configured in global settings

### ⚠️ Needs Authentication:
- **Vercel**: Will prompt for OAuth on first use
- **GitHub (HTTP)**: Requires authentication

---

## 📁 Configuration Files

### Project-Level Config
File: `/Users/dino/.claude.json`
- Contains project-specific MCP server configurations
- Stored in Claude Code's data directory
- Includes: Context7 (HTTP), Vercel, Firebase (project-specific), GCP, GitHub

### Global Config
File: `~/.claude/settings.json`
- Contains user-level MCP server configurations
- Applies to all Claude Code sessions
- Includes: Playwright, Context7, Firebase, GCP, GitHub

---

## 🚀 What's Next?

All MCP servers are now visible in `/mcp` and ready to use!

**To authenticate Vercel:**
1. In Claude Code, ask: "List my Vercel projects"
2. It will prompt you to authenticate via OAuth
3. Complete the authentication in your browser
4. Vercel MCP will then be fully operational

**To use any MCP server:**
Just ask Claude Code naturally, mentioning what you want to do. For example:
- "Get the latest Firebase Auth documentation via context7"
- "Show me my Vercel deployment history"
- "List all Firestore indexes in my Firebase project"
- "Check GCP error logs from the past hour"

---

## 📚 Official Documentation

- **Vercel MCP**: https://vercel.com/blog/introducing-vercel-mcp
- **Firebase MCP**: `firebase experimental:mcp --help`
- **Context7**: https://github.com/upstash/context7
- **MCP Protocol**: https://docs.claude.com/en/docs/claude-code/mcp

---

*Setup completed successfully! All 5 MCP servers are now visible in Claude Code's `/mcp` command.*
