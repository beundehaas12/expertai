import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ThinkingStep {
    id: string;
    title: string;
    body: string;
    duration: number; // ms to complete
}

const THINKING_STEPS: ThinkingStep[] = [
    { id: 'analyze', title: 'Analyzing', body: 'Your query and identifying key requirements', duration: 2500 },
    { id: 'research', title: 'Researching', body: 'Relevant context, background information, and related knowledge from multiple sources', duration: 3000 },
    { id: 'evaluate', title: 'Evaluating', body: 'Multiple approaches and their trade-offs to find the optimal solution for your specific needs', duration: 2800 },
    { id: 'reference', title: 'Cross-referencing', body: 'Best practices and guidelines', duration: 2600 },
    { id: 'synthesize', title: 'Synthesizing', body: 'All findings into a comprehensive, well-structured response tailored to your question', duration: 2800 },
];

interface DeepThinkingBoxProps {
    onComplete?: (steps: string[]) => void;
    isActive: boolean;
}

// Animated dots component - dots appear one by one
function AnimatedDots() {
    return (
        <span>
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.2 }}
            >.</motion.span>
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.2 }}
            >.</motion.span>
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.2 }}
            >.</motion.span>
        </span>
    );
}

// Rotating gradient border component
function RotatingBorder() {
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
        let animationId: number;
        let lastTime = performance.now();

        const animate = (currentTime: number) => {
            const delta = currentTime - lastTime;
            lastTime = currentTime;
            // Rotate 120 degrees per second (one full rotation every 3 seconds)
            setRotation(prev => (prev + (delta * 0.12)) % 360);
            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationId);
    }, []);

    return (
        <div
            className="absolute rounded-[17.5px]"
            style={{
                top: '-1.5px',
                left: '-1.5px',
                right: '-1.5px',
                bottom: '-1.5px',
                background: `conic-gradient(
                    from ${rotation}deg,
                    #F29097 5%,
                    #E5202E 15%,
                    #F29097 30%,
                    #80BDE1 40%,
                    #007AC3 50%,
                    #80BDE1 60%,
                    #C2DE90 70%,
                    #85BC20 85%,
                    #C2DE90 95%,
                    #F29097 100%
                )`,
            }}
        />
    );
}

export function DeepThinkingBox({ onComplete, isActive }: DeepThinkingBoxProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [showBody, setShowBody] = useState(false);
    const hasCompletedRef = useRef(false);

    useEffect(() => {
        if (!isActive) {
            hasCompletedRef.current = false;
            return;
        }

        // Reset state when becoming active
        setCurrentStepIndex(0);
        setShowBody(false);

        let stepIndex = 0;
        const completedLabels: string[] = [];
        let cancelled = false;

        const runStep = () => {
            if (cancelled) return;
            if (stepIndex >= THINKING_STEPS.length) {
                // Prevent duplicate calls from React Strict Mode
                if (!hasCompletedRef.current) {
                    hasCompletedRef.current = true;
                    onComplete?.(completedLabels);
                }
                return;
            }

            const step = THINKING_STEPS[stepIndex];
            setCurrentStepIndex(stepIndex);
            setShowBody(false);

            // Show body text after dots animation completes
            setTimeout(() => {
                if (cancelled) return;
                setShowBody(true);
            }, 1800);

            setTimeout(() => {
                if (cancelled) return;
                completedLabels.push(`${step.title}... ${step.body}`);
                stepIndex++;
                runStep();
            }, step.duration);
        };

        runStep();

        return () => {
            cancelled = true;
        };
    }, [isActive, onComplete]);

    if (!isActive) return null;

    const currentStep = THINKING_STEPS[Math.min(currentStepIndex, THINKING_STEPS.length - 1)];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-[80%] self-start"
        >
            {/* Outer wrapper */}
            <div className="relative rounded-[17.5px]">
                {/* Rotating gradient border */}
                <RotatingBorder />

                {/* Inner white content */}
                <div
                    className="relative z-10 bg-white p-4"
                    style={{ borderRadius: '16px' }}
                >
                    {/* Current Step - Animated height */}
                    <div className="text-left relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{
                                    opacity: 0,
                                    y: -20,
                                    transition: { duration: 0.35, ease: 'easeIn' }
                                }}
                                transition={{ duration: 0.25, ease: 'easeOut' }}
                            >
                                {/* Title with animated dots */}
                                <h4
                                    className="font-medium"
                                    style={{ fontSize: '14px', color: '#232323' }}
                                >
                                    {currentStep.title}
                                    <AnimatedDots key={`dots-${currentStep.id}`} />
                                </h4>

                                {/* Body - appears after title with delay */}
                                <AnimatePresence>
                                    {showBody && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                            animate={{ opacity: 1, height: 'auto', marginTop: 4 }}
                                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                                            className="overflow-hidden"
                                        >
                                            <p
                                                className="font-sans"
                                                style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}
                                            >
                                                {currentStep.body}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
