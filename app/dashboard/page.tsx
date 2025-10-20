import { redirect } from 'next/navigation';

/**
 * Temporary shim to route legacy /dashboard requests to the root workspace view.
 */
export default function DashboardRedirectPage() {
  redirect('/workspace?tab=overview');
}
