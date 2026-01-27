import { useState, useEffect, useRef } from 'react';
import { FormattedText } from './FormattedText';

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

    // Use refs for callbacks to avoid restarting animation when callbacks change
    const onCompleteRef = useRef(onComplete);
    const onUpdateRef = useRef(onUpdate);

    useEffect(() => {
        onCompleteRef.current = onComplete;
        onUpdateRef.current = onUpdate;
    });

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
                onCompleteRef.current?.();
            } else {
                setDisplayedText(text.slice(0, currentIndex));
                onUpdateRef.current?.();
            }
        }, interval);

        return () => clearInterval(timer);
    }, [text, speed, interval]); // Removed callback dependencies

    return (
        <div>
            <FormattedText text={displayedText} />
        </div>
    );
}
