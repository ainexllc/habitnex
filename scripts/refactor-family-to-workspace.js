#!/usr/bin/env node

/**
 * Automated Family → Workspace Refactoring Script
 *
 * This script performs systematic find-replace operations to refactor
 * the codebase from "family" terminology to "workspace" terminology.
 *
 * Usage:
 *   node scripts/refactor-family-to-workspace.js [--dry-run] [--file=path]
 *
 * Options:
 *   --dry-run  Show what would be changed without modifying files
 *   --file=X   Only refactor specific file
 */

const fs = require('fs');
const path = require('path');

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const SPECIFIC_FILE = process.argv.find(arg => arg.startsWith('--file='))?.split('=')[1];

// Transformation rules (order matters!)
const TRANSFORMATIONS = [
  // Firestore collection paths
  { from: /families\//g, to: 'workspaces/', desc: 'Firestore collection path' },
  { from: /'families'/g, to: "'workspaces'", desc: 'Firestore collection string' },
  { from: /"families"/g, to: '"workspaces"', desc: 'Firestore collection string' },
  { from: /`families`/g, to: '`workspaces`', desc: 'Firestore collection template' },

  // Type names (PascalCase)
  { from: /FamilyDashboardData/g, to: 'WorkspaceDashboardData', desc: 'Type' },
  { from: /FamilyHabitCompletion/g, to: 'WorkspaceHabitCompletion', desc: 'Type' },
  { from: /FamilyMoodEntry/g, to: 'WorkspaceMoodEntry', desc: 'Type' },
  { from: /FamilyChallenge/g, to: 'WorkspaceChallenge', desc: 'Type' },
  { from: /FamilyAnalytics/g, to: 'WorkspaceAnalytics', desc: 'Type' },
  { from: /FamilySettings/g, to: 'WorkspaceSettings', desc: 'Type' },
  { from: /FamilyMember/g, to: 'WorkspaceMember', desc: 'Type' },
  { from: /FamilyHabit/g, to: 'WorkspaceHabit', desc: 'Type' },
  { from: /FamilyRole/g, to: 'WorkspaceRole', desc: 'Type' },
  { from: /FamilyTabId/g, to: 'WorkspaceTabId', desc: 'Type' },
  { from: /\bFamily\b/g, to: 'Workspace', desc: 'Type' }, // Word boundary to avoid FamilyHabit etc.

  // Function names (camelCase)
  { from: /createFamily\(/g, to: 'createWorkspace(', desc: 'Function' },
  { from: /joinFamily\(/g, to: 'joinWorkspace(', desc: 'Function' },
  { from: /getFamily\(/g, to: 'getWorkspace(', desc: 'Function' },
  { from: /updateFamily\(/g, to: 'updateWorkspace(', desc: 'Function' },
  { from: /deleteFamily\(/g, to: 'deleteWorkspace(', desc: 'Function' },
  { from: /getUserFamilies\(/g, to: 'getUserWorkspaces(', desc: 'Function' },
  { from: /getFamilyDashboardData\(/g, to: 'getWorkspaceDashboardData(', desc: 'Function' },
  { from: /subscribeFamilyData\(/g, to: 'subscribeWorkspaceData(', desc: 'Function' },
  { from: /addDirectFamilyMember\(/g, to: 'addDirectWorkspaceMember(', desc: 'Function' },
  { from: /updateFamilyMember\(/g, to: 'updateWorkspaceMember(', desc: 'Function' },
  { from: /updateFamilySettings\(/g, to: 'updateWorkspaceSettings(', desc: 'Function' },
  { from: /updateFamilyName\(/g, to: 'updateWorkspaceName(', desc: 'Function' },
  { from: /getFamilyHabits\(/g, to: 'getWorkspaceHabits(', desc: 'Function' },
  { from: /createFamilyHabit\(/g, to: 'createWorkspaceHabit(', desc: 'Function' },
  { from: /updateFamilyHabit\(/g, to: 'updateWorkspaceHabit(', desc: 'Function' },
  { from: /deleteFamilyHabit\(/g, to: 'deleteWorkspaceHabit(', desc: 'Function' },
  { from: /toggleFamilyHabitCompletion\(/g, to: 'toggleWorkspaceHabitCompletion(', desc: 'Function' },
  { from: /getFamilyChallenges\(/g, to: 'getWorkspaceChallenges(', desc: 'Function' },
  { from: /getFamilyRewards\(/g, to: 'getWorkspaceRewards(', desc: 'Function' },
  { from: /recoverOrphanedFamilies\(/g, to: 'recoverOrphanedWorkspaces(', desc: 'Function' },

  // Variable and parameter names
  { from: /familyId:/g, to: 'workspaceId:', desc: 'Parameter' },
  { from: /familyId\)/g, to: 'workspaceId)', desc: 'Parameter' },
  { from: /familyId,/g, to: 'workspaceId,', desc: 'Parameter' },
  { from: /familyId\s/g, to: 'workspaceId ', desc: 'Variable' },
  { from: /familyData/g, to: 'workspaceData', desc: 'Variable' },
  { from: /currentFamily/g, to: 'currentWorkspace', desc: 'Variable' },
  { from: /userFamilies/g, to: 'userWorkspaces', desc: 'Variable' },

  // Property names in objects
  { from: /"familyId"/g, to: '"workspaceId"', desc: 'Object property' },
  { from: /'familyId'/g, to: "'workspaceId'", desc: 'Object property' },

  // Comments and strings (be careful not to change user-facing text)
  { from: /\/\/ Family/g, to: '// Workspace', desc: 'Comment' },
  { from: /\/\* Family/g, to: '/* Workspace', desc: 'Comment' },
  { from: /\* Family/g, to: '* Workspace', desc: 'Comment' },

  // Context and hook names
  { from: /FamilyContext/g, to: 'WorkspaceContext', desc: 'Context' },
  { from: /FamilyProvider/g, to: 'WorkspaceProvider', desc: 'Provider' },
  { from: /useFamily\(/g, to: 'useWorkspace(', desc: 'Hook' },
  { from: /useFamilyData\(/g, to: 'useWorkspaceData(', desc: 'Hook' },
  { from: /useFamilyHabits\(/g, to: 'useWorkspaceHabits(', desc: 'Hook' },
  { from: /useFamilyMembers\(/g, to: 'useWorkspaceMembers(', desc: 'Hook' },
  { from: /useFamilyAnalytics\(/g, to: 'useWorkspaceAnalytics(', desc: 'Hook' },
  { from: /useFamilyChallenges\(/g, to: 'useWorkspaceChallenges(', desc: 'Hook' },
  { from: /useFamilyRewards\(/g, to: 'useWorkspaceRewards(', desc: 'Hook' },

  // File imports
  { from: /@\/lib\/familyDb/g, to: '@/lib/workspaceDb', desc: 'Import path' },
  { from: /@\/lib\/familyRecovery/g, to: '@/lib/workspaceRecovery', desc: 'Import path' },
  { from: /@\/types\/family/g, to: '@/types/workspace', desc: 'Import path' },
  { from: /@\/contexts\/FamilyContext/g, to: '@/contexts/WorkspaceContext', desc: 'Import path' },
  { from: /@\/components\/family\//g, to: '@/components/workspace/', desc: 'Import path' },

  // Route paths
  { from: /\/family\//g, to: '/workspace/', desc: 'Route path' },
  { from: /startsWith\('\/family'\)/g, to: "startsWith('/workspace')", desc: 'Route check' },
  { from: /startsWith\("\/family"\)/g, to: 'startsWith("/workspace")', desc: 'Route check' },

  // Component names
  { from: /FamilyDashboard/g, to: 'WorkspaceDashboard', desc: 'Component' },
  { from: /FamilyHeader/g, to: 'WorkspaceHeader', desc: 'Component' },
  { from: /FamilyLayout/g, to: 'WorkspaceLayout', desc: 'Component' },
  { from: /FamilyNav/g, to: 'WorkspaceNav', desc: 'Component' },
  { from: /FamilyHabitForm/g, to: 'WorkspaceHabitForm', desc: 'Component' },
  { from: /FamilyMemberCard/g, to: 'WorkspaceMemberCard', desc: 'Component' },

  // Database field names (be careful - these are in Firestore documents!)
  // Note: These will need manual migration in the database
  { from: /updateUserSelectedFamily\(/g, to: 'updateUserSelectedWorkspace(', desc: 'DB function' },
  { from: /getUserSelectedFamily\(/g, to: 'getUserSelectedWorkspace(', desc: 'DB function' },
  { from: /clearUserSelectedFamily\(/g, to: 'clearUserSelectedWorkspace(', desc: 'DB function' },
];

// Files to process
const FILES_TO_PROCESS = [
  'lib/familyDb.ts',
  'lib/familyRecovery.ts',
  // Add more files as needed
];

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function processFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  const outputPath = fullPath.replace(/family/g, 'workspace');

  // Check if file exists
  if (!fs.existsSync(fullPath)) {
    log(`❌ File not found: ${filePath}`, 'red');
    return;
  }

  log(`\n${'='.repeat(80)}`, 'blue');
  log(`📄 Processing: ${filePath}`, 'bright');
  log(`${'='.repeat(80)}`, 'blue');

  // Read file
  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;
  let changeCount = 0;
  const changes = [];

  // Apply transformations
  for (const { from, to, desc } of TRANSFORMATIONS) {
    const matches = content.match(from);
    if (matches && matches.length > 0) {
      content = content.replace(from, to);
      changeCount += matches.length;
      changes.push({ desc, count: matches.length, from: from.source });
      log(`  ✓ ${desc}: ${matches.length} replacements`, 'green');
    }
  }

  // Summary
  log(`\n📊 Summary:`, 'bright');
  log(`  Total changes: ${changeCount}`, changeCount > 0 ? 'green' : 'yellow');
  log(`  Output file: ${outputPath}`, 'blue');

  // Write file (or show diff in dry-run mode)
  if (DRY_RUN) {
    log(`\n🔍 DRY RUN - No files modified`, 'yellow');
    log(`\nChanges that would be made:`, 'yellow');
    changes.forEach(({ desc, count, from }) => {
      log(`  • ${desc}: ${count} × "${from}"`, 'yellow');
    });
  } else {
    // Create output directory if it doesn't exist
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write transformed content
    fs.writeFileSync(outputPath, content, 'utf8');
    log(`\n✅ File written successfully!`, 'green');

    // Also create a backup of the original
    const backupPath = fullPath + '.backup';
    if (!fs.existsSync(backupPath)) {
      fs.writeFileSync(backupPath, originalContent, 'utf8');
      log(`💾 Backup created: ${backupPath}`, 'blue');
    }
  }
}

// Main execution
function main() {
  log('\n' + '='.repeat(80), 'bright');
  log('🚀 Family → Workspace Refactoring Script', 'bright');
  log('='.repeat(80) + '\n', 'bright');

  if (DRY_RUN) {
    log('⚠️  DRY RUN MODE - No files will be modified\n', 'yellow');
  }

  if (SPECIFIC_FILE) {
    log(`📌 Processing specific file: ${SPECIFIC_FILE}\n`, 'blue');
    processFile(SPECIFIC_FILE);
  } else {
    log(`📋 Processing ${FILES_TO_PROCESS.length} files...\n`, 'blue');
    FILES_TO_PROCESS.forEach(processFile);
  }

  log('\n' + '='.repeat(80), 'bright');
  log('✨ Refactoring Complete!', 'green');
  log('='.repeat(80) + '\n', 'bright');

  if (!DRY_RUN) {
    log('📝 Next steps:', 'yellow');
    log('  1. Review the generated workspace files', 'yellow');
    log('  2. Run: npm run build', 'yellow');
    log('  3. Fix any TypeScript errors', 'yellow');
    log('  4. Test the application', 'yellow');
    log('  5. Commit changes when ready\n', 'yellow');
  } else {
    log('💡 Run without --dry-run to apply changes\n', 'yellow');
  }
}

main();
