
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "./ui/skeleton";

interface CaptchaProps {
  onVerified: (isVerified: boolean) => void;
}

export function Captcha({ onVerified }: CaptchaProps) {
  const [captchaText, setCaptchaText] = useState("");
  const [userInput, setUserInput] = useState("");
  const { toast } = useToast();
  const [styles, setStyles] = useState<React.CSSProperties[]>([]);
  const [isClient, setIsClient] = useState(false);

  const generateCaptcha = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomText = "";
    for (let i = 0; i < 6; i++) {
      randomText += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(randomText);

    // Generate styles for each character
    const newStyles: React.CSSProperties[] = Array.from(randomText).map(() => ({
      transform: `rotate(${Math.random() * 20 - 10}deg)`,
      color: `hsl(${Math.random() * 360}, 50%, 50%)`,
      display: 'inline-block',
    }));
    setStyles(newStyles);
  };
  
  useEffect(() => {
    setIsClient(true);
    generateCaptcha();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (userInput.toLowerCase() === captchaText.toLowerCase() && userInput.length > 0) {
      onVerified(true);
    } else {
      onVerified(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInput, captchaText]);

  const handleRefresh = () => {
    generateCaptcha();
    setUserInput("");
    toast({
      title: "CAPTCHA Refreshed",
      description: "A new CAPTCHA has been generated.",
    });
  }

  // Render a placeholder on the server and during initial client render
  if (!isClient) {
    return (
        <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <div className="flex-1 p-2 bg-muted rounded-md text-center tracking-[.5em] select-none text-2xl font-bold font-mono">
          {captchaText.split('').map((char, index) => (
            <span key={index} style={styles[index]}>{char}</span>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleRefresh}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      <Input
        type="text"
        placeholder="Enter the text above"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        autoComplete="off"
        className="text-center"
      />
    </div>
  );
}
