import { currentUser, auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserRSVPs, getUserContactSubmissions, getUserSubmissionCounts } from '@/lib/supabase';
import { isFeatureEnabled } from '@/lib/featureFlags';
import DashboardTabs from '@/components/DashboardTabs';

export default async function DashboardPage() {
  // Check if authentication is enabled
  const isAuthEnabled = isFeatureEnabled('showClerkAuth');
  
  if (!isAuthEnabled) {
    redirect('/');
  }
  
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  await auth();

  // Get user's submissions and counts
  const [rsvps, contactSubmissions, counts] = await Promise.all([
    getUserRSVPs(user.id),
    getUserContactSubmissions(user.id),
    getUserSubmissionCounts(user.id),
  ]);

  const userName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || 'Usuario';

  const serializableUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddresses: user.emailAddresses.map(ea => ({ emailAddress: ea.emailAddress })),
    createdAt: user.createdAt,
    lastSignInAt: user.lastSignInAt,
  };

  return (
    <DashboardTabs
      user={serializableUser}
      rsvps={rsvps}
      contactSubmissions={contactSubmissions}
      counts={counts}
      userName={userName}
    />
  );
}
