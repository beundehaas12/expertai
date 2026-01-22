import { useState, useRef, useCallback, useEffect } from 'react';
import type { SpeechRecognitionState } from '@/types';

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message?: string;
}

interface SpeechRecognition extends EventTarget {
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

type SpeechRecognitionConstructor = new () => SpeechRecognition;

declare global {
    interface Window {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
    }
}

interface UseSpeechRecognitionOptions {
    language?: string;
    continuous?: boolean;
}

interface UseSpeechRecognitionReturn extends SpeechRecognitionState {
    start: () => void;
    stop: () => void;
    reset: () => void;
    isSupported: boolean;
}

export function useSpeechRecognition(
    options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
    const { language = 'en-US', continuous = true } = options;

    const [state, setState] = useState<SpeechRecognitionState>({
        transcript: '',
        interimTranscript: '',
        isListening: false,
        error: null,
    });

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const accumulatedFinalsRef = useRef<string>('');

    const isSupported = typeof window !== 'undefined' &&
        !!(window.SpeechRecognition || window.webkitSpeechRecognition);

    const start = useCallback(() => {
        if (!isSupported) {
            setState(prev => ({
                ...prev,
                error: 'Speech Recognition not supported in this browser.',
            }));
            return;
        }

        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionAPI) return;

        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = continuous;
        recognition.interimResults = true;
        recognition.lang = language;

        // Reset accumulated finals for new session
        accumulatedFinalsRef.current = '';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let interim = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    const finalText = event.results[i][0].transcript.trim();
                    accumulatedFinalsRef.current +=
                        (accumulatedFinalsRef.current ? ' ' : '') + finalText;
                } else {
                    interim += event.results[i][0].transcript;
                }
            }

            // Display accumulated finals + current interim
            const fullInterim = accumulatedFinalsRef.current +
                (accumulatedFinalsRef.current && interim ? ' ' : '') + interim;

            setState(prev => ({
                ...prev,
                interimTranscript: fullInterim,
                error: null,
            }));
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error:', event.error);
            setState(prev => ({
                ...prev,
                error: event.error,
                isListening: false,
            }));
        };

        recognition.onend = () => {
            setState(prev => ({
                ...prev,
                isListening: false,
            }));
        };

        recognition.start();
        recognitionRef.current = recognition;

        setState(prev => ({
            ...prev,
            isListening: true,
            error: null,
        }));
    }, [isSupported, language, continuous]);

    const stop = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }

        // Commit interim to transcript
        setState(prev => ({
            ...prev,
            transcript: prev.interimTranscript || prev.transcript,
            interimTranscript: '',
            isListening: false,
        }));
    }, []);

    const reset = useCallback(() => {
        accumulatedFinalsRef.current = '';
        setState({
            transcript: '',
            interimTranscript: '',
            isListening: false,
            error: null,
        });
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
                recognitionRef.current = null;
            }
        };
    }, []);

    return {
        ...state,
        start,
        stop,
        reset,
        isSupported,
    };
}
