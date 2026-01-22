import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus, Maximize2, Columns } from 'lucide-react';
import { VoiceInput, IntelligenceEffect } from '@/components/voice';
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
    const [splitView, setSplitView] = useState(false);
    const [splitWidth, setSplitWidth] = useState(50); // percentage
    const [isVoiceActive, setIsVoiceActive] = useState(false);
    const [voiceIntensity, setVoiceIntensity] = useState(0);

    const handleVoiceStateChange = useCallback((isVoiceMode: boolean, intensity: number) => {
        setIsVoiceActive(isVoiceMode);
        setVoiceIntensity(intensity);
    }, []);

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
            {/* Controls - Left Side */}
            <div className="fixed top-6 left-6 z-50 flex items-center gap-2">
                {/* Split View Toggle */}
                <div className="glass rounded-full p-1 shadow-md flex gap-1">
                    <button
                        onClick={() => setSplitView(false)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${!splitView ? 'bg-gray-900 text-white' : 'bg-transparent text-gray-600 hover:text-gray-900'}`}
                        aria-label="Full Width View"
                        title="Full Width"
                    >
                        <Maximize2 size={16} />
                    </button>
                    <button
                        onClick={() => setSplitView(true)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${splitView ? 'bg-gray-900 text-white' : 'bg-transparent text-gray-600 hover:text-gray-900'}`}
                        aria-label="Split View"
                        title="Split View"
                    >
                        <Columns size={16} />
                    </button>
                </div>

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
            </div>

            {/* New Chat Button - Right Side */}
            {chatStarted && (
                <div className="fixed top-6 right-6 z-50">
                    <button
                        onClick={handleNewChat}
                        className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
                        aria-label="New Chat"
                        title="New Chat"
                    >
                        <Plus size={20} className="text-gray-700" />
                    </button>
                </div>
            )}

            {/* Main Layout */}
            {splitView ? (
                /* Split View Mode */
                <div className="fixed inset-0 flex">
                    {/* Left Panel - Content Area (placeholder) */}
                    <div
                        className="bg-white flex items-center justify-center"
                        style={{ width: `${100 - splitWidth}%` }}
                    >
                        <div className="text-gray-400 text-lg">Content Area</div>
                    </div>

                    {/* Drag Handle */}
                    <div
                        className="w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-colors relative group flex-shrink-0"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            const startX = e.clientX;
                            const startWidth = splitWidth;

                            const handleMouseMove = (moveEvent: MouseEvent) => {
                                const delta = startX - moveEvent.clientX;
                                const newWidth = Math.min(80, Math.max(20, startWidth + (delta / window.innerWidth) * 100));
                                setSplitWidth(newWidth);
                            };

                            const handleMouseUp = () => {
                                document.removeEventListener('mousemove', handleMouseMove);
                                document.removeEventListener('mouseup', handleMouseUp);
                            };

                            document.addEventListener('mousemove', handleMouseMove);
                            document.addEventListener('mouseup', handleMouseUp);
                        }}
                    >
                        <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-400/20" />
                    </div>

                    {/* Right Panel - Chat */}
                    <div
                        className="flex flex-col relative overflow-hidden"
                        style={{
                            width: `${splitWidth}%`,
                            backgroundImage: chatStarted ? 'none' : "url('./img/background.jpg')",
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundColor: chatStarted ? 'white' : undefined,
                        }}
                    >
                        {/* Intelligence Effect for split view - rendered at panel level */}
                        {voiceVariant === 'intelligence' && isVoiceActive && (
                            <IntelligenceEffect isActive={true} intensity={voiceIntensity} contained={true} />
                        )}

                        {/* Chat Messages or Welcome */}
                        {chatStarted ? (
                            <div className="flex-1 overflow-y-auto px-4 pt-6 pb-4">
                                <div className="max-w-[600px] mx-auto flex flex-col gap-4">
                                    {messages.map((msg) => (
                                        <ChatMessage key={msg.id} message={msg} />
                                    ))}
                                    <AnimatePresence>
                                        {isTyping && <TypingIndicator />}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center px-4">
                                <img
                                    src="./img/expert-ai-spark.svg"
                                    alt=""
                                    className="w-16 h-16 mb-6"
                                />
                                <h1 className="text-3xl font-medium text-gray-900 text-center mb-10">
                                    How can I help you?
                                </h1>
                                <VoiceInput onSend={handleSend} variant={voiceVariant} dropdownAbove={false} splitView={true} onVoiceStateChange={handleVoiceStateChange} />
                            </div>
                        )}

                        {/* Input Area - fixed at bottom, not absolute */}
                        {chatStarted && (
                            <div className="flex-shrink-0 bg-white h-[72px] flex items-start justify-center px-4">
                                <VoiceInput onSend={handleSend} variant={voiceVariant} dropdownAbove={true} splitView={true} onVoiceStateChange={handleVoiceStateChange} />
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Full Width Mode */
                <>
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

                            <VoiceInput onSend={handleSend} variant={voiceVariant} dropdownAbove={chatStarted} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
