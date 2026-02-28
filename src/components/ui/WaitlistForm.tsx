'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface WaitlistFormProps {
    className?: string;
    size?: 'default' | 'large';
    placeholder?: string;
    buttonText?: string;
    onSuccess?: () => void;
}

export function WaitlistForm({
    className,
    size = 'default',
    placeholder = 'you@yourstudio.com',
    buttonText,
    onSuccess,
}: WaitlistFormProps) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (status === 'loading' || status === 'success') return;

        setStatus('loading');
        setMessage('');

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;

        try {
            const res = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (data.success) {
                setStatus('success');
                setMessage(data.message);
                onSuccess?.();
            } else {
                setStatus('error');
                setMessage(data.message);
                setTimeout(() => {
                    setStatus('idle');
                    setMessage('');
                }, 3000);
            }
        } catch {
            setStatus('error');
            setMessage('Something went wrong. Try again.');
            setTimeout(() => {
                setStatus('idle');
                setMessage('');
            }, 3000);
        }
    }, [status, onSuccess]);

    const isLarge = size === 'large';
    const showTextButton = isLarge && buttonText;

    return (
        <div className={cn('relative w-full max-w-md mx-auto', className)}>
            <AnimatePresence mode="wait">
                {status !== 'success' ? (
                    <motion.form
                        key="form"
                        onSubmit={handleSubmit}
                        initial={false}
                        exit={{ opacity: 0, scale: 0.95, filter: 'blur(6px)', transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } }}
                        className="relative group flex w-full"
                    >
                        {/* Animated glow ring behind input */}
                        <div
                            className={cn(
                                'absolute -inset-[1px] rounded-full transition-all duration-700 pointer-events-none',
                                isFocused
                                    ? 'opacity-100 blur-sm'
                                    : 'opacity-0'
                            )}
                            style={{
                                background: isFocused
                                    ? 'linear-gradient(90deg, rgba(13,59,79,0.3), rgba(100,200,220,0.15), rgba(13,59,79,0.3))'
                                    : 'none',
                            }}
                        />

                        <input
                            type="email"
                            name="email"
                            placeholder={placeholder}
                            required
                            disabled={status === 'loading'}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            className={cn(
                                'relative z-[1] w-full bg-white/[0.03] border text-white rounded-full',
                                'placeholder:text-neutral-600 focus:outline-none transition-all duration-500',
                                isFocused
                                    ? 'border-[rgba(100,200,220,0.3)] shadow-[0_0_20px_rgba(13,59,79,0.2)]'
                                    : 'border-white/[0.08] group-hover:border-white/[0.15] group-hover:bg-white/[0.04]',
                                isLarge ? 'px-8 py-5 text-lg' : 'px-6 py-4 text-base',
                                showTextButton ? 'pr-36' : ''
                            )}
                        />

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className={cn(
                                'absolute right-2 top-1/2 -translate-y-1/2 rounded-full flex items-center justify-center z-[2]',
                                'transition-all duration-500 disabled:cursor-not-allowed',
                                'active:scale-95 hover:scale-[1.03] hover:brightness-110',
                                status === 'loading'
                                    ? 'bg-white/10 text-white/60'
                                    : showTextButton
                                        ? 'bg-white text-black hover:bg-[rgba(100,200,220,1)] hover:text-white hover:shadow-[0_0_24px_rgba(13,59,79,0.4)]'
                                        : 'bg-white text-black hover:bg-[rgba(100,200,220,1)] hover:text-white hover:shadow-[0_0_20px_rgba(13,59,79,0.4)]',
                                showTextButton
                                    ? 'px-6 h-12 text-sm font-medium tracking-wide'
                                    : isLarge ? 'w-12 h-12' : 'w-10 h-10'
                            )}
                            style={{
                                animation: status !== 'loading' ? 'cta-glow-pulse 4s ease-in-out infinite' : 'none',
                            }}
                        >
                            {status === 'loading' ? (
                                <svg className={cn('animate-spin', isLarge ? 'w-5 h-5' : 'w-4 h-4')} viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            ) : showTextButton ? (
                                buttonText
                            ) : (
                                <svg className={cn(isLarge ? 'w-5 h-5' : 'w-4 h-4')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            )}
                        </button>

                        {/* Shimmer overlay during loading */}
                        {status === 'loading' && (
                            <div className="absolute inset-0 rounded-full overflow-hidden z-[3] pointer-events-none">
                                <div
                                    className="absolute inset-0 animate-shimmer"
                                    style={{
                                        background: 'linear-gradient(90deg, transparent, rgba(100,200,220,0.07), transparent)',
                                    }}
                                />
                            </div>
                        )}
                    </motion.form>
                ) : null}
            </AnimatePresence>

            {/* Error message */}
            <AnimatePresence>
                {status === 'error' && message && (
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute -bottom-8 left-0 right-0 text-center text-sm font-medium text-red-400/80"
                    >
                        {message}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}
