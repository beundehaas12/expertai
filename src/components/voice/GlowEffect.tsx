import { memo } from 'react';

interface GlowEffectProps {
    intensity: number; // 0-1
    isActive: boolean;
}

export const GlowEffect = memo(function GlowEffect({ intensity, isActive }: GlowEffectProps) {
    // Opacity ranges from 0.3 (silent) to 1.0 (loud) for better visibility
    const glowOpacity = isActive ? 0.3 + intensity * 0.7 : 0;

    return (
        <>
            {/* Glow pseudo-element */}
            <div
                className="absolute -inset-3 rounded-[35px] -z-10 transition-opacity duration-75"
                style={{
                    background: `conic-gradient(from 0deg,
            #F29097 5%,
            #E5202E 15%,
            #F29097 30%,
            #C2DE90 40%,
            #85BC20 50%,
            #C2DE90 60%,
            #80BDE1 70%,
            #007AC3 85%,
            #80BDE1 95%,
            #F29097 100%
          )`,
                    filter: 'blur(16px)',
                    opacity: glowOpacity,
                }}
            />
            {/* Inner white background to mask gradient behind content */}
            <div className="absolute inset-0 bg-white rounded-[28px] z-0" />
        </>
    );
});
