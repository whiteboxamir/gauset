'use client';

import { useState } from 'react';
import { submitWaitlist } from '@/app/actions';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface WaitlistFormProps {
    className?: string;
    size?: 'default' | 'large';
}

export function WaitlistForm({ className, size = 'default' }: WaitlistFormProps) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (status === 'loading' || status === 'success') return;

        setStatus('loading');
        const formData = new FormData(e.currentTarget);
        const result = await submitWaitlist(formData);

        if (result.success) {
            setStatus('success');
            setMessage(result.message);
        } else {
            setStatus('idle');
            setMessage(result.message);
        }
    };

    const isLarge = size === 'large';

    return (
        <div className={cn('relative w-full max-w-md mx-auto', className)}>
            <form onSubmit={handleSubmit} className="relative group flex w-full">
                <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    required
                    disabled={status !== 'idle'}
                    className={cn(
                        'w-full bg-white/[0.03] border border-white/[0.1] text-white rounded-full',
                        'placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300',
                        'group-hover:bg-white/[0.05] group-hover:border-white/[0.2]',
                        isLarge ? 'px-8 py-5 text-lg' : 'px-6 py-4 text-base'
                    )}
                />
                <button
                    type="submit"
                    disabled={status !== 'idle'}
                    className={cn(
                        'absolute right-2 top-1/2 -translate-y-1/2 rounded-full flex items-center justify-center',
                        'transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed',
                        status === 'success' ? 'bg-[#00ff9d]/20 text-[#00ff9d]' : 'bg-white text-black hover:bg-neutral-200',
                        isLarge ? 'w-12 h-12' : 'w-10 h-10'
                    )}
                >
                    <AnimatePresence mode="wait">
                        {status === 'idle' && (
                            <motion.div
                                key="arrow"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                            >
                                <ArrowRight className={isLarge ? "w-5 h-5" : "w-4 h-4"} />
                            </motion.div>
                        )}
                        {status === 'loading' && (
                            <motion.div
                                key="loader"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="animate-spin"
                            >
                                <Loader2 className={isLarge ? "w-5 h-5" : "w-4 h-4"} />
                            </motion.div>
                        )}
                        {status === 'success' && (
                            <motion.div
                                key="check"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                            >
                                <Check className={isLarge ? "w-5 h-5" : "w-4 h-4"} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>
            </form>
            {message && (
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                        "absolute -bottom-8 left-0 right-0 text-center text-sm font-medium",
                        status === 'success' ? 'text-[#00ff9d]' : 'text-red-400'
                    )}
                >
                    {message}
                </motion.p>
            )}
        </div>
    );
}
