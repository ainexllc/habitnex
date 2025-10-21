/**
 * @deprecated FamilyContext is deprecated. Use WorkspaceContext instead.
 * This file re-exports WorkspaceContext for backward compatibility.
 *
 * Migration Path:
 * - useFamily() → useWorkspace()
 * - currentFamily → currentWorkspace
 * - createNewFamily() → createNewWorkspace()
 * - All "family" references → "workspace"
 *
 * This file will be removed in a future version.
 */

'use client';

// Re-export everything from WorkspaceContext for backward compatibility
export {
  WorkspaceProvider as FamilyProvider,
  useWorkspace as useFamily,
  useWorkspaceStatus as useFamilyStatus,
  useWorkspaceMember as useFamilyMember
} from './WorkspaceContext';

// Type re-exports for backward compatibility
export type {
  WorkspaceContextType as FamilyContextType
} from './WorkspaceContext';
