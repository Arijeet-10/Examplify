
"use client";

import { useState, useEffect } from 'react';

// Extend the Navigator interface to include the experimental Network Information API properties
interface NetworkInformation extends EventTarget {
  readonly downlink?: number;
  readonly effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
  readonly rtt?: number;
  readonly saveData?: boolean;
  onchange?: EventListener;
}

declare global {
  interface Navigator {
    readonly connection?: NetworkInformation;
  }
}

export const useNetworkSpeed = () => {
    const [speed, setSpeed] = useState<number | null>(null);
    const [type, setType] = useState<string>('unknown');

    useEffect(() => {
        const connection = navigator.connection;

        const updateNetworkInfo = () => {
            if (connection) {
                setSpeed(connection.downlink || null);
                setType(connection.effectiveType || 'unknown');
            } else {
                setSpeed(null);
                setType('unsupported');
            }
        };

        updateNetworkInfo();

        if (connection) {
            connection.addEventListener('change', updateNetworkInfo);
        }

        const interval = setInterval(updateNetworkInfo, 5000); // Check every 5 seconds

        return () => {
            if (connection) {
                connection.removeEventListener('change', updateNetworkInfo);
            }
            clearInterval(interval);
        };
    }, []);

    return { speed, type };
};
