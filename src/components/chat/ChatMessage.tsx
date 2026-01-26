import type { ChatMessage as ChatMessageType } from '@/types';
import { MessageActions } from './MessageActions';

interface ChatMessageProps {
    message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.sender === 'user';

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
                {message.text}
            </div>
            {!isUser && <MessageActions messageId={message.id} />}
        </div>
    );
}
