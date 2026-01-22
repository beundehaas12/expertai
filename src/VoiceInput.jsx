import React, { useState, useRef, useEffect } from 'react';
import './VoiceInput.css';

// --- Icons ---
const MicIcon = ({ size = 24, strokeWidth = 1.5 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
);

const ArrowUpIcon = ({ size = 24, strokeWidth = 1.5 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 12 7-7 7 7" />
        <path d="M12 19V5" />
    </svg>
);

const PlusIcon = ({ size = 28, strokeWidth = 1 }) => ( // Size 28, Thin stroke
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="square" strokeLinejoin="miter">
        <path d="M5 12h14M12 5v14" />
    </svg>
);

const XIcon = ({ size = 24, strokeWidth = 1.5 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18M6 6l12 12" />
    </svg>
);

const CheckIcon = ({ size = 24, strokeWidth = 1.5 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
    </svg>
);

const VoiceInput = ({ onSend, variant = 'waveform' }) => {
    const [mode, setMode] = useState('text'); // 'text' | 'voice'
    const [transcript, setTranscript] = useState('');
    const [visualizerData, setVisualizerData] = useState(new Uint8Array(40).fill(0));

    const inputRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceRef = useRef(null);
    const rafRef = useRef(null);
    const streamRef = useRef(null);
    const recognitionRef = useRef(null);
    const [interimTranscript, setInterimTranscript] = useState('');

    // Auto-focus input when switching back to text mode
    useEffect(() => {
        if (mode === 'text' && inputRef.current) {
            inputRef.current.focus();
        }
    }, [mode]);

    // Audio Logic
    useEffect(() => {
        if (mode === 'voice') {
            // Initialize with non-zero values for visibility
            setVisualizerData(new Uint8Array(100).fill(10));
            startAudio();
        } else {
            stopAudio();
        }
        return () => stopAudio();
    }, [mode]);

    const startAudio = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            audioContextRef.current = audioCtx;
            await audioCtx.resume();

            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 1024; // Larger fftSize
            analyserRef.current = analyser;

            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);
            sourceRef.current = source;

            // Small delay so user sees the initial idle bars before audio data starts updating
            setTimeout(() => {
                updateVisualizer();
            }, 100);

            // Start speech recognition
            startSpeechRecognition();
        } catch (err) {
            console.error("Error accessing microphone:", err);
            // Fallback or error state could go here
        }
    };

    const stopAudio = () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
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
        // Reset visualizer
        setVisualizerData(new Uint8Array(100).fill(0));
    };

    const updateVisualizer = () => {
        if (!analyserRef.current) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        // We have 128 bins, let's pick 40 roughly evenly spaced or just the lower frequencies (voice)
        // Voice range is typically lower, so let's grab the first 40 meaningful bins
        // But let's verify fftSize/rate. 
        const relevantData = dataArray.slice(0, 100);
        setVisualizerData(new Uint8Array(relevantData));

        rafRef.current = requestAnimationFrame(updateVisualizer);
    };

    // Speech Recognition
    const startSpeechRecognition = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn('Speech Recognition not supported in this browser.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        // Use ref to accumulate final results during this voice session
        const accumulatedFinals = { current: '' };

        recognition.onresult = (event) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    // Accumulate final results in ref (not state, to avoid re-render issues)
                    const finalText = event.results[i][0].transcript.trim();
                    accumulatedFinals.current += (accumulatedFinals.current ? ' ' : '') + finalText;
                } else {
                    interim += event.results[i][0].transcript;
                }
            }
            // Display accumulated finals + current interim
            setInterimTranscript(accumulatedFinals.current + (accumulatedFinals.current && interim ? ' ' : '') + interim);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
        };

        recognition.start();
        recognitionRef.current = recognition;
    };

    const handleMicClick = () => {
        setTranscript(''); // Clear previous input for fresh start
        setInterimTranscript('');
        setMode('voice');
    };

    const handleCancel = () => {
        setMode('text');
    };

    const handleConfirm = () => {
        // Only append any remaining interim text (in-progress speech)
        // Final results are already in transcript from onresult handler
        if (interimTranscript) {
            setTranscript(prev => prev + (prev ? ' ' : '') + interimTranscript.trim());
            setInterimTranscript('');
        }
        setMode('text');
    };

    const handleTextChange = (e) => {
        // When user types, commit any pending interim transcript and clear it
        // This prevents duplication when switching from voice to typing
        if (interimTranscript) {
            setInterimTranscript('');
        }
        setTranscript(e.target.value);
    };

    // Calculate volume for glow effect
    const getAverageVolume = () => {
        if (!visualizerData || visualizerData.length === 0) return 0;
        const sum = visualizerData.reduce((a, b) => a + b, 0);
        return sum / visualizerData.length;
    };

    const volume = getAverageVolume();

    // Angular gradient glow - controlled via CSS variable
    const glowIntensity = volume / 255;
    // Opacity ranges from 0.05 (silent) to 0.95 (loud)
    const glowOpacity = 0.05 + glowIntensity * 0.9;
    const glowStyle = variant === 'glow' && mode === 'voice' ? {
        '--glow-opacity': glowOpacity,
    } : {};

    return (
        <div
            className={`voice-input-container ${mode === 'voice' ? 'talking' : ''} ${variant === 'glow' ? 'variant-glow' : ''}`}
            style={glowStyle}
        >
            {/* Inner white background to mask gradient in glow mode */}
            {variant === 'glow' && <div className="glow-inner-bg" />}

            {/* Main Content */}
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', width: '100%', height: '100%', gap: '12px' }}>

                {mode === 'text' || (mode === 'voice' && variant === 'glow') ? (
                    <>
                        <div className="icon-btn" aria-hidden="true" style={{ width: '40px', height: '40px' }}>
                            <PlusIcon size={28} strokeWidth={1} />
                        </div>

                        <input
                            ref={inputRef}
                            type="text"
                            className="text-input-field"
                            placeholder={mode === 'voice' && variant === 'glow' ? "Listening..." : "How can Expert AI help?"}
                            value={mode === 'voice' && interimTranscript ? (transcript + (transcript ? ' ' : '') + interimTranscript) : transcript}
                            onChange={handleTextChange}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && onSend) {
                                    // If speaking, finalize first
                                    const finalTranscript = mode === 'voice' && interimTranscript ? (transcript + (transcript ? ' ' : '') + interimTranscript) : transcript;
                                    if (finalTranscript) {
                                        onSend(finalTranscript);
                                        setTranscript('');
                                        setInterimTranscript('');
                                        setMode('text');
                                    }
                                }
                            }}
                        />

                        <button
                            className="icon-btn"
                            onClick={mode === 'voice' ? handleConfirm : handleMicClick}
                            aria-label={mode === 'voice' ? "Stop Listening" : "Use Microphone"}
                            style={{ color: mode === 'voice' && variant === 'glow' ? '#007AFF' : 'inherit' }}
                        >
                            <MicIcon size={24} />
                        </button>

                        <button
                            className={`icon-btn send-btn ${transcript || interimTranscript ? 'active' : ''}`}
                            onClick={() => {
                                const finalTranscript = mode === 'voice' && interimTranscript ? (transcript + (transcript ? ' ' : '') + interimTranscript) : transcript;
                                if (onSend && finalTranscript) {
                                    onSend(finalTranscript);
                                    setTranscript('');
                                    setInterimTranscript('');
                                    setMode('text');
                                }
                            }}
                            disabled={!transcript && !interimTranscript}
                            aria-label="Send"
                        >
                            <ArrowUpIcon size={20} />
                        </button>
                    </>
                ) : (
                    /* Voice Mode (Waveform Variant) */
                    <div className="voice-mode-content">
                        <div className="icon-btn" aria-hidden="true" style={{ cursor: 'default' }}>
                            <PlusIcon size={24} strokeWidth={1.5} />
                        </div>

                        <div className="voice-input-waveform">
                            {Array.from(visualizerData).map((value, i) => {
                                const heightPercent = 10 + (value / 255) * 90;
                                const isSilent = value <= 10;
                                return (
                                    <div
                                        key={i}
                                        className="waveform-bar"
                                        style={{
                                            height: `${heightPercent}%`,
                                            backgroundColor: isSilent ? '#d1d5db' : '#000000',
                                            transition: 'height 0.1s ease, background-color 0.1s ease'
                                        }}
                                    />
                                );
                            })}
                        </div>

                        <button className="icon-btn" onClick={handleCancel} aria-label="Cancel">
                            <XIcon size={24} strokeWidth={1.5} />
                        </button>
                        <button className="icon-btn confirm-btn" onClick={handleConfirm} aria-label="Confirm">
                            <CheckIcon size={20} strokeWidth={2} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoiceInput;
