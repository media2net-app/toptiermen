import { redirect } from 'next/navigation';

export default function PreLaunchPage() {
  // Permanent redirect to prelaunch packages page
  redirect('/pakketten/prelaunchkorting');
}
