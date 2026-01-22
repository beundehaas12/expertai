import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { VoiceInput } from '@/components/voice';
import { ChatMessage, TypingIndicator } from '@/components/chat';
import type { ChatMessage as ChatMessageType, VoiceVariant } from '@/types';
import './index.css';

const generalResponses = [
    "That's interesting! Tell me more.",
    "I understand. How else can I assist you?",
    "Could you elaborate on that?",
    "I'm here to listen and help.",
    "That's a great point.",
    "I see. Please go on.",
    "Interesting perspective.",
    "Is there anything specific you'd like to discuss?",
    "I'm ready to help with whatever is on your mind.",
    "Okay, I'm listening.",
];

function generateId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getSimulatedResponse() {
    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
}

export default function App() {
    const [chatStarted, setChatStarted] = useState(false);
    const [messages, setMessages] = useState<ChatMessageType[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [voiceVariant, setVoiceVariant] = useState<VoiceVariant>('waveform');

    const handleSend = useCallback((text: string) => {
        const userMessage: ChatMessageType = {
            id: generateId(),
            text,
            sender: 'user',
            timestamp: Date.now(),
        };

        setMessages(prev => [...prev, userMessage]);
        setChatStarted(true);
        setIsTyping(true);

        setTimeout(() => {
            setIsTyping(false);
            const aiMessage: ChatMessageType = {
                id: generateId(),
                text: getSimulatedResponse(),
                sender: 'ai',
                timestamp: Date.now(),
            };
            setMessages(prev => [...prev, aiMessage]);
        }, 1500);
    }, []);

    const handleNewChat = useCallback(() => {
        setMessages([]);
        setChatStarted(false);
        setIsTyping(false);
    }, []);

    // Update body background when chat starts - instant
    useEffect(() => {
        if (chatStarted) {
            document.documentElement.style.backgroundImage = 'none';
            document.documentElement.style.backgroundColor = '#ffffff';
            document.body.style.backgroundImage = 'none';
            document.body.style.backgroundColor = '#ffffff';
        } else {
            document.documentElement.style.backgroundImage = "url('./img/background.jpg')";
            document.documentElement.style.backgroundColor = '';
            document.body.style.backgroundImage = "url('./img/background.jpg')";
            document.body.style.backgroundColor = '';
        }
    }, [chatStarted]);

    return (
        <div
            className={`
        min-h-screen w-full relative flex flex-col items-center
        ${chatStarted ? 'justify-between py-10 bg-white' : 'justify-center'}
      `}
        >
            {/* Top Bar */}
            <div className="fixed top-6 right-6 z-50 flex items-center gap-2">
                {/* Variant Toggle */}
                <div className="glass rounded-full p-1 shadow-md flex gap-1">
                    {(['waveform', 'glow', 'moving-glow', 'intelligence'] as const).map((v) => (
                        <button
                            key={v}
                            onClick={() => setVoiceVariant(v)}
                            className={`
                px-4 py-2 rounded-full text-sm font-medium capitalize
                transition-all duration-200
                ${voiceVariant === v
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-transparent text-gray-600 hover:text-gray-900'
                                }
              `}
                        >
                            {v}
                        </button>
                    ))}
                </div>

                {/* New Chat Button - circular, on right side */}
                {chatStarted && (
                    <button
                        onClick={handleNewChat}
                        className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
                        aria-label="New Chat"
                        title="New Chat"
                    >
                        <Plus size={20} className="text-gray-700" />
                    </button>
                )}
            </div>

            {/* Chat Messages - no animation */}
            {chatStarted && (
                <div className="w-full max-w-[600px] mx-auto flex flex-col gap-4 px-4 pt-10 pb-32">
                    {messages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))}

                    <AnimatePresence>
                        {isTyping && <TypingIndicator />}
                    </AnimatePresence>
                </div>
            )}

            {/* Input Area - no animation */}
            <div
                className={`
          ${chatStarted
                        ? 'fixed bottom-0 left-0 right-0 bg-white h-[72px] flex items-start justify-center pt-0'
                        : 'absolute inset-0 flex flex-col items-center justify-center'
                    }
          z-40
        `}
            >
                <div className="flex flex-col items-center w-full">
                    {/* Welcome Message */}
                    {!chatStarted && (
                        <div className="flex flex-col items-center mb-10">
                            <img
                                src="./img/expert-ai-spark.svg"
                                alt=""
                                className="w-16 h-16 mb-6"
                            />
                            <h1 className="text-3xl font-medium text-gray-900 text-center">
                                How can I help you?
                            </h1>
                        </div>
                    )}

                    <VoiceInput onSend={handleSend} variant={voiceVariant} />
                </div>
            </div>
        </div>
    );
}
