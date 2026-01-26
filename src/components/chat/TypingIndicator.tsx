import { motion } from 'framer-motion';

export function TypingIndicator() {
    const dotVariants = {
        initial: { y: 0 },
        animate: { y: -4 },
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="self-start flex items-center gap-3 py-3"
        >
            {/* Dots animation */}
            <div className="flex items-center gap-1">
                {[0, 1, 2].map((index) => (
                    <motion.div
                        key={index}
                        variants={dotVariants}
                        initial="initial"
                        animate="animate"
                        transition={{
                            duration: 0.4,
                            repeat: Infinity,
                            repeatType: 'reverse',
                            delay: index * 0.15,
                        }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                ))}
            </div>
            {/* Thinking text */}
            <span className="text-gray-500 text-sm font-medium">Thinking...</span>
        </motion.div>
    );
}
