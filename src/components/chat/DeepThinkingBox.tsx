import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Search, Scale, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';

interface ThinkingStep {
    id: string;
    label: string;
    icon: React.ReactNode;
    duration: number; // ms to complete
}

const THINKING_STEPS: ThinkingStep[] = [
    { id: 'analyze', label: 'Analyzing your query and identifying key requirements...', icon: <Brain size={16} />, duration: 800 },
    { id: 'research', label: 'Researching relevant context and background information...', icon: <Search size={16} />, duration: 1200 },
    { id: 'evaluate', label: 'Evaluating multiple approaches and their trade-offs...', icon: <Scale size={16} />, duration: 1000 },
    { id: 'reference', label: 'Cross-referencing with best practices and guidelines...', icon: <BookOpen size={16} />, duration: 900 },
    { id: 'synthesize', label: 'Synthesizing findings into a comprehensive response...', icon: <Sparkles size={16} />, duration: 1100 },
];

interface DeepThinkingBoxProps {
    onComplete?: (steps: string[]) => void;
    isActive: boolean;
}

export function DeepThinkingBox({ onComplete, isActive }: DeepThinkingBoxProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<string[]>([]);
    const [isComplete, setIsComplete] = useState(false);
    const hasCompletedRef = useRef(false);

    useEffect(() => {
        if (!isActive) {
            hasCompletedRef.current = false;
            return;
        }

        // Reset state when becoming active
        setCurrentStepIndex(0);
        setCompletedSteps([]);
        setIsComplete(false);

        let stepIndex = 0;
        const completedLabels: string[] = [];
        let cancelled = false;

        const runStep = () => {
            if (cancelled) return;
            if (stepIndex >= THINKING_STEPS.length) {
                setIsComplete(true);
                // Prevent duplicate calls from React Strict Mode
                if (!hasCompletedRef.current) {
                    hasCompletedRef.current = true;
                    onComplete?.(completedLabels);
                }
                return;
            }

            const step = THINKING_STEPS[stepIndex];
            setCurrentStepIndex(stepIndex);

            setTimeout(() => {
                if (cancelled) return;
                completedLabels.push(step.label);
                setCompletedSteps([...completedLabels]);
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

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full max-w-[80%] self-start"
        >
            {/* Container with gradient border */}
            <div className="relative">
                {/* Gradient border (1.5px outside) */}
                <div
                    className="absolute"
                    style={{
                        top: '-1.5px',
                        left: '-1.5px',
                        right: '-1.5px',
                        bottom: '-1.5px',
                        borderRadius: '17.5px',
                        background: `conic-gradient(
                            from 0deg,
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
                        zIndex: 0,
                    }}
                />
                <div className="relative z-10 bg-white p-4" style={{ borderRadius: '16px' }}>
                    {/* Header with button */}
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
                        <div className="h-7 px-2.5 rounded-full bg-black flex items-center gap-1.5">
                            <img src="./img/expert-ai-spark.svg" alt="" className="w-4 h-4" />
                            <span className="text-xs font-medium text-white">Deep Thinking</span>
                        </div>
                        {!isComplete && (
                            <div className="ml-auto flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                <span className="text-xs" style={{ color: '#232323' }}>Processing...</span>
                            </div>
                        )}
                        {isComplete && (
                            <div className="ml-auto flex items-center gap-1.5">
                                <CheckCircle2 size={14} className="text-emerald-500" />
                                <span className="text-xs font-medium" style={{ color: '#232323' }}>Complete</span>
                            </div>
                        )}
                    </div>

                    {/* Steps - no icons, simple text list */}
                    <div className="space-y-2">
                        <AnimatePresence mode="popLayout">
                            {THINKING_STEPS.slice(0, currentStepIndex + 1).map((step, index) => {
                                const isCurrent = index === currentStepIndex && !isComplete;

                                return (
                                    <motion.div
                                        key={step.id}
                                        initial={{ opacity: 0, x: -10, height: 0 }}
                                        animate={{ opacity: 1, x: 0, height: 'auto' }}
                                        transition={{ duration: 0.3, ease: 'easeOut' }}
                                        className={`p-2 rounded-lg transition-colors ${isCurrent ? 'bg-slate-50 border border-slate-100' : ''
                                            }`}
                                    >
                                        <p
                                            className="font-sans leading-relaxed"
                                            style={{ fontSize: '14px', color: '#232323' }}
                                        >
                                            {step.label}
                                        </p>

                                        {/* Progress bar for current step */}
                                        {isCurrent && (
                                            <motion.div
                                                className="mt-1.5 h-1 bg-slate-100 rounded-full overflow-hidden"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                            >
                                                <motion.div
                                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                                                    initial={{ width: '0%' }}
                                                    animate={{ width: '100%' }}
                                                    transition={{ duration: step.duration / 1000, ease: 'linear' }}
                                                />
                                            </motion.div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
