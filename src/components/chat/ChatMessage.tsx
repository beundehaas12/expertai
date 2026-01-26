import type { ChatMessage as ChatMessageType } from '@/types';

interface ChatMessageProps {
    message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.sender === 'user';

    return (
        <div
            className={`
        max-w-[80%] font-sans text-base leading-relaxed break-words
        ${isUser
                    ? 'self-end bg-gray-100 px-5 py-3 rounded-3xl rounded-tr-sm text-left'
                    : 'self-start text-left py-3'
                }
      `}
        >
            {message.text}
        </div>
    );
}
