import { motion } from 'framer-motion';

export function TypingIndicator() {
    // "Perfect Morph" Loading Animation
    // Morphs between the "Spark" logo and a spinning "Broken Ring".
    // - Spark: Static start shape (0deg).
    // - Ring: Spinning circle (360deg) with gaps.
    // - Morph: Smooth path interpolation using easeInOut.

    const SPARK_GREEN = "M29.71 16.83 C23.90 27.22 12.68 34.08 0 34.08 L0 29.92 C12.47 29.92 23.06 22.44 27.64 11.64 C28.05 13.09 28.68 14.34 29.71 16.83 Z";
    const SPARK_RED = "M47.38 29.71 C36.99 23.90 29.92 12.68 29.92 0 L34.08 0 C34.08 12.47 41.56 23.06 52.36 27.64 C50.91 28.05 49.66 28.68 47.38 29.71 Z";
    const SPARK_BLUE = "M34.29 47.38 C40.10 36.99 51.32 30.13 64.00 30.13 L64.00 34.28 C51.53 34.28 40.93 41.77 36.36 52.57 C35.95 51.12 35.32 49.87 34.29 47.38 Z";
    const SPARK_BLACK = "M16.83 34.29 C27.22 40.10 34.08 51.32 34.08 64.00 L29.92 64.00 C29.92 51.53 22.44 40.93 11.64 36.36 C13.09 35.95 14.34 35.32 16.83 34.29 Z";

    // Ring Sectors with GAPS
    const RING_GREEN = "M2 28 C2 16 16 2 28 2 L28 6 C18 6 6 18 6 28 C6 28 4 28 2 28 Z";
    const RING_RED = "M36 2 C48 2 62 16 62 28 L58 28 C58 18 46 6 36 6 C36 6 36 4 36 2 Z";
    const RING_BLUE = "M62 36 C62 48 48 62 36 62 L36 58 C46 58 58 46 58 36 C58 36 60 36 62 36 Z";
    const RING_BLACK = "M28 62 C16 62 2 48 2 36 L6 36 C6 46 18 58 28 58 C28 58 28 60 28 62 Z";

    // Easing: Smooth start/stop.
    const SMOOTH_EASE = "easeInOut";
    const DURATION = 2.0;

    // Timeline: 
    // 0.0: Spark (Static)
    // 0.3: Ring Formed
    // 0.3-0.7: Ring SPINS
    // 0.7: Ring Stops
    // 1.0: Morph back
    const TIMES = [0, 0.3, 0.7, 1];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="self-start flex items-center gap-3 py-3"
        >
            <div className="relative w-6 h-6">
                <svg width="24" height="24" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
                    <motion.g
                        clipPath="url(#clip0_typing)"
                        animate={{
                            rotate: [0, 0, 360, 360]
                        }}
                        transition={{
                            duration: DURATION,
                            repeat: Infinity,
                            times: TIMES,
                            ease: "easeInOut"
                        }}
                        style={{ originX: '32px', originY: '32px', transformBox: 'view-box' }}
                    >
                        {/* Green */}
                        <motion.path
                            fill="#85BC20"
                            animate={{ d: [SPARK_GREEN, RING_GREEN, RING_GREEN, SPARK_GREEN] }}
                            transition={{ duration: DURATION, repeat: Infinity, times: TIMES, ease: SMOOTH_EASE }}
                        />
                        {/* Red */}
                        <motion.path
                            fill="#E5202E"
                            animate={{ d: [SPARK_RED, RING_RED, RING_RED, SPARK_RED] }}
                            transition={{ duration: DURATION, repeat: Infinity, times: TIMES, ease: SMOOTH_EASE }}
                        />
                        {/* Blue */}
                        <motion.path
                            fill="#007AC3"
                            animate={{ d: [SPARK_BLUE, RING_BLUE, RING_BLUE, SPARK_BLUE] }}
                            transition={{ duration: DURATION, repeat: Infinity, times: TIMES, ease: SMOOTH_EASE }}
                        />
                        {/* Black */}
                        <motion.path
                            fill="#232323"
                            animate={{ d: [SPARK_BLACK, RING_BLACK, RING_BLACK, SPARK_BLACK] }}
                            transition={{ duration: DURATION, repeat: Infinity, times: TIMES, ease: SMOOTH_EASE }}
                        />
                    </motion.g>
                    <defs>
                        <clipPath id="clip0_typing">
                            <rect width="64" height="64" fill="white" />
                        </clipPath>
                    </defs>
                </svg>
            </div>

            {/* Thinking text */}
            <span className="text-sm font-medium" style={{ color: '#232323' }}>Thinking...</span>
        </motion.div>
    );
}
