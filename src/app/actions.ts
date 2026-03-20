'use server';

import db from '@/lib/db';
import { cookies } from 'next/headers';
import { z } from 'zod';

const emailSchema = z.string().email();

export async function submitWaitlist(formData: FormData) {
    const email = formData.get('email');

    try {
        const validEmail = emailSchema.parse(email);

        const stmt = db.prepare('INSERT INTO waitlist (email) VALUES (?)');
        stmt.run(validEmail);

        // Simulate slight network delay for premium feel
        await new Promise(r => setTimeout(r, 600));

        return { success: true, message: "You're in. Early access secured." };
    } catch (error: any) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return { success: true, message: "You're already in. We'll be in touch." };
        }
        return { success: false, message: "Please provide a valid email." };
    }
}

export async function loginUser(formData: FormData) {
    const email = formData.get('email');
    try {
        emailSchema.parse(email);

        await new Promise(r => setTimeout(r, 800));

        const cookieStore = await cookies();
        cookieStore.delete('auth-token');

        return {
            success: false,
            message: "You haven't been given early access yet. Request access and we'll reach out when your studio is approved.",
        };
    } catch {
        return { success: false, message: "Please enter a valid email." };
    }
}
