#!/usr/bin/env node

import { list } from '@vercel/blob';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUPABASE_JWT_KEY_PATTERN = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
const DEFAULT_PREFIX = 'waitlist/';
const DEFAULT_TABLE = 'waitlist';
const DEFAULT_PAGE_SIZE = 1000;
const DEFAULT_CONCURRENCY = 8;

function printUsage() {
    console.log(`Usage:
  node scripts/backfill_waitlist_blob_to_supabase.mjs [options]

Options:
  --dry-run             List and validate waitlist blobs without inserting rows.
  --prefix <path>       Blob prefix to scan. Defaults to "${DEFAULT_PREFIX}".
  --table <name>        Supabase table to populate. Defaults to "${DEFAULT_TABLE}".
  --page-size <n>       Blob page size per list request. Defaults to ${DEFAULT_PAGE_SIZE}.
  --concurrency <n>     Number of Supabase inserts to run in parallel. Defaults to ${DEFAULT_CONCURRENCY}.
  --verbose             Log each blob as it is processed.
  --help                Show this help text.

Required environment:
  BLOB_READ_WRITE_TOKEN
  NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL (live mode only)
  SUPABASE_SERVICE_ROLE_KEY (live mode only)
`);
}

function parseArgs(argv) {
    const options = {
        dryRun: false,
        prefix: DEFAULT_PREFIX,
        table: DEFAULT_TABLE,
        pageSize: DEFAULT_PAGE_SIZE,
        concurrency: DEFAULT_CONCURRENCY,
        verbose: false,
        help: false,
    };

    for (let i = 0; i < argv.length; i += 1) {
        const arg = argv[i];

        switch (arg) {
            case '--dry-run':
                options.dryRun = true;
                break;
            case '--prefix':
                options.prefix = argv[++i];
                break;
            case '--table':
                options.table = argv[++i];
                break;
            case '--page-size':
                options.pageSize = Number(argv[++i]);
                break;
            case '--concurrency':
                options.concurrency = Number(argv[++i]);
                break;
            case '--verbose':
                options.verbose = true;
                break;
            case '--help':
            case '-h':
                options.help = true;
                break;
            default:
                throw new Error(`Unknown argument: ${arg}`);
        }
    }

    return options;
}

function normalizeEnvValue(value) {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
}

function resolveConfig({ dryRun }) {
    const blobToken = normalizeEnvValue(process.env.BLOB_READ_WRITE_TOKEN);
    const supabaseUrl = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL);
    const serviceRoleKey = normalizeEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY);

    const missing = [];
    if (!blobToken) missing.push('BLOB_READ_WRITE_TOKEN');
    if (!dryRun && !supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL');
    if (!dryRun && !serviceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');

    if (missing.length > 0) {
        throw new Error(`Missing required environment variable(s): ${missing.join(', ')}.`);
    }

    return {
        blobToken,
        supabaseUrl,
        serviceRoleKey,
    };
}

function createSupabaseHeaders(serviceRoleKey) {
    const headers = {
        apikey: serviceRoleKey,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
    };

    if (SUPABASE_JWT_KEY_PATTERN.test(serviceRoleKey)) {
        headers.Authorization = `Bearer ${serviceRoleKey}`;
    }

    return headers;
}

async function readBlobEmailRecord(blobUrl, verbose) {
    const response = await fetch(blobUrl);

    if (!response.ok) {
        throw new Error(`Failed to fetch blob ${blobUrl}: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const email = typeof data?.email === 'string' ? data.email.trim().toLowerCase() : '';
    const createdAt = typeof data?.createdAt === 'string' ? data.createdAt : undefined;

    if (!email || !EMAIL_REGEX.test(email)) {
        throw new Error(`Blob payload does not contain a valid email: ${blobUrl}`);
    }

    if (verbose) {
        console.log(`blob ${blobUrl} -> ${email}`);
    }

    return { email, createdAt };
}

function buildInsertPayload(record) {
    const payload = {
        email: record.email,
    };

    if (record.createdAt && !Number.isNaN(Date.parse(record.createdAt))) {
        payload.created_at = record.createdAt;
    }

    return payload;
}

async function insertWaitlistRow({ supabaseUrl, serviceRoleKey, table, record }) {
    const res = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
        method: 'POST',
        headers: createSupabaseHeaders(serviceRoleKey),
        body: JSON.stringify(buildInsertPayload(record)),
    });

    if (res.ok) {
        return { inserted: true, duplicate: false };
    }

    const errorBody = await res.json().catch(() => ({}));
    const code = String(errorBody?.code || res.status);
    const message = String(errorBody?.message || res.statusText);

    if (res.status === 409 || code === '23505') {
        return { inserted: false, duplicate: true };
    }

    throw new Error(`Supabase insert failed for ${record.email}: ${res.status} ${code} ${message}`);
}

async function listAllBlobMetadata({ blobToken, prefix, pageSize }) {
    const blobs = [];
    let cursor;

    do {
        const page = await list({
            token: blobToken,
            prefix,
            limit: pageSize,
            cursor,
        });

        blobs.push(...page.blobs);
        cursor = page.hasMore ? page.cursor : undefined;

        console.log(`Listed ${blobs.length} blob(s) so far${page.hasMore ? '...' : '.'}`);
    } while (cursor);

    return blobs;
}

async function mapWithConcurrency(items, concurrency, mapper) {
    const results = new Array(items.length);
    let nextIndex = 0;

    const workers = Array.from(
        { length: Math.max(1, Math.min(concurrency, items.length || 1)) },
        async () => {
            while (true) {
                const currentIndex = nextIndex;
                nextIndex += 1;

                if (currentIndex >= items.length) {
                    return;
                }

                results[currentIndex] = await mapper(items[currentIndex], currentIndex);
            }
        },
    );

    await Promise.all(workers);
    return results;
}

async function main() {
    const options = parseArgs(process.argv.slice(2));

    if (options.help) {
        printUsage();
        return;
    }

    if (!Number.isInteger(options.pageSize) || options.pageSize <= 0) {
        throw new Error('--page-size must be a positive integer.');
    }

    if (!Number.isInteger(options.concurrency) || options.concurrency <= 0) {
        throw new Error('--concurrency must be a positive integer.');
    }

    const config = resolveConfig({ dryRun: options.dryRun });
    const blobs = await listAllBlobMetadata({
        blobToken: config.blobToken,
        prefix: options.prefix,
        pageSize: options.pageSize,
    });

    const waitlistBlobs = blobs.filter((blob) => blob.pathname.startsWith(options.prefix) && blob.pathname.endsWith('.json'));

    console.log(`Found ${waitlistBlobs.length} waitlist blob(s) under "${options.prefix}".`);

    let scanned = 0;
    let wouldInsert = 0;
    let inserted = 0;
    let duplicates = 0;
    let skipped = 0;
    let failed = 0;

    await mapWithConcurrency(waitlistBlobs, options.concurrency, async (blob) => {
        scanned += 1;

        try {
            const record = await readBlobEmailRecord(blob.url, options.verbose);

            if (options.dryRun) {
                wouldInsert += 1;
                if (options.verbose) {
                    console.log(`dry-run ${record.email}`);
                }
                return;
            }

            const result = await insertWaitlistRow({
                supabaseUrl: config.supabaseUrl,
                serviceRoleKey: config.serviceRoleKey,
                table: options.table,
                record,
            });

            if (result.inserted) {
                inserted += 1;
                if (options.verbose) {
                    console.log(`inserted ${record.email}`);
                }
                return;
            }

            if (result.duplicate) {
                duplicates += 1;
                if (options.verbose) {
                    console.log(`duplicate ${record.email}`);
                }
                return;
            }
        } catch (error) {
            failed += 1;
            skipped += 1;
            console.error(error instanceof Error ? error.message : error);
        }
    });

    console.log([
        'Backfill complete.',
        `scanned=${scanned}`,
        `wouldInsert=${wouldInsert}`,
        `inserted=${inserted}`,
        `duplicates=${duplicates}`,
        `skipped=${skipped}`,
        `failed=${failed}`,
        options.dryRun ? 'mode=dry-run' : 'mode=live',
    ].join(' '));

    if (failed > 0) {
        process.exitCode = 1;
    }
}

main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
