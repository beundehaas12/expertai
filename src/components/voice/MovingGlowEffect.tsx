import { memo, useState, useEffect } from 'react';

interface MovingGlowEffectProps {
    isActive: boolean;
}

export const MovingGlowEffect = memo(function MovingGlowEffect({ isActive }: MovingGlowEffectProps) {
    const [arcScale, setArcScale] = useState(1);

    // Animate the gradient arc scale
    useEffect(() => {
        if (!isActive) return;

        let start: number | null = null;
        let animationId: number;

        const animate = (timestamp: number) => {
            if (!start) start = timestamp;
            const elapsed = timestamp - start;
            // Subtle oscillation between 0.8 and 1.2 over 2 seconds
            const progress = (elapsed % 2000) / 2000;
            const scale = 1 + Math.sin(progress * Math.PI * 2) * 0.2;
            setArcScale(scale);
            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationId);
    }, [isActive]);

    return (
        <>
            {/* Rotating gradient element */}
            {isActive && (
                <div
                    className="absolute z-[1] top-1/2 left-1/2 w-[200%] h-[2000%]"
                    style={{
                        transform: 'translate(-50%, -50%)',
                        backgroundImage: `conic-gradient(
              rgba(0, 0, 0, 0) 0%,
              #E5202E ${6 * arcScale}%,
              #F29097 ${12 * arcScale}%,
              #85BC20 ${18 * arcScale}%,
              #85BC20 ${28 * arcScale}%,
              #C2DE90 ${34 * arcScale}%,
              #007AC3 ${40 * arcScale}%,
              #80BDE1 ${46 * arcScale}%,
              rgba(0, 0, 0, 0) ${52 * arcScale}%
            )`,
                        animation: 'rotate-only 4s linear infinite',
                    }}
                />
            )}
            {/* Inner white background */}
            <div
                className="absolute z-[2] bg-white rounded-[25px] border border-gray-200"
                style={{ inset: '2px' }}
            />
            <style>{`
        @keyframes rotate-only {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(1turn); }
        }
      `}</style>
        </>
    );
});
