import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, ArrowUp, Plus, X, Check, Image, FileText } from 'lucide-react';
import { Waveform } from './Waveform';
import { GlowEffect } from './GlowEffect';
import { MovingGlowEffect } from './MovingGlowEffect';
import { IntelligenceEffect } from './IntelligenceEffect';
import type { VoiceVariant, VoiceInputMode } from '@/types';

interface VoiceInputProps {
    onSend: (text: string) => void;
    variant?: VoiceVariant;
    dropdownAbove?: boolean;
    splitView?: boolean;
    onVoiceStateChange?: (isVoiceMode: boolean, intensity: number) => void;
}

export function VoiceInput({ onSend, variant = 'waveform', dropdownAbove = false, splitView = false, onVoiceStateChange }: VoiceInputProps) {
    const [mode, setMode] = useState<VoiceInputMode>('text');
    const [textValue, setTextValue] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [visualizerData, setVisualizerData] = useState<Uint8Array>(new Uint8Array(100).fill(0));
    const [volume, setVolume] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [micError, setMicError] = useState<string | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const rafRef = useRef<number | null>(null);
    const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

    // Auto-focus input when switching to text mode
    useEffect(() => {
        if (mode === 'text' && inputRef.current) {
            inputRef.current.focus();
        }
    }, [mode]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    // Report voice state changes to parent
    useEffect(() => {
        if (onVoiceStateChange) {
            const isVoiceMode = mode === 'voice';
            const intensity = volume / 255;
            onVoiceStateChange(isVoiceMode, intensity);
        }
    }, [mode, volume, onVoiceStateChange]);

    // Audio and speech recognition - direct implementation like original
    useEffect(() => {
        if (mode === 'voice') {
            // Initialize with non-zero values for visibility
            setVisualizerData(new Uint8Array(100).fill(10));
            startAudio();
        } else {
            stopAudio();
        }
        return () => stopAudio();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode]);

    const startAudio = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            audioContextRef.current = audioCtx;
            await audioCtx.resume();

            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 512; // Same as original
            analyserRef.current = analyser;

            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);
            sourceRef.current = source;

            // Small delay before starting visualization
            setTimeout(() => {
                updateVisualizer();
            }, 100);

            // Start speech recognition
            startSpeechRecognition();
        } catch (err) {
            console.error('Error accessing microphone:', err);
            const errorMessage = err instanceof Error ? err.message : String(err);
            // Show subtle inline error instead of native alert
            setMicError(errorMessage === 'Invalid constraint'
                ? 'No microphone detected'
                : `Microphone unavailable: ${errorMessage}`
            );
            setMode('text');
            // Auto-clear error after 4 seconds
            setTimeout(() => setMicError(null), 4000);
        }
    };

    const stopAudio = () => {
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        if (sourceRef.current) {
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setVisualizerData(new Uint8Array(100).fill(0));
    };

    const updateVisualizer = () => {
        if (!analyserRef.current) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        const relevantData = dataArray.slice(0, 100);
        setVisualizerData(new Uint8Array(relevantData));

        // Calculate volume for glow effect
        const sum = relevantData.reduce((a, b) => a + b, 0);
        setVolume(sum / relevantData.length);

        rafRef.current = requestAnimationFrame(updateVisualizer);
    };

    const startSpeechRecognition = () => {
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionAPI) {
            console.warn('Speech Recognition not supported in this browser.');
            return;
        }

        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        // Use ref to accumulate final results during this voice session
        const accumulatedFinals = { current: '' };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    const finalText = event.results[i][0].transcript.trim();
                    accumulatedFinals.current += (accumulatedFinals.current ? ' ' : '') + finalText;
                } else {
                    interim += event.results[i][0].transcript;
                }
            }
            // Display accumulated finals + current interim
            setInterimTranscript(accumulatedFinals.current + (accumulatedFinals.current && interim ? ' ' : '') + interim);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error:', event.error);
        };

        recognition.start();
        recognitionRef.current = recognition;
    };

    const handleMicClick = useCallback(() => {
        setTextValue('');
        setInterimTranscript('');
        setMode('voice');
    }, []);

    const handleCancel = useCallback(() => {
        setInterimTranscript('');
        setMode('text');
    }, []);

    const handleConfirm = useCallback(() => {
        if (interimTranscript) {
            setTextValue(prev => prev + (prev ? ' ' : '') + interimTranscript.trim());
            setInterimTranscript('');
        }
        setMode('text');
    }, [interimTranscript]);

    const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (interimTranscript) {
            setInterimTranscript('');
        }
        setTextValue(e.target.value);
    }, [interimTranscript]);

    const handleSend = useCallback(() => {
        const finalText = mode === 'voice' && interimTranscript
            ? textValue + (textValue ? ' ' : '') + interimTranscript
            : textValue;

        if (finalText.trim()) {
            onSend(finalText.trim());
            setTextValue('');
            setInterimTranscript('');
            setMode('text');
        }
    }, [mode, interimTranscript, textValue, onSend]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }, [handleSend]);

    const displayValue = mode === 'voice' && interimTranscript
        ? textValue + (textValue ? ' ' : '') + interimTranscript
        : textValue;

    const hasContent = displayValue.trim().length > 0;
    const glowIntensity = volume / 255;
    const isGlowVariant = variant === 'glow';
    const isMovingGlowVariant = variant === 'moving-glow';
    const isIntelligenceVariant = variant === 'intelligence';
    const isVoiceMode = mode === 'voice';
    const showInputMode = mode === 'text' || (isVoiceMode && (isGlowVariant || isMovingGlowVariant || isIntelligenceVariant));

    return (
        <div
            className={`
        relative flex items-center gap-3 
        rounded-full p-2 
        w-full max-w-[632px] h-14
        ${isMovingGlowVariant ? 'bg-transparent overflow-hidden' : 'bg-white border border-gray-200'}
        ${isGlowVariant ? 'overflow-visible' : ''}
        ${isVoiceMode && isGlowVariant ? 'shadow-lg' : ''}
      `}
        >
            {/* Microphone Error Toast */}
            <AnimatePresence>
                {micError && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        className="absolute -top-14 left-1/2 -translate-x-1/2 z-50"
                    >
                        <div className="bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2 whitespace-nowrap">
                            <Mic size={14} className="text-red-400" />
                            <span>{micError}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Glow Effect for glow variant */}
            {isGlowVariant && (
                <GlowEffect intensity={glowIntensity} isActive={isVoiceMode} />
            )}

            {/* Moving Glow Effect for moving-glow variant */}
            {isMovingGlowVariant && (
                <MovingGlowEffect isActive={isVoiceMode} />
            )}

            {/* Intelligence Effect for intelligence variant - only when NOT in split view (App handles split view) */}
            {isIntelligenceVariant && !splitView && (
                <IntelligenceEffect isActive={isVoiceMode} intensity={glowIntensity} contained={false} />
            )}

            {/* Main Content */}
            <div className="relative z-10 flex items-center w-full h-full gap-3">
                <AnimatePresence mode="wait">
                    {showInputMode ? (
                        <motion.div
                            key="text-mode"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center w-full h-full gap-3"
                        >
                            {/* Plus Button with Dropdown */}
                            <div className="relative">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                                    aria-label="Add attachment"
                                    onClick={() => setShowDropdown(!showDropdown)}
                                >
                                    <Plus size={28} strokeWidth={1} />
                                </motion.button>

                                {/* Dropdown Menu */}
                                {showDropdown && (
                                    <div
                                        ref={dropdownRef}
                                        className={`absolute left-0 bg-white rounded-lg shadow-lg border border-[#DADADA] overflow-hidden min-w-[180px] z-50 ${dropdownAbove ? 'bottom-full mb-2' : 'top-full mt-2'}`}
                                        style={{ borderRadius: '8px' }}
                                    >
                                        <button
                                            className="w-full px-4 py-3 flex items-center gap-3 text-gray-700 hover:bg-gray-50 transition-colors text-left whitespace-nowrap"
                                            onClick={() => setShowDropdown(false)}
                                        >
                                            <Image size={18} className="text-gray-500" />
                                            <span className="text-sm">Upload Image</span>
                                        </button>
                                        <button
                                            className="w-full px-4 py-3 flex items-center gap-3 text-gray-700 hover:bg-gray-50 transition-colors text-left whitespace-nowrap"
                                            onClick={() => setShowDropdown(false)}
                                        >
                                            <FileText size={18} className="text-gray-500" />
                                            <span className="text-sm">Upload Document</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Text Input */}
                            <input
                                ref={inputRef}
                                type="text"
                                className="flex-1 min-w-0 h-full bg-transparent border-none outline-none text-base text-gray-900 font-light placeholder:text-gray-400 placeholder:font-extralight text-ellipsis"
                                placeholder={isVoiceMode && (isGlowVariant || isMovingGlowVariant || isIntelligenceVariant) ? "Listening..." : "How can Expert AI help?"}
                                value={displayValue}
                                onChange={handleTextChange}
                                onKeyDown={handleKeyDown}
                            />

                            {/* Mic Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`
                  flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full
                  transition-colors duration-200
                  ${isVoiceMode && (isGlowVariant || isMovingGlowVariant || isIntelligenceVariant) ? 'text-blue-500' : 'text-gray-700 hover:bg-gray-100'}
                `}
                                onClick={isVoiceMode ? handleConfirm : handleMicClick}
                                aria-label={isVoiceMode ? "Stop Listening" : "Use Microphone"}
                            >
                                <Mic size={24} />
                            </motion.button>

                            {/* Send Button */}
                            <motion.button
                                whileHover={hasContent ? { scale: 1.05 } : {}}
                                whileTap={hasContent ? { scale: 0.95 } : {}}
                                className={`
                  flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full
                  transition-all duration-200
                  ${hasContent
                                        ? 'bg-gray-900 text-white cursor-pointer hover:bg-gray-700'
                                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    }
                `}
                                onClick={handleSend}
                                disabled={!hasContent}
                                aria-label="Send"
                            >
                                <ArrowUp size={20} />
                            </motion.button>
                        </motion.div>
                    ) : (
                        /* Voice Mode - Waveform Variant */
                        <motion.div
                            key="voice-mode"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center w-full h-full gap-3"
                        >
                            {/* Plus Button (disabled) */}
                            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-gray-500">
                                <Plus size={24} strokeWidth={1.5} />
                            </div>

                            {/* Waveform */}
                            <Waveform data={visualizerData} />

                            {/* Cancel Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
                                onClick={handleCancel}
                                aria-label="Cancel"
                            >
                                <X size={24} strokeWidth={1.5} />
                            </motion.button>

                            {/* Confirm Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-900 text-white hover:bg-gray-700 transition-colors"
                                onClick={handleConfirm}
                                aria-label="Confirm"
                            >
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
    message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    abort: () => void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
    interface Window {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
    }
}
