import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { X, Settings } from 'lucide-react';
import { VoiceInput } from '@/components/voice';
import { ChatMessage, TypingIndicator } from '@/components/chat';
import { ActionBar, ExpertButton, SideModal } from '@/components/ui';
import type { ChatMessage as ChatMessageType, VoiceVariant, ButtonPosition } from '@/types';
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
    const [splitView, setSplitView] = useState(() => {
        const saved = localStorage.getItem('expertai-view');
        return saved === 'split';
    });
    const [splitWidth, setSplitWidth] = useState(33); // percentage for chat panel
    const [chatPanelOpen, setChatPanelOpen] = useState(true); // for split view chat panel
    const [isVoiceActive, setIsVoiceActive] = useState(false);
    const [voiceIntensity, setVoiceIntensity] = useState(0);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [buttonPosition, setButtonPosition] = useState<ButtonPosition>(() => {
        const saved = localStorage.getItem('expertai-button-position');
        if (saved && ['none', 'header', 'actionbar', 'floating'].includes(saved)) {
            return saved as ButtonPosition;
        }
        // Page-specific defaults: 'none' for Chat, 'actionbar' for Split
        const viewSaved = localStorage.getItem('expertai-view');
        return viewSaved === 'split' ? 'actionbar' : 'none';
    });

    // Persist view preference
    useEffect(() => {
        localStorage.setItem('expertai-view', splitView ? 'split' : 'chat');
    }, [splitView]);

    // Persist button position preference
    useEffect(() => {
        localStorage.setItem('expertai-button-position', buttonPosition);
    }, [buttonPosition]);

    // Update button position when switching views (only if position hasn't been manually set)
    const handleViewChange = (isSplit: boolean) => {
        setSplitView(isSplit);
        // Set page-specific default position when switching views
        const defaultPosition = isSplit ? 'actionbar' : 'none';
        setButtonPosition(defaultPosition);
    };

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
        <div className="fixed inset-0 flex flex-col">
            {/* Header Bar - Always visible */}
            <div
                className="w-full bg-white flex-shrink-0 z-40 flex items-center justify-between px-6"
                style={{
                    height: '60px',
                    borderBottom: '1px solid #DADADA'
                }}
            >
                {/* Left Side - Navigation */}
                <nav className="flex items-center gap-1">
                    <button
                        onClick={() => handleViewChange(false)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${!splitView
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                    >
                        Chat
                    </button>
                    <button
                        onClick={() => handleViewChange(true)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${splitView
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                    >
                        Split
                    </button>
                </nav>

                {/* Right Side - Settings + Expert Button */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSettingsOpen(true)}
                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors"
                        aria-label="Settings"
                        title="Settings"
                    >
                        <Settings size={20} className="text-gray-700" />
                    </button>
                    {buttonPosition === 'header' && <ExpertButton label="Ask Expert AI" onClick={() => splitView && setChatPanelOpen(true)} />}
                </div>
            </div>

            {/* Settings Modal */}
            <SideModal
                isOpen={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                title="Settings"
                voiceVariant={voiceVariant}
                onVoiceVariantChange={setVoiceVariant}
                buttonPosition={buttonPosition}
                onButtonPositionChange={setButtonPosition}
                isSplitView={splitView}
            />

            {/* Main Layout */}
            {splitView ? (
                /* Split View Mode */
                <div className="flex-1 flex overflow-hidden bg-white">
                    {/* Left Panel - Content Area */}
                    <div
                        className="bg-white flex overflow-hidden relative"
                        style={{
                            width: chatPanelOpen ? `${100 - splitWidth}%` : '100%',
                            maxWidth: chatPanelOpen ? undefined : '1200px',
                            margin: chatPanelOpen ? undefined : '0 auto'
                        }}
                    >
                        {/* Main Content */}
                        <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto">
                            <div className="text-gray-400 text-lg">Content Area</div>
                        </div>

                        {/* Floating Button - lower right corner */}
                        {buttonPosition === 'floating' && (
                            <div className="absolute bottom-6 right-6 z-20">
                                <ExpertButton label="Ask Expert AI" onClick={() => setChatPanelOpen(true)} />
                            </div>
                        )}

                        {/* Vertical Action Bar - positioned to align with header settings icon */}
                        <div className="absolute top-4 right-[22px] z-10">
                            <ActionBar
                                onNewChat={handleNewChat}
                                onStartChat={() => setChatPanelOpen(true)}
                                showExpertButton={buttonPosition === 'actionbar'}
                            />
                        </div>
                    </div>

                    {/* Drag Handle - only show when chat panel is open */}
                    {chatPanelOpen && (
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
                    )}

                    {/* Right Panel - Chat - only show when open */}
                    {chatPanelOpen && (
                        <div
                            className="flex flex-col relative overflow-hidden"
                            style={{
                                width: `${splitWidth}%`,
                                backgroundImage: chatStarted ? 'none' : "url('./img/background.jpg')",
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                        >
                            {/* Close Button - Top Right */}
                            <button
                                onClick={() => setChatPanelOpen(false)}
                                className="absolute top-4 right-4 z-10 hover:text-gray-900 transition-colors"
                                aria-label="Close chat panel"
                                title="Close chat"
                            >
                                <X size={18} className="text-gray-500" />
                            </button>

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
                                    <VoiceInput onSend={handleSend} variant={voiceVariant} dropdownAbove={false} />
                                </div>
                            )}

                            {/* Input Area - fixed at bottom, not absolute */}
                            {chatStarted && (
                                <div className="flex-shrink-0 h-[72px] flex items-start justify-center px-4">
                                    <VoiceInput onSend={handleSend} variant={voiceVariant} dropdownAbove={true} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                /* Full Width Mode */
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Chat Messages - scrollable area */}
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
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <img
                                src="./img/expert-ai-spark.svg"
                                alt=""
                                className="w-16 h-16 mb-6"
                            />
                            <h1 className="text-3xl font-medium text-gray-900 text-center mb-10">
                                How can I help you?
                            </h1>
                            <VoiceInput onSend={handleSend} variant={voiceVariant} dropdownAbove={false} />
                        </div>
                    )}

                    {/* Input Area - fixed at bottom */}
                    {chatStarted && (
                        <div className="flex-shrink-0 h-[72px] flex items-start justify-center px-4">
                            <VoiceInput onSend={handleSend} variant={voiceVariant} dropdownAbove={true} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
