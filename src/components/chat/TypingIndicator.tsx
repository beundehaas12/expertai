import { motion } from 'framer-motion';

export function TypingIndicator() {
    // Each petal animates with a staggered delay for a "breathing" effect
    const petalVariants = {
        initial: { scale: 0.8, opacity: 0.6 },
        animate: { scale: 1, opacity: 1 },
    };

    const petalTransition = (delay: number) => ({
        duration: 0.6,
        repeat: Infinity,
        repeatType: 'reverse' as const,
        ease: 'easeInOut',
        delay,
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="self-start flex items-center gap-3 py-3"
        >
            {/* Animated Spark with individual petal animations */}
            <svg width="24" height="24" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_typing)">
                    {/* Green petal - top left */}
                    <motion.path
                        d="M29.7143 16.8315C23.8961 27.2211 12.6753 34.0783 0 34.0783V29.9224C12.4675 29.9224 23.0649 22.4419 27.6364 11.6367C27.6364 11.6367 28.0519 13.0913 28.6753 14.338C29.2987 15.5848 29.7143 16.8315 29.7143 16.8315Z"
                        fill="#85BC20"
                        variants={petalVariants}
                        initial="initial"
                        animate="animate"
                        transition={petalTransition(0)}
                        style={{ transformOrigin: '32px 32px' }}
                    />
                    {/* Red petal - top right */}
                    <motion.path
                        d="M47.3764 29.7143C36.9868 23.8961 29.9219 12.6753 29.9219 0H34.0777C34.0777 12.4675 41.5582 23.0649 52.3634 27.6364C52.3634 27.6364 50.9089 28.0519 49.6621 28.6753C48.4154 29.2987 47.3764 29.7143 47.3764 29.7143Z"
                        fill="#E5202E"
                        variants={petalVariants}
                        initial="initial"
                        animate="animate"
                        transition={petalTransition(0.15)}
                        style={{ transformOrigin: '32px 32px' }}
                    />
                    {/* Blue petal - bottom right */}
                    <motion.path
                        d="M34.2852 47.3757C40.1033 36.986 51.3241 30.1289 63.9994 30.1289V34.2848C51.5319 34.2848 40.9345 41.7653 36.3631 52.5705C36.3631 52.5705 35.9475 51.1159 35.3241 49.8692C34.7007 48.6224 34.2852 47.5835 34.2852 47.5835V47.3757Z"
                        fill="#007AC3"
                        variants={petalVariants}
                        initial="initial"
                        animate="animate"
                        transition={petalTransition(0.3)}
                        style={{ transformOrigin: '32px 32px' }}
                    />
                    {/* Black petal - bottom left */}
                    <motion.path
                        d="M16.8315 34.2852C27.2211 40.1033 34.0783 51.3241 34.0783 63.9994H29.9224C29.9224 51.5319 22.4419 40.9345 11.6367 36.3631C11.6367 36.3631 13.0913 35.9475 14.338 35.3241C15.5848 34.7007 16.8315 34.2852 16.8315 34.2852Z"
                        fill="#232323"
                        variants={petalVariants}
                        initial="initial"
                        animate="animate"
                        transition={petalTransition(0.45)}
                        style={{ transformOrigin: '32px 32px' }}
                    />
                </g>
                <defs>
                    <clipPath id="clip0_typing">
                        <rect width="64" height="64" fill="white" />
                    </clipPath>
                </defs>
            </svg>
            {/* Thinking text */}
            <span className="text-gray-500 text-sm font-medium">Thinking...</span>
        </motion.div>
    );
}
