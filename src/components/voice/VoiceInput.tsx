import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, ArrowUp, Plus, X, Check, Image, FileText, Square } from 'lucide-react';
import { Waveform } from './Waveform';
import { GlowEffect } from './GlowEffect';
import { MovingGlowEffect } from './MovingGlowEffect';
import { IntelligenceEffect } from './IntelligenceEffect';
import type { VoiceVariant, VoiceInputMode } from '@/types';

interface VoiceInputProps {
    onSend: (text: string, images?: string[], deepThinking?: boolean) => void;
    variant?: VoiceVariant;
    dropdownAbove?: boolean;
    splitView?: boolean;
    onVoiceStateChange?: (isVoiceMode: boolean, intensity: number) => void;
    isAiBusy?: boolean;
    onStop?: () => void;
    deepThinking?: boolean;
}

export function VoiceInput({ onSend, variant = 'waveform', dropdownAbove = false, splitView = false, onVoiceStateChange, isAiBusy = false, onStop, deepThinking = false }: VoiceInputProps) {
    const [mode, setMode] = useState<VoiceInputMode>('text');
    const [textValue, setTextValue] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [visualizerData, setVisualizerData] = useState<Uint8Array>(new Uint8Array(100).fill(0));
    const [volume, setVolume] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [micAvailable, setMicAvailable] = useState<boolean | null>(null); // null = checking, true = available, false = unavailable
    const [showMicTooltip, setShowMicTooltip] = useState(false);
    const [attachedImages, setAttachedImages] = useState<{ id: string; url: string; file: File }[]>([]);

    const inputRef = useRef<HTMLTextAreaElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const rafRef = useRef<number | null>(null);
    const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
    const micCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Check microphone availability
    const checkMicrophoneAvailability = useCallback(async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const hasAudioInput = devices.some(device => device.kind === 'audioinput');
            setMicAvailable(hasAudioInput);
            return hasAudioInput;
        } catch {
            setMicAvailable(false);
            return false;
        }
    }, []);

    // Check microphone on mount and periodically
    useEffect(() => {
        checkMicrophoneAvailability();

        // Listen for device changes (microphone plugged in/out)
        const handleDeviceChange = () => {
            checkMicrophoneAvailability();
        };
        navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);

        // Also check periodically as a fallback (every 3 seconds)
        micCheckIntervalRef.current = setInterval(checkMicrophoneAvailability, 3000);

        return () => {
            navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
            if (micCheckIntervalRef.current) {
                clearInterval(micCheckIntervalRef.current);
            }
        };
    }, [checkMicrophoneAvailability]);

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

            // Mark mic as available since we got a stream
            setMicAvailable(true);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            setMicAvailable(false);
            setMode('text');
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

    const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (interimTranscript) {
            setInterimTranscript('');
        }
        setTextValue(e.target.value);

        // Auto-resize textarea - cap at 200px then scroll
        const textarea = e.target;
        const maxHeight = 200;

        // Temporarily reset to measure true scrollHeight
        textarea.style.height = '40px';
        const scrollHeight = textarea.scrollHeight;

        if (scrollHeight <= maxHeight) {
            textarea.style.height = Math.max(40, scrollHeight) + 'px';
            textarea.style.overflowY = 'hidden';
        } else {
            textarea.style.height = maxHeight + 'px';
            textarea.style.overflowY = 'auto';
        }
    }, [interimTranscript]);

    // Handle image file selection
    const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const url = URL.createObjectURL(file);
                setAttachedImages(prev => [...prev, {
                    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    url,
                    file
                }]);
            }
        });

        // Reset input so same file can be selected again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    // Remove an attached image
    const handleRemoveImage = useCallback((id: string) => {
        setAttachedImages(prev => {
            const image = prev.find(img => img.id === id);
            if (image) {
                URL.revokeObjectURL(image.url);
            }
            return prev.filter(img => img.id !== id);
        });
    }, []);

    const handleSend = useCallback(() => {
        const finalText = mode === 'voice' && interimTranscript
            ? textValue + (textValue ? ' ' : '') + interimTranscript
            : textValue;

        if (finalText.trim() || attachedImages.length > 0) {
            // Pass image URLs and deep thinking mode to onSend
            const imageUrls = attachedImages.map(img => img.url);
            onSend(finalText.trim(), imageUrls.length > 0 ? imageUrls : undefined, deepThinking);
            setTextValue('');
            setInterimTranscript('');
            setAttachedImages([]);
            setMode('text');
        }
    }, [mode, interimTranscript, textValue, onSend, attachedImages, deepThinking]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            // Can only send if AI is not busy
            if (!isAiBusy) {
                handleSend();
            }
        }
    }, [handleSend, isAiBusy]);

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
        relative flex items-end gap-3 
        rounded-[28px] p-2 
        w-full max-w-[632px] min-h-14
        ${isMovingGlowVariant ? 'bg-transparent overflow-hidden' : 'bg-white border border-gray-200'}
        ${isGlowVariant ? 'overflow-visible' : ''}
        ${isVoiceMode && isGlowVariant ? 'shadow-lg' : ''}
      `}
        >
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

            {/* Hidden file input for image upload */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageSelect}
            />

            {/* Main Content - Column layout with attachments above input */}
            <div className="relative z-20 flex flex-col w-full gap-2">
                {/* Image Preview Section */}
                {attachedImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 px-2 pt-2">
                        {attachedImages.map(img => (
                            <div
                                key={img.id}
                                className="relative group w-16 h-16 rounded-lg border-2 border-gray-200 overflow-visible bg-white"
                            >
                                <img
                                    src={img.url}
                                    alt="Attachment preview"
                                    className="w-full h-full object-cover rounded-lg"
                                />
                                {/* Remove button - centered on corner border */}
                                <button
                                    onClick={() => handleRemoveImage(img.id)}
                                    className="absolute -top-2 -right-2 w-5 h-5 bg-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                    aria-label="Remove image"
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
                        <motion.div
                            key="text-mode"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-end w-full gap-3"
                        >
                            {/* Plus Button with Dropdown */}
                            <div className="relative">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                                    style={{ color: '#232323' }}
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
                                            onClick={() => {
                                                setShowDropdown(false);
                                                fileInputRef.current?.click();
                                            }}
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
                            <textarea
                                ref={inputRef}
                                rows={1}
                                className="flex-1 min-w-0 bg-transparent border-none outline-none text-base text-gray-900 font-normal resize-none overflow-y-auto placeholder:truncate placeholder:whitespace-nowrap placeholder:overflow-hidden"
                                style={{ height: '40px', maxHeight: '200px', lineHeight: '24px', paddingTop: '8px', paddingBottom: '8px' }}
                                placeholder={isVoiceMode && (isGlowVariant || isMovingGlowVariant || isIntelligenceVariant) ? "Listening..." : "How can Expert AI help?"}
                                value={displayValue}
                                onChange={handleTextChange}
                                onKeyDown={handleKeyDown}
                            />

                            {/* Mic Button with Tooltip */}
                            <div
                                className="relative"
                                onMouseEnter={() => micAvailable === false && setShowMicTooltip(true)}
                                onMouseLeave={() => setShowMicTooltip(false)}
                            >
                                <motion.button
                                    whileHover={micAvailable !== false ? { scale: 1.05 } : {}}
                                    whileTap={micAvailable !== false ? { scale: 0.95 } : {}}
                                    className={`
                                        flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full
                                        transition-colors duration-200
                                        ${micAvailable === false
                                            ? 'text-gray-300'
                                            : isVoiceMode && (isGlowVariant || isMovingGlowVariant || isIntelligenceVariant)
                                                ? 'text-blue-500'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }
                                    `}
                                    onClick={micAvailable === false ? undefined : (isVoiceMode ? handleConfirm : handleMicClick)}
                                    disabled={micAvailable === false}
                                    aria-label={micAvailable === false ? "No microphone detected" : isVoiceMode ? "Stop Listening" : "Use Microphone"}
                                >
                                    <Mic size={24} />
                                </motion.button>

                                {/* Tooltip for disabled mic - matches SelectionTooltip style */}
                                <AnimatePresence>
                                    {showMicTooltip && micAvailable === false && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 5 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[100]"
                                        >
                                            <div
                                                className="text-white font-normal shadow-lg whitespace-nowrap px-2 flex items-center"
                                                style={{ backgroundColor: '#232323', fontSize: '12px', height: '24px', borderRadius: 0 }}
                                            >
                                                No microphone detected
                                            </div>
                                            {/* Arrow pointing down */}
                                            <div
                                                className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
                                                style={{
                                                    borderLeft: '4px solid transparent',
                                                    borderRight: '4px solid transparent',
                                                    borderTop: '4px solid #232323',
                                                }}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>



                            {/* Send/Stop Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`
                                    flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full
                                    transition-all duration-200
                                    ${isAiBusy
                                        ? 'bg-gray-900 text-white cursor-pointer'
                                        : hasContent
                                            ? 'bg-gray-900 text-white cursor-pointer'
                                            : 'text-white'
                                    }
                                `}
                                style={!isAiBusy && !hasContent ? { backgroundColor: 'rgba(0, 0, 0, 0.35)' } : undefined}
                                onClick={isAiBusy ? onStop : handleSend}
                                disabled={!isAiBusy && !hasContent}
                                aria-label={isAiBusy ? "Stop generation" : "Send"}
                            >
                                {isAiBusy ? <Square size={16} fill="currentColor" /> : <ArrowUp size={20} />}
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
