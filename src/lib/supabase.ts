// Supabase REST client — uses fetch directly, no SDK dependency needed
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SUPABASE_JWT_KEY_PATTERN = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

function createSupabaseHeaders() {
    const headers: Record<string, string> = {
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
    };

    if (SUPABASE_JWT_KEY_PATTERN.test(SUPABASE_SERVICE_KEY.trim())) {
        headers.Authorization = `Bearer ${SUPABASE_SERVICE_KEY}`;
    }

    return headers;
}

export async function supabaseInsert(table: string, data: Record<string, unknown>) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: createSupabaseHeaders(),
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        // Supabase REST API returns JSON with code/message on error
        const errorBody = await res.json().catch(() => ({ code: String(res.status), message: res.statusText }));
        return { error: { code: errorBody.code || String(res.status), message: errorBody.message || res.statusText } };
    }

    return { error: null };
}
