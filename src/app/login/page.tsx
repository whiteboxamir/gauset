import { redirect } from 'next/navigation';

import { buildAppLoginUrl } from '@/lib/appAuth';

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ next?: string; email?: string }>;
}) {
    const params = await searchParams;
    redirect(buildAppLoginUrl({
        next: params.next ?? null,
        email: params.email ?? null,
    }));
}
