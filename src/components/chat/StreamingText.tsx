import { useState, useEffect } from 'react';

interface StreamingTextProps {
    text: string;
    speed?: number; // characters per interval
    interval?: number; // ms between reveals
    onComplete?: () => void;
    onUpdate?: () => void; // fires on each text update (for scrolling)
}

export function StreamingText({
    text,
    speed = 3,
    interval = 30,
    onComplete,
    onUpdate
}: StreamingTextProps) {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (!text) return;

        let currentIndex = 0;
        setDisplayedText('');
        setIsComplete(false);

        const timer = setInterval(() => {
            currentIndex += speed;

            if (currentIndex >= text.length) {
                setDisplayedText(text);
                setIsComplete(true);
                clearInterval(timer);
                onComplete?.();
            } else {
                setDisplayedText(text.slice(0, currentIndex));
                onUpdate?.();
            }
        }, interval);

        return () => clearInterval(timer);
    }, [text, speed, interval, onComplete, onUpdate]);

    return (
        <span>
            {displayedText}
            {!isComplete && (
                <span className="inline-block w-2 h-4 bg-gray-400 ml-0.5 animate-pulse" />
            )}
        </span>
    );
}
