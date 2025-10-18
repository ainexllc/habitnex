import { redirect } from 'next/navigation';

/**
 * Temporary shim to route legacy /dashboard requests to the new /workspace path.
 * Remove once all external links and tests target /workspace directly.
 */
export default function DashboardRedirectPage() {
  redirect('/workspace');
}
