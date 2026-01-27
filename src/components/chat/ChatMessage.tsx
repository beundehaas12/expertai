import type { ChatMessage as ChatMessageType } from '@/types';
import { MessageActions } from './MessageActions';
import { StreamingText } from './StreamingText';
import { FormattedText } from './FormattedText';

interface ChatMessageProps {
    message: ChatMessageType;
    onStreamComplete?: () => void;
    onStreamUpdate?: () => void;
}

export function ChatMessage({ message, onStreamComplete, onStreamUpdate }: ChatMessageProps) {
    const isUser = message.sender === 'user';
    const isSystem = message.sender === 'system';
    const isStreaming = message.isStreaming && !isUser && !isSystem;

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

    return (
        <div className={`max-w-[80%] ${isUser ? 'self-end' : 'self-start'}`}>
            <div
                className={`
            font-sans text-base leading-relaxed break-words
            ${isUser
                        ? 'bg-gray-100 px-5 py-3 rounded-3xl rounded-tr-sm text-left'
                        : 'text-left py-3'
                    }
          `}
            >
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
            {!isUser && !isStreaming && message.text.trim().length > 0 && <MessageActions messageId={message.id} />}
        </div>
    );
}
