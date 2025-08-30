
"use client";

import ReCAPTCHA from "react-google-recaptcha";
import { useToast } from "@/hooks/use-toast";

interface ReCaptchaProps {
  onVerified: (isVerified: boolean) => void;
}

export function ReCaptcha({ onVerified }: ReCaptchaProps) {
  const { toast } = useToast();
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const handleChange = (value: string | null) => {
    onVerified(!!value);
  };
  
  const handleError = () => {
     toast({
        variant: "destructive",
        title: "reCAPTCHA Error",
        description: "Failed to load the reCAPTCHA. Please check your connection and refresh the page.",
    });
    onVerified(false);
  }

  if (!siteKey || siteKey === "YOUR_RECAPTCHA_SITE_KEY_HERE") {
    console.error("reCAPTCHA site key is not configured. Please add NEXT_PUBLIC_RECAPTCHA_SITE_KEY to your .env.local file.");
    return (
        <div className="p-4 text-center text-sm bg-destructive/10 text-destructive rounded-md">
            reCAPTCHA is not configured. The site key is missing.
        </div>
    );
  }

  return (
    <ReCAPTCHA
      sitekey={siteKey}
      onChange={handleChange}
      onErrored={handleError}
    />
  );
}
