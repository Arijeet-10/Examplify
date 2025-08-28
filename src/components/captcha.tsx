
"use client";

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CaptchaProps {
    onVerified: (isVerified: boolean) => void;
}

export function Captcha({ onVerified }: CaptchaProps) {
    const [captchaText, setCaptchaText] = useState('');
    const [userInput, setUserInput] = useState('');

    const generateCaptchaText = (length = 6) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    useEffect(() => {
        setCaptchaText(generateCaptchaText());
    }, []);

    useEffect(() => {
        if (userInput.toLowerCase() === captchaText.toLowerCase() && captchaText) {
            onVerified(true);
        } else {
            onVerified(false);
        }
    }, [userInput, captchaText, onVerified]);

    const handleRefresh = () => {
        setCaptchaText(generateCaptchaText());
        setUserInput('');
    };

    const renderCaptchaChars = () => {
        return captchaText.split('').map((char, index) => (
             <span
                key={index}
                className="inline-block"
                style={{
                    transform: `rotate(${Math.random() * 20 - 10}deg) translateY(${Math.random() * 6 - 3}px)`,
                    color: `hsl(${Math.random() * 360}, 50%, 50%)`,
                    margin: '0 2px',
                    fontFamily: "'Courier New', Courier, monospace",
                    fontWeight: 'bold',
                    fontSize: '1.5rem',
                    userSelect: 'none',
                }}
            >
                {char}
            </span>
        ));
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center justify-center p-2 rounded-md bg-muted border h-16">
                   {captchaText && renderCaptchaChars()}
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
                    userInput && (userInput.toLowerCase() === captchaText.toLowerCase() ? 'border-green-500' : 'border-destructive')
                )}
            />
        </div>
    );
}
