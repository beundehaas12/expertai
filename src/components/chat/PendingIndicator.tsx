import { motion } from 'framer-motion';
import type { ChatMessage } from '@/types';

interface PendingIndicatorProps {
    pendingMessages?: ChatMessage[];
}

export function PendingIndicator({ pendingMessages = [] }: PendingIndicatorProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex flex-col gap-2"
        >
            {/* Render each pending user message */}
            {pendingMessages.map((msg) => (
                <div key={msg.id} className="max-w-[80%] self-end">
                    <div className="bg-gray-100 px-5 py-3 rounded-3xl rounded-tr-sm text-left font-sans text-base leading-relaxed break-words opacity-60">
                        {msg.text}
                    </div>
                </div>
            ))}

            {/* Pending label */}
            <div className="self-start flex items-center gap-3 py-2">
                <div className="relative w-6 h-6 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 animate-pulse" />
                </div>
                <span className="text-gray-400 text-sm font-medium">Pending...</span>
            </div>
        </motion.div>
    );
}
