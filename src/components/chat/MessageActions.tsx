import { useState, useRef, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Share2, MoreHorizontal, Copy, Flag } from 'lucide-react';

interface MessageActionsProps {
    messageId: string;
}

export function MessageActions({ messageId }: MessageActionsProps) {
    const [moreOpen, setMoreOpen] = useState(false);
    const moreRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
                setMoreOpen(false);
            }
        };

        if (moreOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [moreOpen]);

    const handleThumbsUp = () => {
        console.log('Thumbs up for message:', messageId);
    };

    const handleThumbsDown = () => {
        console.log('Thumbs down for message:', messageId);
    };

    const handleShare = () => {
        console.log('Share message:', messageId);
    };

    const handleCopy = () => {
        console.log('Copy to clipboard:', messageId);
        setMoreOpen(false);
    };

    const handleReport = () => {
        console.log('Report message:', messageId);
        setMoreOpen(false);
    };

    // Small variant: 32px button (w-8 h-8), 16px icon
    const buttonClass = "w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors";

    return (
        <div className="flex items-center gap-1 mt-2">
            <button
                onClick={handleThumbsUp}
                className={buttonClass}
                aria-label="Like"
                title="Like"
            >
                <ThumbsUp size={16} className="text-gray-700" />
            </button>
            <button
                onClick={handleThumbsDown}
                className={buttonClass}
                aria-label="Dislike"
                title="Dislike"
            >
                <ThumbsDown size={16} className="text-gray-700" />
            </button>
            <button
                onClick={handleShare}
                className={buttonClass}
                aria-label="Share"
                title="Share"
            >
                <Share2 size={16} className="text-gray-700" />
            </button>

            {/* More dropdown - same pattern as ActionBar Expert button dropdown */}
            <div ref={moreRef} className="relative">
                <button
                    onClick={() => setMoreOpen(!moreOpen)}
                    className={`${buttonClass} ${moreOpen ? 'bg-gray-100' : ''}`}
                    aria-label="More"
                    title="More"
                >
                    <MoreHorizontal size={16} className="text-gray-700" />
                </button>

                {/* Dropdown Menu - same style as ActionBar dropdown (line 77-88) */}
                {moreOpen && (
                    <div
                        className="absolute left-0 bottom-full mb-2 bg-white rounded-lg shadow-lg border border-[#DADADA] overflow-hidden min-w-[160px] z-50 py-2"
                        style={{ borderRadius: '8px' }}
                    >
                        <button
                            className="w-full px-4 h-8 flex items-center gap-3 text-gray-700 hover:bg-gray-50 transition-colors text-left whitespace-nowrap"
                            onClick={handleCopy}
                        >
                            <Copy size={18} className="text-gray-500" />
                            <span className="text-sm">Copy to clipboard</span>
                        </button>
                        <button
                            className="w-full px-4 h-8 flex items-center gap-3 text-gray-700 hover:bg-gray-50 transition-colors text-left whitespace-nowrap"
                            onClick={handleReport}
                        >
                            <Flag size={18} className="text-gray-500" />
                            <span className="text-sm">Report issue</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
