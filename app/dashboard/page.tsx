import { redirect } from 'next/navigation';

/**
 * Legacy /dashboard route - redirects to /workspace
 */
export default function DashboardRedirectPage() {
  redirect('/workspace');
}
