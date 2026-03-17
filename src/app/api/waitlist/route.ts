import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { list, put } from '@vercel/blob';
import { supabaseInsert } from '@/lib/supabase';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildWaitlistBlobPath(email: string) {
    const emailHash = createHash('sha256').update(email).digest('hex');
    return `waitlist/${emailHash}.json`;
}

async function hasWaitlistBlobEntry(pathname: string) {
    const result = await list({
        prefix: pathname,
        limit: 1,
    });

    return result.blobs.some((blob) => blob.pathname === pathname);
}

async function insertWaitlistBlobEntry(email: string) {
    const pathname = buildWaitlistBlobPath(email);

    if (await hasWaitlistBlobEntry(pathname)) {
        return { duplicate: true };
    }

    await put(
        pathname,
        JSON.stringify({
            email,
            source: 'gauset.com',
            createdAt: new Date().toISOString(),
        }),
        {
            access: 'public',
            addRandomSuffix: false,
            allowOverwrite: false,
            contentType: 'application/json',
        },
    );

    return { duplicate: false };
}

function hasBlobFallbackConfigured() {
    return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

async function attemptSupabaseInsert(email: string) {
    try {
        const { error } = await supabaseInsert('waitlist', { email });

        if (!error) {
            return { inserted: true, duplicate: false, error: null };
        }

        if (error.code === '23505') {
            return { inserted: false, duplicate: true, error: null };
        }

        return { inserted: false, duplicate: false, error };
    } catch (error) {
        return {
            inserted: false,
            duplicate: false,
            error: {
                code: 'supabase_fetch_failed',
                message: error instanceof Error ? error.message : 'Unknown Supabase error',
            },
        };
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const email = body.email?.trim().toLowerCase();

        // Validate
        if (!email || !EMAIL_REGEX.test(email)) {
            return NextResponse.json(
                { success: false, message: 'Please enter a valid email.' },
                { status: 400 }
            );
        }

        const supabaseResult = await attemptSupabaseInsert(email);

        if (supabaseResult.inserted) {
            return NextResponse.json(
                { success: true, message: "You're in." },
                { status: 201 }
            );
        }

        if (supabaseResult.duplicate) {
            return NextResponse.json(
                { success: true, message: "You're already in. We'll be in touch." },
                { status: 200 }
            );
        }

        console.error('Supabase insert error, switching to Blob fallback:', supabaseResult.error);

        if (!hasBlobFallbackConfigured()) {
            return NextResponse.json(
                { success: false, message: 'Something went wrong. Try again.' },
                { status: 500 }
            );
        }

        const blobResult = await insertWaitlistBlobEntry(email);

        return NextResponse.json(
            {
                success: true,
                message: blobResult.duplicate
                    ? "You're already in. We'll be in touch."
                    : "You're in.",
            },
            { status: blobResult.duplicate ? 200 : 201 }
        );
    } catch (err) {
        console.error('Waitlist API error:', err);
        return NextResponse.json(
            { success: false, message: 'Something went wrong. Try again.' },
            { status: 500 }
        );
    }
}
