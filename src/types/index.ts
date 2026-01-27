// Voice input variants
export type VoiceVariant = 'waveform' | 'glow' | 'moving-glow' | 'intelligence';

// Action button position options
export type ButtonPosition = 'none' | 'header' | 'actionbar' | 'floating';

// Chat message types
export type MessageSender = 'user' | 'ai' | 'system';

export interface ChatMessage {
    id: string;
    text: string;
    sender: MessageSender;
    timestamp: number;
    isStreaming?: boolean;
    isCancelled?: boolean;
    isSystemNotice?: boolean;
    images?: string[]; // URLs of attached images
    thinkingSteps?: string[]; // Chain-of-thought steps for deep thinking
}

// Thinking mode type
export type ThinkingMode = 'quick' | 'deep';

// Voice input state
export type VoiceInputMode = 'text' | 'voice';

// Icon button variants
export type IconButtonVariant = 'default' | 'primary' | 'ghost';

// Audio visualizer data
export interface AudioVisualizerState {
    data: Uint8Array;
    volume: number;
    isActive: boolean;
}

// Speech recognition state
export interface SpeechRecognitionState {
    transcript: string;
    interimTranscript: string;
    isListening: boolean;
    error: string | null;
}
