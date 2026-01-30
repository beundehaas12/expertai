import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Settings, ArrowDown, Brain } from 'lucide-react';
import { ChatInput } from '@/components/voice';
import { ChatMessage, TypingIndicator, PendingIndicator, DeepThinkingBox } from '@/components/chat';
import { ActionBar, ExpertButton, SideModal, SelectionTooltip } from '@/components/ui';
import { ComponentsPage } from '@/components/pages/ComponentsPage';
import type { ChatMessage as ChatMessageType, VoiceVariant, ButtonPosition } from '@/types';
import type { BackgroundImage } from '@/components/ui/SideModal';
import './index.css';

const generalResponses = [
    `That's a great question! Let me share some thoughts.

## Key Points

There are several aspects to consider here:

• First, it's important to understand the context
• Second, consider the different perspectives involved
• Third, think about the practical implications

Would you like me to elaborate on any of these points?`,

    `I'd be happy to help with that!

## Here's What I Found

Based on your question, here are some relevant insights:

1. Start by identifying the core issue
2. Break it down into smaller, manageable parts
3. Address each component systematically
4. Review the overall solution for consistency

Let me know if you need more specific guidance on any step.`,

    `Interesting perspective! Here's my take on it.

## Analysis

Your question touches on some important themes. Let me break it down:

**The Main Idea**
Understanding this requires looking at both the big picture and the details. The key is finding the right balance.

**Practical Application**
Once you grasp the fundamentals, applying them becomes much easier. Practice and iteration are essential.

Is there a specific aspect you'd like to explore further?`,

    `That makes sense. Let me provide some context.

## Overview

This is a common scenario that many people encounter. Here's how I'd approach it:

• **Step 1**: Gather all relevant information
• **Step 2**: Identify the main constraints
• **Step 3**: Explore possible solutions
• **Step 4**: Evaluate trade-offs
• **Step 5**: Make an informed decision

Each step builds on the previous one. Want me to walk through any of these in detail?`,

    `I understand what you're asking. Here's a comprehensive response.

## Summary

Your question relates to a topic that has multiple dimensions:

1. **Theoretical Foundation**: Understanding the underlying principles
2. **Practical Considerations**: Real-world factors that affect implementation
3. **Best Practices**: Proven approaches that tend to work well

## Recommendation

I'd suggest starting with the basics and gradually building up your knowledge. This approach tends to lead to better long-term understanding.

Feel free to ask follow-up questions!`,

    `Great point! Let me expand on that.

The topic you've raised is quite nuanced. There are different schools of thought, and the "right" answer often depends on your specific situation.

## Things to Consider

When thinking about this, keep in mind:

• Your specific goals and constraints
• The resources available to you
• The timeline you're working with
• Potential risks and how to mitigate them

Would you like to discuss any of these factors in more detail?`,

    // Short responses for variety
    "That's a great point! I completely agree with your perspective.",

    "Interesting! Could you tell me more about what you're trying to achieve?",

    "I see what you mean. Let me know if you have any follow-up questions.",

    "That makes sense. How can I help you further with this?",

    "Good question! The answer really depends on your specific context and needs.",

    "I understand. Feel free to share more details whenever you're ready.",
];


function generateId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getSimulatedResponse() {
    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
}

function getImageAnalysisResponse(imageCount: number) {
    const singular = imageCount === 1;
    return `Thanks for sharing ${singular ? 'this image' : `these ${imageCount} images`}! I've analyzed ${singular ? 'it' : 'them'} and here are my findings:

## Image Analysis

Based on my review of ${singular ? 'the uploaded image' : `the ${imageCount} uploaded images`}, I can identify several key elements:

### Visual Elements
• **Composition**: The ${singular ? 'image features' : 'images feature'} a well-balanced layout with clear focal points
• **Color Palette**: I notice a harmonious color scheme that creates visual cohesion
• **Quality**: The ${singular ? 'resolution appears' : 'resolutions appear'} suitable for detailed analysis

### Key Observations
1. **Subject Matter**: The main subject${singular ? '' : 's'} ${singular ? 'is' : 'are'} clearly visible and well-defined
2. **Context**: The surrounding elements provide helpful context
3. **Details**: Several interesting details are worth noting for further discussion

### Recommendations
Based on this analysis, I'd suggest:
- Consider the lighting conditions for optimal results
- The framing effectively highlights the important elements
- Additional context would help provide more specific insights

Would you like me to focus on any particular aspect of ${singular ? 'this image' : 'these images'}? I'm happy to provide more detailed analysis on specific areas of interest.`;
}

function getRandomDelay() {
    // Random delay between 500ms and 2500ms
    return 500 + Math.random() * 2000;
}

export default function App() {
    // State for managing message queue and AI status
    const [chatStarted, setChatStarted] = useState(false);
    const [messages, setMessages] = useState<ChatMessageType[]>([]);

    // Queue System: Stores pending user inputs or actions
    // userMessage is stored when the message was queued while AI was busy
    const [pendingQueue, setPendingQueue] = useState<{ id: string, text: string, type: 'text' | 'selection', imageCount?: number, deepThinking?: boolean, userMessage?: ChatMessageType }[]>([]);

    // AI Status: 
    // - 'idle': Doing nothing
    // - 'thinking': Showing TypingIndicator (Simulating delay)
    // - 'streaming': Currently printing text (ChatMessage is active)
    const [aiStatus, setAiStatus] = useState<'idle' | 'thinking' | 'streaming'>('idle');

    // Ref to track current AI processing timeout (for cancellation)
    const aiProcessingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Derived state for existing components using boolean flags
    const isTyping = aiStatus === 'thinking';
    const isAiBusy = aiStatus !== 'idle';

    // Deep thinking state (toggle in header)
    const [deepThinking, setDeepThinking] = useState(false);
    const [currentDeepThinking, setCurrentDeepThinking] = useState(false);

    const [voiceVariant, setVoiceVariant] = useState<VoiceVariant>('glow');
    const [componentsView, setComponentsView] = useState(false);
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

    const [backgroundImage, setBackgroundImage] = useState<BackgroundImage>(() => {
        const saved = localStorage.getItem('expertai-background-image');
        if (saved) return saved as BackgroundImage;
        return 'background.jpg';
    });

    // Persist view preference
    useEffect(() => {
        localStorage.setItem('expertai-view', splitView ? 'split' : 'chat');
    }, [splitView]);

    // Persist button position preference
    useEffect(() => {
        localStorage.setItem('expertai-button-position', buttonPosition);
    }, [buttonPosition]);



    // Persist background image preference
    useEffect(() => {
        localStorage.setItem('expertai-background-image', backgroundImage);
    }, [backgroundImage]);

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

    // 1. INPUT HANDLER: Adds to queue
    const handleSend = useCallback((text: string, images?: string[], useDeepThinking?: boolean) => {
        shouldAutoScrollRef.current = true;
        setShowScrollButton(false);

        const userMessage: ChatMessageType = {
            id: generateId(),
            text,
            sender: 'user',
            timestamp: Date.now(),
            images, // Include attached images
        };

        // If AI is busy, queue the message (don't add to messages yet)
        // If AI is idle, add immediately
        if (aiStatus !== 'idle') {
            // AI is busy - queue this message for later, store the full userMessage
            setPendingQueue(prev => [...prev, {
                id: userMessage.id,
                text,
                type: 'text' as const,
                imageCount: images?.length,
                deepThinking: useDeepThinking,
                userMessage // Store the full message object to render later
            }]);
        } else {
            // AI is idle - add message immediately and queue for processing
            setMessages(prev => [...prev, userMessage]);
            setPendingQueue(prev => [...prev, { id: generateId(), text, type: 'text' as const, imageCount: images?.length, deepThinking: useDeepThinking }]);
        }
        setChatStarted(true);
    }, [aiStatus, messages.length]);

    // 2. QUEUE PROCESSOR: Watches Queue + Status
    useEffect(() => {
        // Only process if we are IDLE and there are items in queue
        if (aiStatus === 'idle' && pendingQueue.length > 0) {

            // Lock the processor
            setAiStatus('thinking');

            const currentRequest = pendingQueue[0];
            setPendingQueue(prev => prev.slice(1));

            // Set current deep thinking mode for display
            const isDeep = currentRequest.deepThinking ?? false;
            setCurrentDeepThinking(isDeep);

            // If this request has a stored userMessage (was queued while busy), add it now
            if (currentRequest.userMessage) {
                setMessages(prev => [...prev, currentRequest.userMessage!]);
            }

            // For deep thinking, we don't use setTimeout - DeepThinkingBox will call our callback
            if (isDeep) {
                // Deep thinking box will manage the delay and call onComplete
                return;
            }

            // Quick mode: Simulate Thinking Delay - store timeout ID for cancellation
            aiProcessingTimeoutRef.current = setTimeout(() => {
                aiProcessingTimeoutRef.current = null;

                // Determine response type based on request
                let responseText = currentRequest.imageCount && currentRequest.imageCount > 0
                    ? getImageAnalysisResponse(currentRequest.imageCount)
                    : getSimulatedResponse();
                if (currentRequest.type === 'selection') {
                    if (currentRequest.text.startsWith('# Understanding')) {
                        responseText = currentRequest.text;
                    }
                }

                // Add AI Message -> Transition to 'streaming'
                const aiMessage: ChatMessageType = {
                    id: generateId(),
                    text: responseText,
                    sender: 'ai',
                    timestamp: Date.now(),
                    isStreaming: true,
                };

                setMessages(prev => [...prev, aiMessage]);
                setAiStatus('streaming');

            }, getRandomDelay());
        }
    }, [aiStatus, pendingQueue]);

    // STOP GENERATION HANDLER
    const handleStopGeneration = useCallback(() => {
        // Clear any pending timeout (for 'thinking' phase)
        if (aiProcessingTimeoutRef.current) {
            clearTimeout(aiProcessingTimeoutRef.current);
            aiProcessingTimeoutRef.current = null;
        }

        // Clear the pending queue
        setPendingQueue([]);

        // If currently streaming, mark the last AI message as cancelled
        if (aiStatus === 'streaming') {
            setMessages(prev => {
                const lastAiIndex = prev.map(m => m.sender).lastIndexOf('ai');
                if (lastAiIndex >= 0) {
                    return prev.map((msg, i) =>
                        i === lastAiIndex
                            ? { ...msg, isStreaming: false, isCancelled: true }
                            : msg
                    );
                }
                return prev;
            });
        }

        // Add cancelled notice message
        const cancelledMessage: ChatMessageType = {
            id: generateId(),
            text: '_Operation cancelled by user_',
            sender: 'system',
            timestamp: Date.now(),
            isSystemNotice: true,
        };
        setMessages(prev => [...prev, cancelledMessage]);

        // Reset to idle
        setAiStatus('idle');
    }, [aiStatus]);

    // 3. STREAM COMPLETION HANDLER
    // Called by ChatMessage when typewriting ends
    const markStreamComplete = useCallback((messageId: string) => {
        setMessages(prev => prev.map(msg =>
            msg.id === messageId ? { ...msg, isStreaming: false } : msg
        ));

        // IMPORTANT: Free up the AI to process the next item
        setAiStatus('idle');

        // FORCE SCROLL UPDATE:
        // MessageActions appears *after* isStreaming becomes false.
        // We need to wait for it to render and expand the container.
        // Use a longer delay (200ms) and FORCE scroll regardless of shouldAutoScrollRef.
        setTimeout(() => {
            if (chatScrollRef.current) {
                chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
                setShowScrollButton(false); // Also hide the scroll button
            }
        }, 200);

    }, []);

    // DEEP THINKING COMPLETE HANDLER
    // Called by DeepThinkingBox when all steps finish
    const handleDeepThinkingComplete = useCallback((steps: string[]) => {
        // Generate response text
        const responseText = getSimulatedResponse();

        // Add AI Message with thinking steps -> Transition to 'streaming'
        const aiMessage: ChatMessageType = {
            id: generateId(),
            text: responseText,
            sender: 'ai',
            timestamp: Date.now(),
            isStreaming: true,
            thinkingSteps: steps,
        };

        setMessages(prev => [...prev, aiMessage]);
        setAiStatus('streaming');
    }, []);


    const handleNewChat = useCallback(() => {
        setMessages([]);
        setChatStarted(false);
        setPendingQueue([]); // Clear queue
        setAiStatus('idle'); // Reset status
        setChatPanelOpen(true); // Open chat panel
    }, []);

    // Handle "Summarize document" action from ActionBar
    const handleSummarizeDocument = useCallback(() => {
        // Open chat panel
        setChatPanelOpen(true);

        // Clear any existing conversation and start fresh
        setMessages([]);
        setPendingQueue([]);
        setAiStatus('idle');
        setChatStarted(true);

        // Create user message
        const userMessage: ChatMessageType = {
            id: generateId(),
            text: "Summarize this document",
            sender: 'user',
            timestamp: Date.now(),
        };

        // Add user message immediately
        setMessages([userMessage]);

        // Start thinking phase
        setAiStatus('thinking');
        setCurrentDeepThinking(false);

        // After 3 seconds of thinking, stream the summary response
        setTimeout(() => {
            const summaryResponse = `## Document Summary

This document outlines the key aspects of the Expert AI platform and its core capabilities.

### Main Topics Covered

1. **Voice Input Integration** — The platform supports multiple voice input visualization styles including Waveform, Glow, Moving Glow, and Intelligence modes, allowing users to interact hands-free.

2. **Deep Thinking Mode** — For complex queries, users can enable an extended reasoning mode that displays the AI's chain-of-thought process in real-time.

3. **Image Analysis** — Users can upload images directly in the chat for visual context and analysis, enabling multimodal conversations.

4. **Flexible Layouts** — The interface offers both Chat and Split view layouts with resizable panels and configurable action button positions.

### Key Findings

- The document emphasizes user experience through customizable interface options
- Integration capabilities are designed for seamless workflow enhancement
- The system supports multi-turn conversations with context retention
- Export functionality allows saving conversations as PDF documents

### Recommendations

Based on the content, users are advised to:
- Provide specific context for optimal AI responses
- Utilize the Deep Thinking mode for complex analytical queries
- Take advantage of voice input for hands-free productivity

*This summary was generated by Expert AI.*`;

            // Create AI response message
            const aiMessage: ChatMessageType = {
                id: generateId(),
                text: '',
                sender: 'ai',
                timestamp: Date.now(),
            };

            setMessages(prev => [...prev, aiMessage]);
            setAiStatus('streaming');

            // Stream the response word by word
            const words = summaryResponse.split(' ');
            let currentIndex = 0;

            const streamInterval = setInterval(() => {
                if (currentIndex < words.length) {
                    const wordsToAdd = words.slice(currentIndex, currentIndex + 3).join(' ') + ' ';
                    setMessages(prev =>
                        prev.map(msg =>
                            msg.id === aiMessage.id
                                ? { ...msg, text: msg.text + wordsToAdd }
                                : msg
                        )
                    );
                    currentIndex += 3;
                } else {
                    clearInterval(streamInterval);
                    setAiStatus('idle');
                }
            }, 50);
        }, 3000); // 3 second thinking delay
    }, []);

    // Ref for content area (for selection tooltip)
    const contentRef = useRef<HTMLDivElement>(null);

    // Ref for chat scroll container
    const chatScrollRef = useRef<HTMLDivElement>(null);

    // Track if user is at bottom (for smart auto-scroll) - using ref to avoid re-renders
    const shouldAutoScrollRef = useRef(true);

    // State for showing scroll-to-bottom button
    const [showScrollButton, setShowScrollButton] = useState(false);

    // Check if user is at bottom of chat
    const handleChatScroll = useCallback(() => {
        if (chatScrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatScrollRef.current;
            const isAtBottom = scrollHeight - scrollTop - clientHeight < 50; // 50px threshold
            shouldAutoScrollRef.current = isAtBottom;
            // Only update state if value changed to avoid re-renders
            setShowScrollButton(prev => {
                const newValue = !isAtBottom;
                return prev !== newValue ? newValue : prev;
            });
        }
    }, []);

    // Auto-scroll to bottom when messages change or typing starts (only if at bottom)
    useEffect(() => {
        if (chatScrollRef.current && shouldAutoScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    // Scroll to bottom callback for streaming text (respects user scroll)
    const scrollToBottom = useCallback(() => {
        if (chatScrollRef.current && shouldAutoScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, []);

    // Force scroll to bottom (for button click)
    const scrollToBottomForced = useCallback(() => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
            shouldAutoScrollRef.current = true;
            setShowScrollButton(false);
        }
    }, []);

    // Handle "Chat about this" from text selection
    const handleChatAboutSelection = useCallback((selectedText: string) => {
        // Open chat panel if not already open
        if (!chatPanelOpen) {
            setChatPanelOpen(true);
        }

        // Reset scroll to bottom when starting a new question
        shouldAutoScrollRef.current = true;
        setShowScrollButton(false);
        setTimeout(() => {
            if (chatScrollRef.current) {
                chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
            }
        }, 100);

        // Create a user message with the selected text
        const userMessage: ChatMessageType = {
            id: generateId(),
            text: `Tell me more about: "${selectedText}"`,
            sender: 'user',
            timestamp: Date.now(),
        };

        setMessages(prev => [...prev, userMessage]);
        setChatStarted(true);
        // setIsTyping(true); // Handled by Queue now

        // Generate a long multi-paragraph response with structure
        const topicSnippet = selectedText.slice(0, 50) + (selectedText.length > 50 ? '...' : '');
        const longResponse = `# Understanding "${topicSnippet}"

Great question! Let me break this down for you.

## Overview

This concept is fundamental to understanding how our platform operates. When we talk about this topic, we're referring to a core principle that guides the way information is processed and delivered to you.

The underlying technology uses advanced algorithms to ensure accuracy and relevance in every interaction.

## Key Benefits

From a practical standpoint, this means you can expect:

• Consistent, high-quality results whenever you engage with this feature
• Adaptive responses based on your specific context and needs
• Intelligent understanding that improves with each interaction
• Seamless integration with your existing workflow

Our team has spent considerable time refining the approach to make sure it meets the needs of diverse users across different contexts.

## Best Practices

Here are several recommendations when working with this aspect of the platform:

1. Be specific in your queries — this helps the system understand exactly what you're looking for
2. Don't hesitate to ask follow-up questions if the initial response doesn't fully address your needs
3. Use natural language — the conversational interface is designed to handle iterative refinement
4. Provide context when possible — it helps generate more relevant responses

## What's Next

This feature is continuously improving. We regularly incorporate user feedback and update our models to provide even better responses over time.

If you have any suggestions or encounter any issues, we encourage you to let us know through the feedback mechanisms available in the application.

---

Would you like me to elaborate on any specific aspect of this topic?`;

        // Push to Queue
        setPendingQueue(prev => [...prev, {
            id: generateId(),
            text: longResponse, // Pass the prepared text
            type: 'selection'
        }]);

    }, [chatPanelOpen]);

    // Update body background when chat starts - instant
    useEffect(() => {
        if (chatStarted) {
            document.documentElement.style.backgroundImage = 'none';
            document.documentElement.style.backgroundColor = '#ffffff';
            document.body.style.backgroundImage = 'none';
            document.body.style.backgroundColor = '#ffffff';
        } else {
            document.documentElement.style.backgroundImage = `url('./img/backgrounds/${backgroundImage}')`;
            document.documentElement.style.backgroundColor = '';
            document.body.style.backgroundImage = `url('./img/backgrounds/${backgroundImage}')`;
            document.body.style.backgroundColor = '';
        }
    }, [chatStarted, backgroundImage]);

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
                {/* Left Side - Logo + Navigation */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center">
                        <img
                            src="/img/wk-logo-primary-pos-large.svg"
                            alt="WK Logo"
                            className="h-6"
                        />
                    </div>
                    <nav className="flex items-center gap-1">
                        <button
                            onClick={() => { handleViewChange(false); setComponentsView(false); }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${!splitView && !componentsView
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            Chat
                        </button>
                        <button
                            onClick={() => { handleViewChange(true); setComponentsView(false); }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${splitView && !componentsView
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            Split
                        </button>
                        {/* Hidden for now
                        <button
                            onClick={() => setComponentsView(true)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${componentsView
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            Expert AI Components
                        </button>
                        */}
                    </nav>
                </div>

                {/* Right Side - Settings + Expert Button */}
                <div className="flex items-center gap-4">
                    <motion.button
                        onClick={() => setSettingsOpen(true)}
                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center"
                        whileHover={{ backgroundColor: '#e6f2f9' }}
                        whileTap={{ backgroundColor: '#F2F8FC' }}
                        transition={{ duration: 0 }}
                        style={{ backgroundColor: settingsOpen ? '#e6f2f9' : undefined }}
                        aria-label="Settings"
                        title="Settings"
                    >
                        <Settings
                            size={20}
                            color={settingsOpen ? '#005B92' : '#374151'}
                        />
                    </motion.button>
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
                deepThinking={deepThinking}
                onDeepThinkingChange={setDeepThinking}
                backgroundImage={backgroundImage}
                onBackgroundImageChange={setBackgroundImage}
            />

            {/* Main Layout */}
            {componentsView ? (
                /* Components View */
                <ComponentsPage />
            ) : splitView ? (
                /* Split View Mode */
                <div className={`flex-1 flex bg-white ${chatPanelOpen ? 'overflow-hidden' : 'overflow-y-auto'}`}>
                    {/* Left Panel - Content Area */}
                    <div
                        className={`bg-white flex relative ${chatPanelOpen ? 'overflow-hidden' : ''}`}
                        style={{
                            width: chatPanelOpen ? `${100 - splitWidth}%` : '100%',
                            maxWidth: chatPanelOpen ? undefined : '1200px',
                            margin: chatPanelOpen ? undefined : '0 auto'
                        }}
                    >
                        {/* Main Content */}
                        <div ref={contentRef} className={`flex-1 p-8 pr-20 relative ${chatPanelOpen ? 'overflow-y-auto pb-24' : 'pb-8'}`}>
                            <SelectionTooltip
                                containerRef={contentRef}
                                onChatAboutSelection={handleChatAboutSelection}
                            />
                            <div className={`max-w-3xl mx-auto text-left ${chatPanelOpen ? 'mb-24' : 'mb-8'}`}>
                                {/* Big Header */}
                                <h1 className="font-medium mb-8" style={{ fontSize: '28px', color: '#232323' }}>
                                    Welcome to Expert AI
                                </h1>

                                {/* Section 1 */}
                                <h2 className="text-base font-medium mb-4" style={{ color: '#232323' }}>
                                    Getting Started
                                </h2>
                                <p className="text-base mb-6" style={{ color: '#232323', lineHeight: '24px' }}>
                                    Expert AI is your intelligent assistant designed to help you navigate complex tasks with ease. Whether you're looking for quick answers, detailed explanations, or creative solutions, our AI-powered platform adapts to your needs and delivers personalized responses in real-time.
                                </p>

                                {/* Section 2 */}
                                <h2 className="text-base font-medium mb-4" style={{ color: '#232323' }}>
                                    Key Features
                                </h2>
                                <p className="text-base mb-6" style={{ color: '#232323', lineHeight: '24px' }}>
                                    Expert AI offers a comprehensive suite of features to enhance your workflow. Use <strong>voice input</strong> with four customizable visualization styles (Waveform, Glow, Moving Glow, and Intelligence). Enable <strong>Deep Thinking mode</strong> for complex queries requiring extended reasoning with a visible chain-of-thought process. <strong>Upload images</strong> directly in chat for visual context and analysis. <strong>Select any text</strong> on this page to instantly discuss it with the AI. Switch between <strong>Chat and Split view</strong> layouts, with a resizable panel and configurable call-to-action button positions. Export conversations as <strong>PDF documents</strong>, and enjoy streaming responses with a clean, modern interface.
                                </p>

                                {/* Section 3 */}
                                <h2 className="text-base font-medium mb-4" style={{ color: '#232323' }}>
                                    How It Works
                                </h2>
                                <p className="text-base mb-6" style={{ color: '#232323', lineHeight: '24px' }}>
                                    Simply click on the Expert AI button or use the chat panel to start a conversation. You can type your questions or use voice input for hands-free interaction. The AI processes your queries instantly and provides comprehensive, accurate responses tailored to your context.
                                </p>

                                {/* Section 4 */}
                                <h2 className="text-base font-medium mb-4" style={{ color: '#232323' }}>
                                    Best Practices
                                </h2>
                                <p className="text-base mb-6" style={{ color: '#232323', lineHeight: '24px' }}>
                                    For optimal results, be specific with your questions and provide context when needed. The more details you share, the better the AI can understand and assist you. Don't hesitate to ask follow-up questions or request clarifications—the system is designed to handle multi-turn conversations naturally.
                                </p>

                                {/* Section 5 */}
                                <h2 className="text-base font-medium mb-4" style={{ color: '#232323' }}>
                                    Privacy & Security
                                </h2>
                                <p className="text-base mb-6" style={{ color: '#232323', lineHeight: '24px' }}>
                                    Your data security is our top priority. All conversations are encrypted and processed with strict privacy protocols. We never share your personal information with third parties, and you have full control over your conversation history and data preferences.
                                </p>

                                {/* Section 6 */}
                                <h2 className="text-base font-medium mb-4" style={{ color: '#232323' }}>
                                    Advanced Capabilities
                                </h2>
                                <p className="text-base mb-6" style={{ color: '#232323', lineHeight: '24px' }}>
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                                </p>

                                {/* Section 7 */}
                                <h2 className="text-base font-medium mb-4" style={{ color: '#232323' }}>
                                    Integration Options
                                </h2>
                                <p className="text-base mb-6" style={{ color: '#232323', lineHeight: '24px' }}>
                                    Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra.
                                </p>

                                {/* Section 8 */}
                                <h2 className="text-base font-medium mb-4" style={{ color: '#232323' }}>
                                    Customization Settings
                                </h2>
                                <p className="text-base mb-6" style={{ color: '#232323', lineHeight: '24px' }}>
                                    Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat.
                                </p>

                                {/* Section 9 */}
                                <h2 className="text-base font-medium mb-4" style={{ color: '#232323' }}>
                                    Performance Metrics
                                </h2>
                                <p className="text-base mb-6" style={{ color: '#232323', lineHeight: '24px' }}>
                                    Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus. Phasellus ultrices nulla quis nibh. Quisque a lectus. Donec consectetuer ligula vulputate sem tristique cursus. Nam nulla quam, gravida non, commodo a, sodales sit amet, nisi. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
                                </p>

                                {/* Section 10 */}
                                <h2 className="text-base font-medium mb-4" style={{ color: '#232323' }}>
                                    User Feedback
                                </h2>
                                <p className="text-base mb-6" style={{ color: '#232323', lineHeight: '24px' }}>
                                    Curabitur sit amet mauris. Morbi in dui quis est pulvinar ullamcorper. Nulla facilisi. Integer lacinia sollicitudin massa. Cras metus. Sed aliquet risus a tortor. Integer id quam. Morbi mi. Quisque nisl felis, venenatis tristique, dignissim in, ultrices sit amet, augue. Proin sodales libero eget ante.
                                </p>

                                {/* Section 11 */}
                                <h2 className="text-base font-medium mb-4" style={{ color: '#232323' }}>
                                    Troubleshooting Guide
                                </h2>
                                <p className="text-base mb-6" style={{ color: '#232323', lineHeight: '24px' }}>
                                    Nullam egestas, nisl id faucibus vulputate, nulla nisl tincidunt velit, a aliquam nibh arcu eu nisi. Proin dignissim tempor orci. Nullam ornare. Praesent odio ligula, dapibus sed, tincidunt eget, elementum nec, orci. Praesent in mauris eu tortor porttitor accumsan. Mauris suscipit, ligula sit amet pharetra semper, nibh ante cursus purus.
                                </p>

                                {/* Section 12 */}
                                <h2 className="text-base font-medium mb-4" style={{ color: '#232323' }}>
                                    Technical Specifications
                                </h2>
                                <p className="text-base mb-6" style={{ color: '#232323', lineHeight: '24px' }}>
                                    Fusce suscipit, wisi nec facilisis facilisis, est dui fermentum leo, quis tempor ligula erat quis odio. Nunc porta vulputate tellus. Nunc rutrum turpis sed pede. Sed bibendum. Aliquam posuere. Nunc aliquet, augue nec adipiscing interdum, lacus tellus malesuada massa, quis varius mi purus non odio.
                                </p>

                                {/* Section 13 */}
                                <h2 className="text-base font-medium mb-4" style={{ color: '#232323' }}>
                                    API Documentation
                                </h2>
                                <p className="text-base mb-6" style={{ color: '#232323', lineHeight: '24px' }}>
                                    Pellentesque condimentum, magna ut suscipit hendrerit, ipsum augue ornare nulla, non luctus diam neque sit amet urna. Curabitur vulputate vestibulum lorem. Fusce sagittis, libero non molestie mollis, magna orci ultrices dolor, at vulputate neque nulla lacinia eros. Sed id ligula quis est convallis tempor.
                                </p>

                                {/* Section 14 */}
                                <h2 className="text-base font-medium mb-4" style={{ color: '#232323' }}>
                                    Roadmap & Updates
                                </h2>
                                <p className="text-base mb-6" style={{ color: '#232323', lineHeight: '24px' }}>
                                    Integer nunc. Vivamus bibendum, nulla ut congue fringilla, lorem ipsum ultricies risus, ut rutrum velit tortor vel purus. In hac habitasse platea dictumst. Morbi vestibulum volutpat enim. Nunc interdum lacus sit amet orci. Vestibulum rutrum, mi nec elementum vehicula, eros quam gravida nisl, id fringilla neque ante vel mi.
                                </p>

                                {/* Section 15 */}
                                <h2 className="text-base font-medium mb-4" style={{ color: '#232323' }}>
                                    Contact & Support
                                </h2>
                                <p className="text-base" style={{ color: '#232323', lineHeight: '24px' }}>
                                    Duis sapien sem, aliquet sed, consequat eget, convallis quis, turpis. Suspendisse sed velit vel urna cursus ultricies. Proin laoreet libero lacinia erat congue, sed accumsan sem vestibulum eu. Etiam at risus et justo dignissim congue. Donec congue lacinia dui, a porttitor lectus condimentum laoreet.
                                </p>
                                {/* Bottom spacer when chat is collapsed */}
                                {!chatPanelOpen && <div className="h-8" />}
                            </div>
                        </div>

                        {/* Floating Button - fixed to bottom of content area */}
                        {buttonPosition === 'floating' && (
                            <div
                                className="fixed bottom-6 z-50"
                                style={{ right: chatPanelOpen ? `calc(${splitWidth}% + 24px)` : '24px' }}
                            >
                                <ExpertButton label="Ask Expert AI" onClick={() => setChatPanelOpen(true)} className="shadow-lg" />
                            </div>
                        )}

                        {/* Vertical Action Bar - fixed position so it stays visible when scrolling */}
                        <div
                            className="fixed top-[76px] z-10"
                            style={{
                                // When chat is open: stick to left of chat panel
                                // When chat is closed: stick to right edge of centered 1200px content
                                right: chatPanelOpen
                                    ? `calc(${splitWidth}% + 22px)`
                                    : 'max(22px, calc((100vw - 1200px) / 2 + 22px))'
                            }}
                        >
                            <ActionBar
                                onNewChat={handleNewChat}
                                onStartChat={handleNewChat}
                                onSummarize={handleSummarizeDocument}
                                showExpertButton={buttonPosition === 'actionbar'}
                            />
                        </div>
                    </div>

                    {/* Drag Handle - only show when chat panel is open */}
                    {chatPanelOpen && (
                        <div
                            className="w-0.5 bg-transparent cursor-col-resize transition-all relative group flex-shrink-0 z-30 flex items-stretch justify-center"
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
                            {/* Visible line: 1px gray default, 2px blue on hover */}
                            <div className="w-px group-hover:w-0.5 h-full bg-[#DADADA] group-hover:bg-blue-400 transition-all" />
                            <div className="absolute inset-y-0 -left-0.5 -right-0.5 group-hover:bg-blue-400/20 z-30" />
                        </div>
                    )}

                    {/* Right Panel - Chat - only show when open */}
                    {chatPanelOpen && (
                        <div
                            className="flex flex-col relative overflow-hidden"
                            style={{
                                width: `${splitWidth}%`,
                                backgroundImage: chatStarted ? 'none' : `url('./img/backgrounds/${backgroundImage}')`,
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
                                <div ref={chatScrollRef} onScroll={handleChatScroll} className="flex-1 overflow-y-auto px-8 pt-12 pb-4">
                                    <div className="max-w-[600px] mx-auto flex flex-col gap-4">
                                        {messages.map((msg) => (
                                            <ChatMessage
                                                key={msg.id}
                                                message={msg}
                                                onStreamUpdate={scrollToBottom}
                                                onStreamComplete={() => markStreamComplete(msg.id)}
                                            />
                                        ))}
                                        <AnimatePresence>
                                            {isTyping && currentDeepThinking && (
                                                <DeepThinkingBox
                                                    isActive={true}
                                                    onComplete={handleDeepThinkingComplete}
                                                />
                                            )}
                                            {isTyping && !currentDeepThinking && <TypingIndicator />}
                                            {/* Show Pending Bubble if queue has items and we are busy (Thinking or Streaming) */}
                                            {pendingQueue.length > 0 && (aiStatus === 'thinking' || aiStatus === 'streaming') && (
                                                <PendingIndicator pendingMessages={pendingQueue.filter(q => q.userMessage).map(q => q.userMessage!)} />
                                            )}
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
                                    <ChatInput onSend={handleSend} variant={voiceVariant} dropdownAbove={false} isAiBusy={isAiBusy} onStop={handleStopGeneration} deepThinking={deepThinking} />
                                </div>
                            )}

                            {/* Input Area with scroll button - fixed at bottom */}
                            {chatStarted && (
                                <div className="flex-shrink-0 relative flex flex-col items-center px-4 pb-4">
                                    {/* Floating scroll to bottom button - positioned above input */}
                                    {showScrollButton && (
                                        <motion.button
                                            onClick={scrollToBottomForced}
                                            className="absolute -top-14 left-1/2 -translate-x-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center group"
                                            whileHover={{ backgroundColor: '#003D61' }}
                                            whileTap={{ backgroundColor: '#005B92' }}
                                            transition={{ duration: 0 }}
                                            aria-label="Scroll to bottom"
                                        >
                                            <ArrowDown size={20} className="text-gray-600 group-hover:text-white" />
                                        </motion.button>
                                    )}
                                    <ChatInput onSend={handleSend} variant={voiceVariant} dropdownAbove={true} isAiBusy={isAiBusy} onStop={handleStopGeneration} deepThinking={deepThinking} />
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
                        <div ref={chatScrollRef} onScroll={handleChatScroll} className="flex-1 overflow-y-auto px-8 pt-6 pb-4">
                            <div className="max-w-[600px] mx-auto flex flex-col gap-4">
                                {messages.map((msg) => (
                                    <ChatMessage
                                        key={msg.id}
                                        message={msg}
                                        onStreamUpdate={scrollToBottom}
                                        onStreamComplete={() => markStreamComplete(msg.id)}
                                    />
                                ))}
                                <AnimatePresence>
                                    {isTyping && currentDeepThinking && (
                                        <DeepThinkingBox
                                            isActive={true}
                                            onComplete={handleDeepThinkingComplete}
                                        />
                                    )}
                                    {isTyping && !currentDeepThinking && <TypingIndicator />}
                                    {/* Show Pending Bubble if queue has items and we are busy (Thinking or Streaming) */}
                                    {pendingQueue.length > 0 && (aiStatus === 'thinking' || aiStatus === 'streaming') && (
                                        <PendingIndicator pendingMessages={pendingQueue.filter(q => q.userMessage).map(q => q.userMessage!)} />
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center px-6">
                            <img
                                src="./img/expert-ai-spark.svg"
                                alt=""
                                className="w-16 h-16 mb-6"
                            />
                            <h1 className="text-3xl font-medium text-gray-900 text-center mb-10">
                                How can I help you?
                            </h1>
                            <ChatInput onSend={handleSend} variant={voiceVariant} dropdownAbove={false} isAiBusy={isAiBusy} onStop={handleStopGeneration} deepThinking={deepThinking} />
                        </div>
                    )}

                    {/* Input Area with scroll button - fixed at bottom */}
                    {chatStarted && (
                        <div className="flex-shrink-0 relative flex flex-col items-center px-6 pb-4">
                            {/* Floating scroll to bottom button - positioned above input */}
                            {showScrollButton && (
                                <motion.button
                                    onClick={scrollToBottomForced}
                                    className="absolute -top-14 left-1/2 -translate-x-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center group"
                                    whileHover={{ backgroundColor: '#003D61' }}
                                    whileTap={{ backgroundColor: '#005B92' }}
                                    transition={{ duration: 0 }}
                                    aria-label="Scroll to bottom"
                                >
                                    <ArrowDown size={20} className="text-gray-600 group-hover:text-white" />
                                </motion.button>
                            )}
                            <ChatInput onSend={handleSend} variant={voiceVariant} dropdownAbove={true} isAiBusy={isAiBusy} onStop={handleStopGeneration} deepThinking={deepThinking} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
