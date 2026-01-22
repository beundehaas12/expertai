// Voice input variants
export type VoiceVariant = 'waveform' | 'glow' | 'moving-glow' | 'intelligence';

// Chat message types
export type MessageSender = 'user' | 'ai';

export interface ChatMessage {
    id: string;
    text: string;
    sender: MessageSender;
    timestamp: number;
}

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
