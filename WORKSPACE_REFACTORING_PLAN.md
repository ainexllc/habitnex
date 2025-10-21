# HabitNex: Family → Workspace Refactoring Plan

**Project**: Complete refactoring from "family" to "workspace" terminology
**Goal**: Support individuals, couples, families, teams, and organizations
**Estimated Effort**: 40-60 hours
**Risk Level**: HIGH (database migration, cascading changes)
**Date**: October 2025

---

## Executive Summary

This document outlines the complete refactoring strategy to rename all "family" references to "workspace" throughout the HabitNex application. This change affects:

- **72+ files** across the codebase
- **Database collections** in Firestore
- **Security rules** and indexes
- **User-facing URLs** and navigation
- **Type definitions** and interfaces

---

## Terminology Mapping

| Old Term | New Term | Context |
|----------|----------|---------|
| Family | Workspace | Main entity |
| FamilyMember | WorkspaceMember | Individual in workspace |
| FamilyHabit | WorkspaceHabit | Shared habits |
| FamilyChallenge | WorkspaceChallenge | Group competitions |
| familyId | workspaceId | Database identifiers |
| families/ | workspaces/ | Firestore collection |
| /family/* | /workspace/* | Routes |

---

## Phase Breakdown

### Phase 1: TypeScript Types ✅
**Files**: `types/family.ts` → `types/workspace.ts`
**Effort**: 2-3 hours
**Risk**: Medium (TypeScript errors will cascade)

**Changes**:
- Rename `Family` → `Workspace`
- Add `type: 'personal' | 'family' | 'couple' | 'team' | 'organization'`
- Update `FamilyMember.role` to generic roles: `'owner' | 'admin' | 'member' | 'viewer'`
- Rename all interfaces with Family prefix
- Update 413 lines of type definitions

**Strategy**:
1. Create new `workspace.ts` file first
2. Keep `family.ts` temporarily with deprecated warnings
3. Update imports incrementally

---

### Phase 2: Context Provider ✅
**Files**: `contexts/FamilyContext.tsx` → `contexts/WorkspaceContext.tsx`
**Effort**: 3-4 hours
**Risk**: High (central state management)

**Changes**:
- Rename context: `FamilyContext` → `WorkspaceContext`
- Update all function names: `createFamily()` → `createWorkspace()`
- Update state variables: `currentFamily` → `currentWorkspace`
- Update 575 lines of context code

**Strategy**:
1. Create new WorkspaceContext alongside FamilyContext
2. Dual-provide both contexts temporarily
3. Switch consumers one component at a time
4. Remove FamilyContext when all consumers migrated

---

### Phase 3: Database Layer ✅
**Files**: `lib/familyDb.ts` → `lib/workspaceDb.ts`
**Effort**: 5-6 hours
**Risk**: CRITICAL (all data operations)

**Changes**:
- Rename 30+ database functions
- Update Firestore collection paths: `families/` → `workspaces/`
- Update 1,515 lines of database operations
- Create abstraction for backward compatibility

**Strategy**:
1. Create new `workspaceDb.ts` with new collection names
2. Add compatibility layer to read from both `families/` and `workspaces/`
3. Migration script will copy data to new collections
4. Keep old functions available with deprecation warnings

---

### Phase 4: Custom Hooks ✅
**Files**: 6 hook files in `/hooks/`
**Effort**: 2-3 hours
**Risk**: Medium

**Changes**:
- `useFamilyData.ts` → `useWorkspaceData.ts`
- `useFamilyHabits.ts` → `useWorkspaceHabits.ts`
- `useFamilyMembers.ts` → `useWorkspaceMembers.ts`
- `useFamilyAnalytics.ts` → `useWorkspaceAnalytics.ts`
- `useFamilyChallenges.ts` → `useWorkspaceChallenges.ts`
- `useFamilyRewards.ts` → `useWorkspaceRewards.ts`

**Strategy**: Sequential replacement, test each hook

---

### Phase 5: Components ✅
**Files**: 31+ components in `/components/family/`
**Effort**: 8-10 hours
**Risk**: Medium-High

**Changes**:
- Move `/components/family/*` → `/components/workspace/*`
- Rename all component files and exports
- Update internal references and props
- Update imports in consuming files

**Component Categories**:
- Layout components (5 files)
- Tab components (8 files)
- Modal components (7 files)
- Feature components (8 files)
- Form components (3 files)

**Strategy**: Category-by-category migration with testing

---

### Phase 6: App Routes ✅
**Files**: 12 route pages in `/app/family/`
**Effort**: 4-5 hours
**Risk**: High (breaks user navigation)

**Changes**:
- Move `/app/family/*` → `/app/workspace/*`
- Update all route metadata and navigation
- Create redirects for old URLs

**Routes to migrate**:
- `/family` → `/workspace`
- `/family/create` → `/workspace/create`
- `/family/join` → `/workspace/join`
- `/family/onboarding` → `/workspace/onboarding`
- `/family/habits` → `/workspace/habits`
- `/family/members` → `/workspace/members`
- `/family/challenges` → `/workspace/challenges`
- `/family/rewards` → `/workspace/rewards`
- `/family/analytics` → `/workspace/analytics`
- `/family/settings` → `/workspace/settings`

---

### Phase 7: Integration Points ✅
**Files**: AuthContext, GlobalDataContext, layouts, etc.
**Effort**: 3-4 hours
**Risk**: High

**Changes**:
- Update `AuthContext.tsx` - family references
- Update `GlobalDataContext.tsx` - data scoping
- Update `app/layout.tsx` - navigation links
- Update middleware if any family checks exist

---

### Phase 8: Database Migration Script 🔥
**Files**: Create `/scripts/migrate-family-to-workspace.ts`
**Effort**: 6-8 hours
**Risk**: CRITICAL (data loss potential)

**Migration Strategy**:
1. **Backup**: Export all `families/` data
2. **Copy**: Duplicate to `workspaces/` collection
3. **Update User References**: Update `users/{userId}/currentFamilyId` → `currentWorkspaceId`
4. **Verify**: Check data integrity
5. **Cleanup**: Remove old `families/` collection (after verification period)

**Script Requirements**:
- Idempotent (can run multiple times safely)
- Progress tracking and logging
- Rollback capability
- Dry-run mode for testing

---

### Phase 9: Firestore Security Rules 🔥
**Files**: `firestore.rules`, `firestore.indexes.json`
**Effort**: 2-3 hours
**Risk**: CRITICAL (security breach potential)

**Changes**:
```javascript
// Before
match /families/{familyId} {
  allow read, write: if request.auth != null && isFamilyMember(familyId);
}

// After
match /workspaces/{workspaceId} {
  allow read, write: if request.auth != null && isWorkspaceMember(workspaceId);
}
```

**Strategy**:
1. Add new `workspaces/` rules alongside `families/`
2. Deploy rules before migration
3. Keep both active during transition
4. Remove `families/` rules after full migration

---

### Phase 10: URL Redirects ✅
**Files**: `next.config.js`, middleware
**Effort**: 1-2 hours
**Risk**: Low

**Implementation**:
```javascript
// next.config.js
async redirects() {
  return [
    {
      source: '/family/:path*',
      destination: '/workspace/:path*',
      permanent: true,
    },
  ]
}
```

---

### Phase 11: Build & TypeScript ✅
**Effort**: 4-6 hours
**Risk**: High (many errors expected)

**Process**:
1. Run `npm run build`
2. Fix TypeScript errors iteratively
3. Update any missed imports
4. Resolve type mismatches
5. Test compilation passes

---

### Phase 12: Testing ✅
**Effort**: 6-8 hours
**Risk**: High

**Test Coverage**:
- ✅ Workspace creation flow
- ✅ Member invitation and joining
- ✅ Habit creation and completion
- ✅ Challenge participation
- ✅ Reward redemption
- ✅ Analytics display
- ✅ Settings management
- ✅ URL redirects work
- ✅ Database migration successful
- ✅ Security rules enforced

**Testing Approach**:
- Unit tests for database functions
- Integration tests for hooks
- E2E tests with Playwright
- Manual testing of critical flows

---

### Phase 13: Deployment 🚀
**Effort**: 2-3 hours
**Risk**: CRITICAL

**Deployment Checklist**:
- [ ] Backup production database
- [ ] Run migration script in staging
- [ ] Verify data in staging
- [ ] Deploy security rules to production
- [ ] Run migration script in production
- [ ] Deploy new application code
- [ ] Monitor error logs
- [ ] Verify user access
- [ ] Test critical flows in production
- [ ] Announce changes to users

**Rollback Plan**:
- Keep old `families/` collection for 30 days
- Can revert code to previous version
- Can restore from backup if needed

---

## Risk Mitigation

### High-Risk Areas

1. **Database Migration**
   - Risk: Data loss or corruption
   - Mitigation: Full backup, dry-run testing, gradual rollout

2. **TypeScript Cascading Errors**
   - Risk: Hundreds of compile errors
   - Mitigation: Incremental refactoring, keep deprecated types temporarily

3. **User Navigation Breakage**
   - Risk: Bookmarks and deep links break
   - Mitigation: Permanent redirects, user communication

4. **Security Rules**
   - Risk: Unauthorized data access
   - Mitigation: Test rules in staging, deploy before migration

### Testing Strategy

- **Local**: Full refactoring and testing in development
- **Staging**: Complete migration dry-run
- **Production**: Off-peak deployment with monitoring

---

## Success Criteria

- ✅ All 72+ files successfully refactored
- ✅ Zero TypeScript compilation errors
- ✅ All database operations work with new collections
- ✅ Security rules properly enforced
- ✅ URL redirects functional
- ✅ All existing data migrated successfully
- ✅ E2E tests passing
- ✅ Production deployment successful
- ✅ No user-reported issues after 7 days

---

## Timeline Estimate

| Phase | Effort | Dependencies |
|-------|--------|--------------|
| 1. Types | 2-3h | None |
| 2. Context | 3-4h | Phase 1 |
| 3. Database Layer | 5-6h | Phase 1 |
| 4. Hooks | 2-3h | Phases 1-3 |
| 5. Components | 8-10h | Phases 1-4 |
| 6. Routes | 4-5h | Phases 1-5 |
| 7. Integration | 3-4h | Phases 1-6 |
| 8. Migration Script | 6-8h | Phase 3 |
| 9. Security Rules | 2-3h | Phase 8 |
| 10. Redirects | 1-2h | Phase 6 |
| 11. Build/Fix | 4-6h | Phases 1-7 |
| 12. Testing | 6-8h | Phases 1-11 |
| 13. Deployment | 2-3h | All phases |

**Total**: 48-65 hours (approximately 1-2 weeks full-time)

---

## Notes

- This is a **breaking change** requiring careful execution
- Consider announcing to users before deployment
- Monitor error logs closely after deployment
- Keep old `families/` collection for 30 days as backup
- Document new "workspace" concept for users

---

## Next Steps

1. Review and approve this plan
2. Create feature branch: `refactor/family-to-workspace`
3. Begin Phase 1: Type definitions
4. Test after each phase
5. Commit frequently with clear messages

---

**Status**: READY FOR EXECUTION
**Approved by**: [Pending]
**Start Date**: [TBD]
**Target Completion**: [TBD]
