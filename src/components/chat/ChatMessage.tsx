import type { ChatMessage as ChatMessageType } from '@/types';

interface ChatMessageProps {
    message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.sender === 'user';

    return (
        <div
            className={`
        max-w-[80%] px-5 py-3 rounded-3xl font-sans text-base leading-relaxed break-words
        ${isUser
                    ? 'self-end bg-gray-100 rounded-br-sm text-right'
                    : 'self-start bg-white border border-gray-200 rounded-bl-sm shadow-sm text-left'
                }
      `}
        >
            {message.text}
        </div>
    );
}
