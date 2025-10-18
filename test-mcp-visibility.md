# MCP Server Visibility Troubleshooting Guide

## ✅ Current Status

All **6 MCP servers** are properly configured in `~/.claude/settings.json`:

1. **playwright** - E2E browser testing
2. **context7** - Up-to-date documentation
3. **firebase** - Firebase project management
4. **gcp** - Google Cloud operations
5. **vercel** - Vercel deployment management
6. **github** - GitHub repository operations

## 🔍 Why You Can't See Them in `/mcp`

The most common reason is that **you need to restart Claude Code** after adding or modifying MCP servers. The `/mcp` command reads the configuration at startup.

## 🛠️ Fix Steps

### Step 1: Verify Configuration
Your configuration is correct. Run this to confirm:
```bash
cat ~/.claude/settings.json | jq '.mcpServers | keys'
```

Expected output:
```json
[
  "context7",
  "firebase",
  "gcp",
  "github",
  "playwright",
  "vercel"
]
```

### Step 2: Restart Claude Code Session
You have **two options**:

**Option A: Exit and restart this Claude Code session**
1. Type `exit` or press Ctrl+D to quit this session
2. Start a new Claude Code session:
   ```bash
   cd /Users/dino/ainex/habitnex-app
   claude
   ```
3. Type `/mcp` to see all servers

**Option B: Start a fresh session in a new terminal**
1. Open a new terminal window
2. Navigate to your project:
   ```bash
   cd /Users/dino/ainex/habitnex-app
   ```
3. Start Claude Code:
   ```bash
   claude
   ```
4. Type `/mcp` to list all MCP servers

### Step 3: Verify MCP Servers Load
After restarting, you should see output similar to:
```
Available MCP Servers:

  playwright - E2E browser testing and automation
  context7 - Up-to-date code documentation and library examples
  firebase - Official Firebase MCP - uses current working directory
  gcp - Official Google Cloud MCP - interact with GCP using gcloud CLI
  vercel - Official Vercel MCP - OAuth-based access to Vercel projects
  github - GitHub repository management and operations
```

## 🧪 Test MCP Server Functionality

Once you can see them in `/mcp`, test each server:

### Test Context7
```
use context7 to get the latest Next.js 15 documentation
```

### Test Firebase
```
list all Firestore collections in my Firebase project
```

### Test Vercel
```
list my Vercel projects
```
(Will prompt for OAuth authentication on first use)

### Test GCP
```
show me recent logs from my GCP project habittracker-eb6bd
```

### Test GitHub
```
list repositories in the ainexllc organization
```

### Test Playwright
```
help me set up a Playwright test for the login page
```

## 🐛 Still Not Working?

If after restarting you still can't see MCP servers:

### Check 1: Validate JSON Syntax
```bash
cat ~/.claude/settings.json | jq empty
```
(No output = valid JSON, Error message = syntax error)

### Check 2: Verify File Permissions
```bash
ls -la ~/.claude/settings.json
```
Should show: `-rw-r--r--` (readable by you)

### Check 3: Check Claude Code Version
```bash
claude --version
```
MCP support requires Claude Code v1.0.0 or later

### Check 4: View Startup Logs
When you start Claude Code, watch for MCP-related messages.
If servers fail to load, you'll see error messages during startup.

## 📝 Configuration Reference

Your current global MCP configuration is at:
**File**: `~/.claude/settings.json`

Example of a working MCP server entry:
```json
{
  "mcpServers": {
    "vercel": {
      "url": "https://mcp.vercel.com",
      "transport": "http",
      "description": "Official Vercel MCP"
    },
    "firebase": {
      "command": "npx",
      "args": ["-y", "firebase-tools@latest", "experimental:mcp"],
      "env": {},
      "description": "Official Firebase MCP"
    }
  }
}
```

## 🎯 Expected Behavior

After restarting Claude Code:

1. **Startup**: MCP servers load automatically
2. **Type `/mcp`**: Shows all 6 configured servers
3. **Use naturally**: "use firebase to list my projects"
4. **OAuth prompts**: Vercel will ask for auth on first use

## ⚡ Quick Test Command

To quickly verify everything works after restart:
```
/mcp
```

You should see 6 servers listed with descriptions.

---

## 🆘 Emergency Reset

If nothing works, you can temporarily test with a minimal config:

1. Backup current config:
   ```bash
   cp ~/.claude/settings.json ~/.claude/settings.json.backup
   ```

2. Create minimal test config:
   ```bash
   echo '{
     "mcpServers": {
       "context7": {
         "command": "npx",
         "args": ["-y", "@upstash/context7-mcp"],
         "description": "Test MCP"
       }
     }
   }' > ~/.claude/settings.json
   ```

3. Restart Claude Code and test `/mcp`

4. If it works, restore your full config:
   ```bash
   mv ~/.claude/settings.json.backup ~/.claude/settings.json
   ```

---

**TL;DR**: Your MCP servers are configured correctly. **Restart Claude Code** (exit this session and start a new one) and type `/mcp` - you should see all 6 servers! 🚀
