
"use client";

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';

interface CaptchaProps {
    onVerified: (isVerified: boolean) => void;
}

type CaptchaChar = {
    char: string;
    style: React.CSSProperties;
};

export function Captcha({ onVerified }: CaptchaProps) {
    const [captcha, setCaptcha] = useState<CaptchaChar[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isMounted, setIsMounted] = useState(false);

    // This function now only runs on the client, inside useEffect
    const generateAndSetCaptcha = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result: CaptchaChar[] = [];
        for (let i = 0; i < 6; i++) {
            const char = chars.charAt(Math.floor(Math.random() * chars.length));
            const style: React.CSSProperties = {
                transform: `rotate(${Math.random() * 20 - 10}deg) translateY(${Math.random() * 6 - 3}px)`,
                color: `hsl(${Math.random() * 360}, 50%, 50%)`,
                margin: '0 2px',
                fontFamily: "'Courier New', Courier, monospace",
                fontWeight: 'bold',
                fontSize: '1.5rem',
                userSelect: 'none',
                display: 'inline-block'
            };
            result.push({ char, style });
        }
        setCaptcha(result);
    };

    useEffect(() => {
        setIsMounted(true);
        generateAndSetCaptcha();
    }, []);

    useEffect(() => {
        if (!isMounted) return;
        const captchaText = captcha.map(c => c.char).join('');
        onVerified(userInput.toLowerCase() === captchaText.toLowerCase() && !!captchaText);
    }, [userInput, captcha, onVerified, isMounted]);

    const handleRefresh = () => {
        generateAndSetCaptcha();
        setUserInput('');
    };

    const captchaText = captcha.map(c => c.char).join('');
    
    // Don't render the captcha UI until the component is mounted on the client
    if (!isMounted) {
        return (
             <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-16 flex-1" />
                    <Button variant="outline" size="icon" type="button" disabled>
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                </div>
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center justify-center p-2 rounded-md bg-muted border h-16">
                   {captcha.map((c, index) => (
                        <span key={index} style={c.style}>
                            {c.char}
                        </span>
                    ))}
                </div>
                <Button variant="outline" size="icon" type="button" onClick={handleRefresh}>
                    <RefreshCw className="w-4 h-4" />
                </Button>
            </div>
             <Input
                type="text"
                placeholder="Enter characters above"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className={cn(
                    userInput && (userInput.toLowerCase() === captchaText.toLowerCase() && captchaText ? 'border-green-500' : 'border-destructive')
                )}
            />
        </div>
    );
}
