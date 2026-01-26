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
    const isStreaming = message.isStreaming && !isUser;

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
                        speed={4}
                        interval={25}
                        onComplete={onStreamComplete}
                        onUpdate={onStreamUpdate}
                    />
                ) : isUser ? (
                    message.text
                ) : (
                    <FormattedText text={message.text} />
                )}
            </div>
            {!isUser && !isStreaming && <MessageActions messageId={message.id} />}
        </div>
    );
}
