import { useState } from 'react';
import type { ChatMessage as ChatMessageType } from '@/types';
import { MessageActions } from './MessageActions';
import { StreamingText } from './StreamingText';
import { FormattedText } from './FormattedText';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ChatMessageProps {
    message: ChatMessageType;
    onStreamComplete?: () => void;
    onStreamUpdate?: () => void;
}

export function ChatMessage({ message, onStreamComplete, onStreamUpdate }: ChatMessageProps) {
    const isUser = message.sender === 'user';
    const isSystem = message.sender === 'system';
    const isStreaming = message.isStreaming && !isUser && !isSystem;
    const [previewIndex, setPreviewIndex] = useState<number | null>(null);

    const images = message.images || [];
    const hasMultipleImages = images.length > 1;

    // System notice (e.g., "Operation cancelled by user") - left aligned
    if (isSystem && message.isSystemNotice) {
        return (
            <div className="w-full py-2 self-start text-left">
                <span className="text-sm text-gray-400 italic">
                    {message.text.replace(/_/g, '')}
                </span>
            </div>
        );
    }

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (previewIndex !== null && previewIndex > 0) {
            setPreviewIndex(previewIndex - 1);
        }
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (previewIndex !== null && previewIndex < images.length - 1) {
            setPreviewIndex(previewIndex + 1);
        }
    };

    return (
        <>
            <div className={`max-w-[80%] ${isUser ? 'self-end' : 'self-start'}`}>
                <div
                    className={`
                font-sans text-base leading-relaxed break-words
                ${isUser
                            ? 'bg-gray-100 px-5 py-3 rounded-3xl rounded-tr-sm text-left'
                            : 'text-left pt-3'
                        }
              `}
                >
                    {/* Image previews for user messages */}
                    {isUser && images.length > 0 && (
                        <div className={`flex flex-wrap gap-2 ${message.text ? 'mb-2' : ''}`}>
                            {images.map((url, index) => (
                                <img
                                    key={index}
                                    src={url}
                                    alt={`Attachment ${index + 1}`}
                                    className="w-20 h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => setPreviewIndex(index)}
                                />
                            ))}
                        </div>
                    )}
                    {isStreaming ? (
                        <StreamingText
                            text={message.text}
                            speed={8}
                            interval={20}
                            onComplete={onStreamComplete}
                            onUpdate={onStreamUpdate}
                        />
                    ) : isUser ? (
                        message.text
                    ) : (
                        <FormattedText text={message.text} />
                    )}
                </div>
                {/* Show action items for AI messages that are not streaming and have content */}
                {!isUser && !isStreaming && message.text.trim().length > 0 && <MessageActions messageId={message.id} messageContent={message.text} />}
            </div>

            {/* Image Preview Lightbox */}
            {previewIndex !== null && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setPreviewIndex(null)}
                >
                    {/* Close button */}
                    <button
                        className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                        onClick={() => setPreviewIndex(null)}
                        aria-label="Close preview"
                    >
                        <X size={24} className="text-white" />
                    </button>

                    {/* Left arrow */}
                    {hasMultipleImages && previewIndex > 0 && (
                        <button
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                            onClick={handlePrev}
                            aria-label="Previous image"
                        >
                            <ChevronLeft size={28} className="text-white" />
                        </button>
                    )}

                    {/* Image */}
                    <img
                        src={images[previewIndex]}
                        alt="Full size preview"
                        className="max-w-full max-h-full object-contain rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    />

                    {/* Right arrow */}
                    {hasMultipleImages && previewIndex < images.length - 1 && (
                        <button
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                            onClick={handleNext}
                            aria-label="Next image"
                        >
                            <ChevronRight size={28} className="text-white" />
                        </button>
                    )}

                    {/* Image counter */}
                    {hasMultipleImages && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm">
                            {previewIndex + 1} / {images.length}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
