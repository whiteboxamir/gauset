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

export function hasConfiguredExternalAppHost() {
    return Boolean(normalizeExternalUrl(process.env.NEXT_PUBLIC_GAUSET_APP_LOGIN_URL));
}

function resolveAppUrl(pathname: string) {
    const externalBaseUrl = normalizeExternalUrl(process.env.NEXT_PUBLIC_GAUSET_APP_LOGIN_URL);
    if (!externalBaseUrl) {
        return null;
    }

    const url = new URL(externalBaseUrl);
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

    if (!url) {
        const searchParams = new URLSearchParams();
        if (next) {
            searchParams.set('next', next);
        }
        if (email) {
            searchParams.set('email', email);
        }

        const search = searchParams.toString();
        return search ? `${pathname}?${search}` : pathname;
    }

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
