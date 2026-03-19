import { redirect } from 'next/navigation';
import { buildAppUrl } from '@/lib/appAuth';

export default async function DashboardPage() {
    redirect(buildAppUrl('/app/dashboard'));
}
