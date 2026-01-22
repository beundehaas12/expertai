import { memo } from 'react';
import { motion } from 'framer-motion';

interface WaveformProps {
    data: Uint8Array;
}

export const Waveform = memo(function Waveform({ data }: WaveformProps) {
    return (
        <div
            className="flex-1 flex items-center justify-between gap-0.5 h-full w-full px-4 overflow-hidden"
            style={{
                maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
            }}
        >
            {Array.from(data).map((value, i) => {
                const heightPercent = 10 + (value / 255) * 90;
                const isSilent = value <= 10;

                return (
                    <motion.div
                        key={i}
                        className="rounded-full flex-shrink-0"
                        style={{
                            width: '1.5px',
                            minHeight: '10%',
                        }}
                        animate={{
                            height: `${heightPercent}%`,
                            backgroundColor: isSilent ? '#d1d5db' : '#000000',
                        }}
                        transition={{
                            height: { duration: 0.05, ease: 'linear' },
                            backgroundColor: { duration: 0.1 },
                        }}
                    />
                );
            })}
        </div>
    );
});
