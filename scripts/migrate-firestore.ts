#!/usr/bin/env tsx
/**
 * Firestore Migration Script: families/ → workspaces/
 *
 * This script migrates all Firestore data from the old "families" collection
 * to the new "workspaces" collection structure.
 *
 * Usage:
 *   npm run migrate:firestore -- --dry-run    # Test mode (no changes)
 *   npm run migrate:firestore                 # Execute migration
 *   npm run migrate:firestore -- --rollback   # Rollback to families/
 *
 * Safety features:
 * - Dry run mode for testing
 * - Batch processing with progress tracking
 * - Error handling and logging
 * - Rollback capability
 * - Idempotent (can run multiple times)
 */

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: serviceAccountKey.json not found!');
  console.error('Please download your Firebase service account key and place it in the project root.');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isRollback = args.includes('--rollback');

// Migration statistics
interface MigrationStats {
  workspacesMigrated: number;
  habitsMigrated: number;
  completionsMigrated: number;
  challengesMigrated: number;
  rewardsMigrated: number;
  moodsMigrated: number;
  errors: string[];
  warnings: string[];
}

const stats: MigrationStats = {
  workspacesMigrated: 0,
  habitsMigrated: 0,
  completionsMigrated: 0,
  challengesMigrated: 0,
  rewardsMigrated: 0,
  moodsMigrated: 0,
  errors: [],
  warnings: [],
};

/**
 * Transform family document to workspace document
 */
function transformFamilyToWorkspace(familyData: any, familyId: string): any {
  const workspace = { ...familyData };

  // Add new workspace-specific fields
  if (!workspace.type) {
    workspace.type = 'family'; // Default type based on existing data
  }

  // Update member roles if needed
  if (workspace.members && Array.isArray(workspace.members)) {
    workspace.members = workspace.members.map((member: any) => ({
      ...member,
      workspaceId: familyId, // Keep same ID for backward compatibility
      role: member.role || (member.isParent ? 'admin' : 'member'),
    }));
  }

  return workspace;
}

/**
 * Migrate a single family/workspace with all subcollections
 */
async function migrateSingleWorkspace(workspaceId: string, dryRun: boolean): Promise<void> {
  try {
    console.log(`\n📦 Processing workspace: ${workspaceId}`);

    // Get family document
    const familyRef = db.collection('families').doc(workspaceId);
    const familyDoc = await familyRef.get();

    if (!familyDoc.exists) {
      stats.warnings.push(`Workspace ${workspaceId} not found in families collection`);
      return;
    }

    const familyData = familyDoc.data();
    if (!familyData) {
      stats.warnings.push(`Workspace ${workspaceId} has no data`);
      return;
    }

    // Transform to workspace structure
    const workspaceData = transformFamilyToWorkspace(familyData, workspaceId);

    // Write to workspaces collection
    if (!dryRun) {
      await db.collection('workspaces').doc(workspaceId).set(workspaceData, { merge: true });
    }
    stats.workspacesMigrated++;
    console.log(`  ✓ Workspace migrated`);

    // Migrate subcollections
    await migrateSubcollection(workspaceId, 'habits', dryRun);
    await migrateSubcollection(workspaceId, 'completions', dryRun);
    await migrateSubcollection(workspaceId, 'challenges', dryRun);
    await migrateSubcollection(workspaceId, 'rewards', dryRun);
    await migrateSubcollection(workspaceId, 'moods', dryRun);

  } catch (error) {
    const errorMsg = `Error migrating workspace ${workspaceId}: ${error}`;
    stats.errors.push(errorMsg);
    console.error(`  ❌ ${errorMsg}`);
  }
}

/**
 * Migrate a subcollection
 */
async function migrateSubcollection(
  workspaceId: string,
  subcollectionName: string,
  dryRun: boolean
): Promise<void> {
  try {
    const sourceRef = db.collection('families').doc(workspaceId).collection(subcollectionName);
    const snapshot = await sourceRef.get();

    if (snapshot.empty) {
      console.log(`  ℹ️  No ${subcollectionName} to migrate`);
      return;
    }

    console.log(`  📄 Migrating ${snapshot.size} ${subcollectionName}...`);

    // Batch write for efficiency
    const batch = db.batch();
    let batchCount = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();

      // Transform familyId references to workspaceId
      const transformedData = transformFieldNames(data);

      const targetRef = db.collection('workspaces').doc(workspaceId).collection(subcollectionName).doc(doc.id);

      if (!dryRun) {
        batch.set(targetRef, transformedData, { merge: true });
        batchCount++;

        // Commit batch every 500 documents (Firestore limit)
        if (batchCount >= 500) {
          await batch.commit();
          batchCount = 0;
        }
      }

      // Update stats
      switch (subcollectionName) {
        case 'habits':
          stats.habitsMigrated++;
          break;
        case 'completions':
          stats.completionsMigrated++;
          break;
        case 'challenges':
          stats.challengesMigrated++;
          break;
        case 'rewards':
          stats.rewardsMigrated++;
          break;
        case 'moods':
          stats.moodsMigrated++;
          break;
      }
    }

    // Commit remaining documents
    if (!dryRun && batchCount > 0) {
      await batch.commit();
    }

    console.log(`  ✓ ${subcollectionName} migrated`);

  } catch (error) {
    const errorMsg = `Error migrating ${subcollectionName} for workspace ${workspaceId}: ${error}`;
    stats.errors.push(errorMsg);
    console.error(`  ❌ ${errorMsg}`);
  }
}

/**
 * Transform field names in document data (familyId → workspaceId)
 */
function transformFieldNames(data: any): any {
  if (!data || typeof data !== 'object') return data;

  const transformed: any = {};

  for (const [key, value] of Object.entries(data)) {
    // Transform field names
    let newKey = key;
    if (key === 'familyId') {
      newKey = 'workspaceId';
    }

    // Recursively transform nested objects
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      transformed[newKey] = transformFieldNames(value);
    } else if (Array.isArray(value)) {
      transformed[newKey] = value.map(item =>
        typeof item === 'object' ? transformFieldNames(item) : item
      );
    } else {
      transformed[newKey] = value;
    }
  }

  return transformed;
}

/**
 * Rollback: Copy workspaces/ back to families/
 */
async function rollbackMigration(dryRun: boolean): Promise<void> {
  console.log('\n🔄 Starting rollback: workspaces/ → families/');

  const workspacesSnapshot = await db.collection('workspaces').get();

  console.log(`Found ${workspacesSnapshot.size} workspaces to rollback`);

  for (const doc of workspacesSnapshot.docs) {
    try {
      const workspaceData = doc.data();
      const workspaceId = doc.id;

      console.log(`\n📦 Rolling back workspace: ${workspaceId}`);

      // Write back to families collection
      if (!dryRun) {
        await db.collection('families').doc(workspaceId).set(workspaceData, { merge: true });
      }

      // Rollback subcollections
      const subcollections = ['habits', 'completions', 'challenges', 'rewards', 'moods'];
      for (const subcollection of subcollections) {
        await rollbackSubcollection(workspaceId, subcollection, dryRun);
      }

      console.log(`  ✓ Workspace rolled back`);

    } catch (error) {
      console.error(`  ❌ Error rolling back ${doc.id}: ${error}`);
      stats.errors.push(`Rollback error for ${doc.id}: ${error}`);
    }
  }
}

/**
 * Rollback a subcollection
 */
async function rollbackSubcollection(
  workspaceId: string,
  subcollectionName: string,
  dryRun: boolean
): Promise<void> {
  const sourceRef = db.collection('workspaces').doc(workspaceId).collection(subcollectionName);
  const snapshot = await sourceRef.get();

  if (snapshot.empty) return;

  console.log(`  📄 Rolling back ${snapshot.size} ${subcollectionName}...`);

  const batch = db.batch();
  let batchCount = 0;

  for (const doc of snapshot.docs) {
    const targetRef = db.collection('families').doc(workspaceId).collection(subcollectionName).doc(doc.id);

    if (!dryRun) {
      batch.set(targetRef, doc.data(), { merge: true });
      batchCount++;

      if (batchCount >= 500) {
        await batch.commit();
        batchCount = 0;
      }
    }
  }

  if (!dryRun && batchCount > 0) {
    await batch.commit();
  }
}

/**
 * Main migration function
 */
async function runMigration(): Promise<void> {
  const mode = isDryRun ? '🧪 DRY RUN MODE' : '🚀 LIVE MIGRATION MODE';
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${mode}`);
  console.log(`${'='.repeat(60)}\n`);

  if (isRollback) {
    await rollbackMigration(isDryRun);
  } else {
    // Get all families
    const familiesSnapshot = await db.collection('families').get();

    console.log(`Found ${familiesSnapshot.size} workspaces to migrate\n`);

    if (familiesSnapshot.empty) {
      console.log('⚠️  No families found to migrate');
      return;
    }

    // Migrate each workspace
    for (const doc of familiesSnapshot.docs) {
      await migrateSingleWorkspace(doc.id, isDryRun);
    }
  }

  // Print summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 MIGRATION SUMMARY');
  console.log(`${'='.repeat(60)}`);
  console.log(`Workspaces migrated:   ${stats.workspacesMigrated}`);
  console.log(`Habits migrated:       ${stats.habitsMigrated}`);
  console.log(`Completions migrated:  ${stats.completionsMigrated}`);
  console.log(`Challenges migrated:   ${stats.challengesMigrated}`);
  console.log(`Rewards migrated:      ${stats.rewardsMigrated}`);
  console.log(`Moods migrated:        ${stats.moodsMigrated}`);
  console.log(`Errors:                ${stats.errors.length}`);
  console.log(`Warnings:              ${stats.warnings.length}`);
  console.log(`${'='.repeat(60)}\n`);

  if (stats.errors.length > 0) {
    console.log('❌ ERRORS:');
    stats.errors.forEach(error => console.log(`  - ${error}`));
    console.log('');
  }

  if (stats.warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    stats.warnings.forEach(warning => console.log(`  - ${warning}`));
    console.log('');
  }

  if (isDryRun) {
    console.log('✅ Dry run completed! No changes were made to the database.');
    console.log('Run without --dry-run to execute the migration.\n');
  } else {
    console.log('✅ Migration completed successfully!\n');
  }
}

// Run migration
runMigration()
  .then(() => {
    process.exit(stats.errors.length > 0 ? 1 : 0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
