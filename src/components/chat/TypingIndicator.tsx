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
            className="self-start flex items-center gap-1 px-5 py-4 bg-white border border-gray-200 rounded-3xl rounded-bl-sm shadow-sm"
        >
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
        </motion.div>
    );
}
