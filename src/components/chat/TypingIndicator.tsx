import { motion } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export function TypingIndicator() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="self-start flex items-center gap-3 py-3"
        >
            {/* Lottie Orbs Animation */}
            <div className="relative w-6 h-6">
                <DotLottieReact
                    src="https://lottie.host/8d36566e-b09d-4b9d-9428-65dbc07b3a57/t0GL6PpqqT.lottie"
                    loop
                    autoplay
                    style={{ width: 24, height: 24 }}
                />
            </div>

            {/* Thinking text with animated dots */}
            <span className="text-sm font-medium" style={{ color: '#232323' }}>
                Thinking
                <motion.span
                    animate={{ opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 1.5, times: [0, 0.2, 0.8, 1], repeat: Infinity }}
                >.</motion.span>
                <motion.span
                    animate={{ opacity: [0, 0, 1, 1, 0] }}
                    transition={{ duration: 1.5, times: [0, 0.2, 0.4, 0.8, 1], repeat: Infinity }}
                >.</motion.span>
                <motion.span
                    animate={{ opacity: [0, 0, 0, 1, 0] }}
                    transition={{ duration: 1.5, times: [0, 0.2, 0.4, 0.8, 1], repeat: Infinity }}
                >.</motion.span>
            </span>
        </motion.div>
    );
}

