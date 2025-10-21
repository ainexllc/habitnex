# Firestore Migration Guide: families/ → workspaces/

This guide explains how to migrate your Firestore database from the old `families/` collection structure to the new `workspaces/` collection structure.

## 📋 Overview

The migration renames the main collection and transforms field names to support the new workspace paradigm:

**Collection Changes:**
- `families/` → `workspaces/`

**Field Changes:**
- `familyId` → `workspaceId` (throughout all documents)
- Added `type` field to workspaces (defaults to `'family'`)
- Updated member roles to support new workspace role system

**Subcollections Migrated:**
- `habits/`
- `completions/`
- `challenges/`
- `rewards/`
- `moods/`

## 🔧 Prerequisites

### 1. Firebase Service Account Key

Download your Firebase service account key:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Save the downloaded JSON file as `serviceAccountKey.json` in the project root

⚠️ **IMPORTANT**: Never commit `serviceAccountKey.json` to version control!

### 2. Install Dependencies

The migration script requires `tsx` to run TypeScript directly:

```bash
npm install -D tsx
```

## 🚀 Migration Steps

### Step 1: Backup Your Database

**CRITICAL**: Always backup your database before migration!

#### Option A: Firestore Export (Recommended)

```bash
# Export to a Cloud Storage bucket
gcloud firestore export gs://[BUCKET_NAME]/backup-$(date +%Y%m%d)
```

#### Option B: Manual Backup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to **Firestore Database**
3. Export data manually or use the Firestore export tool

### Step 2: Run Dry Run

Test the migration without making any changes:

```bash
npm run migrate:firestore:dry-run
```

Expected output:
```
=============================================================
🧪 DRY RUN MODE
=============================================================

Found 5 workspaces to migrate

📦 Processing workspace: abc123
  ✓ Workspace migrated
  📄 Migrating 12 habits...
  ✓ habits migrated
  📄 Migrating 145 completions...
  ✓ completions migrated
  ...

=============================================================
📊 MIGRATION SUMMARY
=============================================================
Workspaces migrated:   5
Habits migrated:       45
Completions migrated:  523
Challenges migrated:   8
Rewards migrated:      15
Moods migrated:        342
Errors:                0
Warnings:              0
=============================================================

✅ Dry run completed! No changes were made to the database.
Run without --dry-run to execute the migration.
```

### Step 3: Review Results

Check the dry run output for:
- ✅ Expected number of workspaces
- ✅ No errors
- ⚠️ Review any warnings
- ✅ Subcollection counts look correct

### Step 4: Execute Migration

Once you're confident the dry run looks good:

```bash
npm run migrate:firestore
```

This will:
1. Copy all `families/` documents to `workspaces/`
2. Transform field names (`familyId` → `workspaceId`)
3. Migrate all subcollections
4. Add new fields like `type`
5. Log progress and any errors

### Step 5: Update Security Rules

After migration, deploy the new security rules:

```bash
npm run firebase:rules
npm run firebase:indexes
```

### Step 6: Test Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Test key features:
   - ✅ Login/authentication
   - ✅ View workspaces
   - ✅ View habits and completions
   - ✅ Create new habits
   - ✅ Complete habits
   - ✅ View challenges and rewards
   - ✅ Analytics dashboards

### Step 7: Deploy Updated Code

Once testing is successful:

```bash
npm run build
npm run deploy
```

## 🔄 Rollback

If something goes wrong, you can rollback the migration:

### Option 1: Rollback Script

```bash
npm run migrate:firestore:rollback
```

This copies data from `workspaces/` back to `families/`.

### Option 2: Restore from Backup

```bash
# Restore from Cloud Storage backup
gcloud firestore import gs://[BUCKET_NAME]/backup-20250101
```

## 📊 Migration Script Features

### Safety Features

- **Dry Run Mode**: Test without making changes
- **Batch Processing**: Efficiently handles large datasets
- **Error Handling**: Continues migration even if individual documents fail
- **Progress Tracking**: Real-time feedback on migration status
- **Idempotent**: Can run multiple times safely (uses `merge: true`)
- **Rollback**: Can reverse migration if needed

### Performance

- Processes documents in batches of 500 (Firestore limit)
- Uses batch writes for optimal performance
- Handles large collections efficiently

### Logging

The script logs:
- ✅ Success messages for each workspace
- 📄 Progress for each subcollection
- ⚠️  Warnings for missing or empty collections
- ❌ Errors with detailed messages
- 📊 Summary statistics at the end

## 🛠️ Troubleshooting

### Error: "serviceAccountKey.json not found"

**Solution**: Download your Firebase service account key (see Prerequisites)

### Error: Permission denied

**Solution**: Ensure your service account has the following roles:
- Cloud Datastore User
- Firebase Admin

Grant roles in [IAM Console](https://console.cloud.google.com/iam-admin/iam)

### Migration shows 0 workspaces

**Possible causes:**
1. No data in `families/` collection
2. Service account doesn't have read permissions
3. Wrong Firebase project

**Solution**: Verify in Firebase Console that data exists

### Some documents failed to migrate

**Solution**:
1. Check error messages in migration output
2. Fix specific issues (field validation, missing data, etc.)
3. Re-run migration (it's idempotent)

### Application shows errors after migration

**Possible causes:**
1. Security rules not updated
2. Indexes not deployed
3. Code not fully deployed

**Solution**:
```bash
npm run firebase:deploy    # Deploy rules and indexes
npm run build && npm run deploy  # Deploy updated code
```

## 📝 Migration Checklist

- [ ] Download Firebase service account key
- [ ] Install `tsx` dependency
- [ ] Backup Firestore database
- [ ] Run dry-run migration
- [ ] Review dry-run results
- [ ] Execute live migration
- [ ] Deploy new security rules
- [ ] Deploy new indexes
- [ ] Test application thoroughly
- [ ] Deploy updated code to production
- [ ] Monitor for errors
- [ ] Keep backup for 30 days

## 🔐 Security Notes

### Service Account Key

- ⚠️ Never commit `serviceAccountKey.json` to version control
- ⚠️ Store securely (password manager, secure vault)
- ⚠️ Rotate periodically
- ⚠️ Delete after migration if no longer needed

### Data Privacy

- Migration happens server-side (no data leaves Firebase)
- Original data remains in `families/` collection
- Can delete `families/` collection after successful migration and testing

## 📞 Support

If you encounter issues:

1. Check this guide's Troubleshooting section
2. Review Firebase Console logs
3. Check migration script output for specific errors
4. Review security rules and indexes

## 🎯 Post-Migration

After successful migration:

1. **Monitor**: Watch for errors in production for 1-2 weeks
2. **Performance**: Monitor query performance and index usage
3. **Cleanup**: After 30 days of successful operation, can delete old `families/` collection
4. **Documentation**: Update team documentation with new terminology

---

**Last Updated**: 2025-10-21
**Migration Script Version**: 1.0.0
