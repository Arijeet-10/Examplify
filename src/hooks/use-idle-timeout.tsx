
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from './use-toast';

export const useIdleTimeout = (timeout: number = 10 * 60 * 1000) => {
    const [user, loading] = useAuthState(auth);
    const router = useRouter();
    const { toast } = useToast();
    const timeoutId = useRef<NodeJS.Timeout | null>(null);

    const handleLogout = useCallback(() => {
        if (!user) return;

        auth.signOut();
        toast({
            title: "Session Expired",
            description: "You have been logged out due to inactivity.",
        });
        router.push('/');
    }, [user, router, toast]);

    const resetTimer = useCallback(() => {
        if (timeoutId.current) {
            clearTimeout(timeoutId.current);
        }
        if (user && !loading) {
            timeoutId.current = setTimeout(handleLogout, timeout);
        }
    }, [handleLogout, timeout, user, loading]);

    useEffect(() => {
        if (user && !loading) {
            const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

            const eventListener = () => resetTimer();

            events.forEach(event => window.addEventListener(event, eventListener));
            resetTimer(); // Start the timer on component mount

            return () => {
                if (timeoutId.current) {
                    clearTimeout(timeoutId.current);
                }
                events.forEach(event => window.removeEventListener(event, eventListener));
            };
        }
    }, [resetTimer, user, loading]);

    return null; 
};
