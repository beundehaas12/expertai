import { useState, useRef, useEffect, useCallback } from 'react';
import type { AudioVisualizerState } from '@/types';

interface UseAudioVisualizerOptions {
    fftSize?: number;
    barCount?: number;
}

interface UseAudioVisualizerReturn extends AudioVisualizerState {
    start: () => Promise<void>;
    stop: () => void;
}

export function useAudioVisualizer(
    options: UseAudioVisualizerOptions = {}
): UseAudioVisualizerReturn {
    const { fftSize = 1024, barCount = 100 } = options;

    const [state, setState] = useState<AudioVisualizerState>({
        data: new Uint8Array(barCount).fill(0),
        volume: 0,
        isActive: false,
    });

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const rafRef = useRef<number | null>(null);

    const updateVisualizer = useCallback(() => {
        if (!analyserRef.current) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Extract relevant frequency data (voice range is typically lower frequencies)
        const relevantData = dataArray.slice(0, barCount);

        // Calculate average volume
        const sum = relevantData.reduce((a, b) => a + b, 0);
        const volume = sum / relevantData.length;

        setState({
            data: new Uint8Array(relevantData),
            volume,
            isActive: true,
        });

        rafRef.current = requestAnimationFrame(updateVisualizer);
    }, [barCount]);

    const start = useCallback(async () => {
        try {
            // Initialize with non-zero values for visibility
            setState(prev => ({
                ...prev,
                data: new Uint8Array(barCount).fill(10),
                isActive: true,
            }));

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            audioContextRef.current = audioCtx;
            await audioCtx.resume();

            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = fftSize;
            analyserRef.current = analyser;

            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);
            sourceRef.current = source;

            // Small delay before starting visualization
            setTimeout(() => {
                updateVisualizer();
            }, 100);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            setState(prev => ({ ...prev, isActive: false }));
        }
    }, [barCount, fftSize, updateVisualizer]);

    const stop = useCallback(() => {
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

        setState({
            data: new Uint8Array(barCount).fill(0),
            volume: 0,
            isActive: false,
        });
    }, [barCount]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stop();
        };
    }, [stop]);

    return {
        ...state,
        start,
        stop,
    };
}
