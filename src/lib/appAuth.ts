const DEFAULT_APP_LOGIN_URL = 'https://gauset-app.vercel.app/login';

function normalizeExternalUrl(value?: string) {
    const trimmed = value?.trim();
    if (!trimmed) {
        return null;
    }

    try {
        return new URL(trimmed).toString();
    } catch {
        return null;
    }
}

function resolveAppUrl(pathname: string) {
    const url = new URL(normalizeExternalUrl(process.env.NEXT_PUBLIC_GAUSET_APP_LOGIN_URL) ?? DEFAULT_APP_LOGIN_URL);
    url.pathname = pathname;
    url.search = '';
    return url;
}

export function buildAppUrl(pathname: string, options?: {
    next?: string | null;
    email?: string | null;
}) {
    const url = resolveAppUrl(pathname);
    const next = options?.next?.trim();
    const email = options?.email?.trim();

    if (next) {
        url.searchParams.set('next', next);
    }

    if (email) {
        url.searchParams.set('email', email);
    }

    return url.toString();
}

export function buildAppLoginUrl(options?: {
    next?: string | null;
    email?: string | null;
}) {
    return buildAppUrl('/login', options);
}
