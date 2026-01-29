import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, ArrowUp, Plus, X, Check, Image, FileText, Square } from 'lucide-react';
import { Waveform } from './Waveform';
import { GlowEffect } from './GlowEffect';
import { MovingGlowEffect } from './MovingGlowEffect';
import { IntelligenceEffect } from './IntelligenceEffect';
import { Dropdown } from '@/components/ui/Dropdown';
import type { VoiceVariant, VoiceInputMode } from '@/types';

// Constants
const MIN_HEIGHT = 40;
const MAX_HEIGHT = 200;

interface ChatInputProps {
    onSend: (text: string, images?: string[], deepThinking?: boolean) => void;
    variant?: VoiceVariant;
    dropdownAbove?: boolean;
    splitView?: boolean;
    onVoiceStateChange?: (isVoiceMode: boolean, intensity: number) => void;
    isAiBusy?: boolean;
    onStop?: () => void;
    deepThinking?: boolean;
}

interface AttachedImage {
    id: string;
    url: string;
    file: File;
}

export function ChatInput({
    onSend,
    variant = 'waveform',
    dropdownAbove = false,
    splitView = false,
    onVoiceStateChange,
    isAiBusy = false,
    onStop,
    deepThinking = false
}: ChatInputProps) {
    // Core state
    const [mode, setMode] = useState<VoiceInputMode>('text');
    const [text, setText] = useState('');
    const [textareaHeight, setTextareaHeight] = useState(MIN_HEIGHT);
    const [attachedImages, setAttachedImages] = useState<AttachedImage[]>([]);
    const [plusDropdownOpen, setPlusDropdownOpen] = useState(false);

    // Voice state
    const [interimTranscript, setInterimTranscript] = useState('');
    const [visualizerData, setVisualizerData] = useState<Uint8Array>(new Uint8Array(100).fill(0));
    const [volume, setVolume] = useState(0);
    const [micAvailable, setMicAvailable] = useState<boolean | null>(null);
    const [showMicTooltip, setShowMicTooltip] = useState(false);

    // Refs
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const rafRef = useRef<number | null>(null);
    const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

    // Derived values
    const isVoiceMode = mode === 'voice';
    const isGlowVariant = variant === 'glow';
    const isMovingGlowVariant = variant === 'moving-glow';
    const isIntelligenceVariant = variant === 'intelligence';
    const glowIntensity = volume / 255;

    const displayValue = isVoiceMode && interimTranscript
        ? text + (text ? ' ' : '') + interimTranscript
        : text;

    const hasContent = displayValue.trim().length > 0;
    const showInputMode = mode === 'text' || (isVoiceMode && (isGlowVariant || isMovingGlowVariant || isIntelligenceVariant));

    // Check microphone on mount and device changes
    useEffect(() => {
        const checkMic = async () => {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                setMicAvailable(devices.some(d => d.kind === 'audioinput'));
            } catch {
                setMicAvailable(false);
            }
        };

        checkMic();
        navigator.mediaDevices.addEventListener('devicechange', checkMic);
        return () => navigator.mediaDevices.removeEventListener('devicechange', checkMic);
    }, []);

    // Auto-focus on text mode
    useEffect(() => {
        if (mode === 'text' && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [mode]);

    // Report voice state to parent
    useEffect(() => {
        onVoiceStateChange?.(isVoiceMode, glowIntensity);
    }, [isVoiceMode, glowIntensity, onVoiceStateChange]);

    // Voice mode audio handling
    useEffect(() => {
        if (mode !== 'voice') return;

        let mounted = true;

        const startAudio = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                if (!mounted) {
                    stream.getTracks().forEach(t => t.stop());
                    return;
                }

                streamRef.current = stream;
                const ctx = new AudioContext();
                audioContextRef.current = ctx;

                const analyser = ctx.createAnalyser();
                analyser.fftSize = 512;
                analyserRef.current = analyser;

                ctx.createMediaStreamSource(stream).connect(analyser);
                setMicAvailable(true);

                const updateVisualizer = () => {
                    if (!analyserRef.current || !mounted) return;

                    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
                    analyserRef.current.getByteFrequencyData(data);

                    const relevant = data.slice(0, 100);
                    setVisualizerData(new Uint8Array(relevant));
                    setVolume(relevant.reduce((a, b) => a + b, 0) / relevant.length);

                    rafRef.current = requestAnimationFrame(updateVisualizer);
                };

                updateVisualizer();
                startSpeechRecognition();
            } catch (err) {
                console.error('Microphone error:', err);
                setMicAvailable(false);
                setMode('text');
            }
        };

        startAudio();

        return () => {
            mounted = false;
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            audioContextRef.current?.close();
            streamRef.current?.getTracks().forEach(t => t.stop());
            recognitionRef.current?.stop();
            setVisualizerData(new Uint8Array(100).fill(0));
        };
    }, [mode]);

    const startSpeechRecognition = () => {
        const SpeechAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechAPI) return;

        const recognition = new SpeechAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        let accumulated = '';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i][0].transcript.trim();
                if (event.results[i].isFinal) {
                    accumulated += (accumulated ? ' ' : '') + result;
                } else {
                    interim += result;
                }
            }
            setInterimTranscript(accumulated + (accumulated && interim ? ' ' : '') + interim);
        };

        recognition.onerror = (e: SpeechRecognitionErrorEvent) => console.error('Speech error:', e.error);
        recognition.start();
        recognitionRef.current = recognition;
    };

    // Textarea auto-resize
    const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setText(value);
        if (interimTranscript) setInterimTranscript('');

        // Calculate new height
        const el = e.target;
        el.style.height = `${MIN_HEIGHT}px`;
        const newHeight = Math.min(Math.max(el.scrollHeight, MIN_HEIGHT), MAX_HEIGHT);
        setTextareaHeight(newHeight);
    }, [interimTranscript]);

    const handleSend = useCallback(() => {
        const finalText = isVoiceMode && interimTranscript
            ? text + (text ? ' ' : '') + interimTranscript
            : text;

        if (!finalText.trim() && attachedImages.length === 0) return;

        onSend(finalText.trim(), attachedImages.length > 0 ? attachedImages.map(i => i.url) : undefined, deepThinking);

        // Reset state
        setText('');
        setInterimTranscript('');
        setAttachedImages([]);
        setMode('text');
        setTextareaHeight(MIN_HEIGHT);
    }, [isVoiceMode, interimTranscript, text, attachedImages, onSend, deepThinking]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey && !isAiBusy) {
            e.preventDefault();
            handleSend();
        }
    }, [handleSend, isAiBusy]);

    const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                setAttachedImages(prev => [...prev, {
                    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                    url: URL.createObjectURL(file),
                    file
                }]);
            }
        });

        if (fileInputRef.current) fileInputRef.current.value = '';
    }, []);

    const handleRemoveImage = useCallback((id: string) => {
        setAttachedImages(prev => {
            const img = prev.find(i => i.id === id);
            if (img) URL.revokeObjectURL(img.url);
            return prev.filter(i => i.id !== id);
        });
    }, []);

    return (
        <div
            className={`
                relative flex items-end gap-3 rounded-[28px] p-2 w-full max-w-[632px] min-h-14
                ${isMovingGlowVariant ? 'bg-transparent overflow-hidden' : 'bg-white border border-gray-200'}
                ${isGlowVariant ? 'overflow-visible' : ''}
                ${isVoiceMode && isGlowVariant ? 'shadow-lg' : ''}
            `}
        >
            {/* Visual Effects */}
            {isGlowVariant && <GlowEffect intensity={glowIntensity} isActive={isVoiceMode} />}
            {isMovingGlowVariant && <MovingGlowEffect isActive={isVoiceMode} />}
            {isIntelligenceVariant && !splitView && <IntelligenceEffect isActive={isVoiceMode} intensity={glowIntensity} contained={false} />}

            {/* Hidden file input */}
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />

            <div className="relative z-20 flex flex-col w-full gap-2">
                {/* Attached Images */}
                {attachedImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 px-2 pt-2">
                        {attachedImages.map(img => (
                            <div key={img.id} className="relative group w-16 h-16 rounded-lg border-2 border-gray-200 overflow-visible bg-white">
                                <img src={img.url} alt="Attachment" className="w-full h-full object-cover rounded-lg" />
                                <button
                                    onClick={() => handleRemoveImage(img.id)}
                                    className="absolute -top-2 -right-2 w-5 h-5 bg-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label="Remove"
                                >
                                    <X size={12} className="text-white" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Input Row */}
                <AnimatePresence mode="wait">
                    {showInputMode ? (
                        <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-end w-full gap-3">
                            {/* Plus Button with Dropdown */}
                            <Dropdown
                                trigger={
                                    <motion.button
                                        whileHover={{ backgroundColor: '#e6f2f9' }}
                                        whileTap={{ backgroundColor: '#F2F8FC' }}
                                        transition={{ duration: 0 }}
                                        className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full"
                                        style={{ backgroundColor: plusDropdownOpen ? '#e6f2f9' : 'transparent' }}
                                        aria-label="Add attachment"
                                    >
                                        <Plus
                                            size={28}
                                            strokeWidth={plusDropdownOpen ? 2 : 1}
                                            color={plusDropdownOpen ? '#005B92' : '#232323'}
                                        />
                                    </motion.button>
                                }
                                items={[
                                    {
                                        icon: <Image size={18} />,
                                        label: 'Upload Image',
                                        onClick: () => fileInputRef.current?.click(),
                                    },
                                    {
                                        icon: <FileText size={18} />,
                                        label: 'Upload Document',
                                        onClick: () => { },
                                    },
                                ]}
                                position="left"
                                direction={dropdownAbove ? 'up' : 'down'}
                                isOpen={plusDropdownOpen}
                                onOpenChange={setPlusDropdownOpen}
                            />

                            {/* Textarea */}
                            <textarea
                                ref={textareaRef}
                                rows={1}
                                className="flex-1 min-w-0 border-none outline-none text-base text-gray-900 resize-none bg-transparent"
                                style={{ height: `${textareaHeight}px`, maxHeight: `${MAX_HEIGHT}px`, lineHeight: '24px', paddingTop: '8px', paddingBottom: '8px' }}
                                placeholder={isVoiceMode && (isGlowVariant || isMovingGlowVariant || isIntelligenceVariant) ? "Listening..." : "How can Expert AI help?"}
                                value={displayValue}
                                onChange={handleTextChange}
                                onKeyDown={handleKeyDown}
                            />

                            {/* Mic Button */}
                            <div className="relative" onMouseEnter={() => micAvailable === false && setShowMicTooltip(true)} onMouseLeave={() => setShowMicTooltip(false)}>
                                <motion.button
                                    whileHover={micAvailable !== false ? { backgroundColor: '#e6f2f9' } : {}}
                                    whileTap={micAvailable !== false ? { backgroundColor: '#F2F8FC' } : {}}
                                    transition={{ duration: 0 }}
                                    className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full"
                                    style={{
                                        backgroundColor: isVoiceMode && (isGlowVariant || isMovingGlowVariant || isIntelligenceVariant) ? '#e6f2f9' : 'transparent'
                                    }}
                                    onClick={micAvailable !== false ? (isVoiceMode ? () => { if (interimTranscript) setText(prev => prev + (prev ? ' ' : '') + interimTranscript.trim()); setInterimTranscript(''); setMode('text'); } : () => { setText(''); setInterimTranscript(''); setMode('voice'); }) : undefined}
                                    disabled={micAvailable === false}
                                    aria-label={micAvailable === false ? "No microphone" : isVoiceMode ? "Stop" : "Record"}
                                >
                                    <Mic
                                        size={24}
                                        strokeWidth={isVoiceMode && (isGlowVariant || isMovingGlowVariant || isIntelligenceVariant) ? 2 : 1}
                                        color={micAvailable === false ? '#d1d5db' : isVoiceMode && (isGlowVariant || isMovingGlowVariant || isIntelligenceVariant) ? '#005B92' : '#374151'}
                                    />
                                </motion.button>

                                <AnimatePresence>
                                    {showMicTooltip && micAvailable === false && (
                                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
                                            <div className="bg-[#232323] text-white text-xs px-2 py-1 whitespace-nowrap">No microphone detected</div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Send/Stop Button */}
                            <motion.button
                                className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors ${isAiBusy || hasContent ? 'bg-gray-900 text-white' : 'bg-black/35 text-white'
                                    }`}
                                onClick={isAiBusy ? onStop : handleSend}
                                disabled={!isAiBusy && !hasContent}
                                aria-label={isAiBusy ? "Stop" : "Send"}
                            >
                                {isAiBusy ? <Square size={16} fill="currentColor" /> : <ArrowUp size={20} />}
                            </motion.button>
                        </motion.div>
                    ) : (
                        /* Waveform Mode */
                        <motion.div key="waveform" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center w-full gap-3 h-10">
                            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-gray-500">
                                <Plus size={24} strokeWidth={1} />
                            </div>
                            <Waveform data={visualizerData} />
                            <motion.button className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full text-gray-700 hover:bg-gray-100" onClick={() => { setInterimTranscript(''); setMode('text'); }} aria-label="Cancel">
                                <X size={24} strokeWidth={1} />
                            </motion.button>
                            <motion.button className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-900 text-white" onClick={() => { if (interimTranscript) setText(prev => prev + (prev ? ' ' : '') + interimTranscript.trim()); setInterimTranscript(''); setMode('text'); }} aria-label="Confirm">
                                <Check size={20} strokeWidth={2} />
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
}

declare global {
    interface Window {
        SpeechRecognition?: new () => SpeechRecognitionInstance;
        webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    }
}
