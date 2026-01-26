import { memo } from 'react';

interface GlowEffectProps {
    intensity: number; // 0-1
    isActive: boolean;
    contained?: boolean; // If true, use relative positioning for contained previews
}

export const GlowEffect = memo(function GlowEffect({ intensity, isActive, contained = false }: GlowEffectProps) {
    // More subtle at rest (0.1), reaches full 1.0 when talking loudly
    const glowOpacity = isActive ? 0.1 + intensity * 0.9 : 0;

    if (contained) {
        // Contained mode for settings preview
        return (
            <>
                {/* Glow behind - contained within parent */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '28px',
                        background: `conic-gradient(from 0deg,
                            #F29097 5%, #E5202E 15%, #F29097 30%,
                            #C2DE90 40%, #85BC20 50%, #C2DE90 60%,
                            #80BDE1 70%, #007AC3 85%, #80BDE1 95%, #F29097 100%
                        )`,
                        filter: 'blur(8px)',
                        opacity: glowOpacity,
                        transition: 'opacity 0.2s ease-out',
                        zIndex: 0,
                    }}
                />
            </>
        );
    }

    return (
        <>
            {/* Glow pseudo-element */}
            <div
                className="absolute -inset-2 rounded-[35px] -z-10"
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
                    filter: 'blur(12px)',
                    opacity: glowOpacity,
                    transition: 'opacity 0.1s ease-out',
                }}
            />
            {/* Inner white background to mask gradient behind content */}
            <div className="absolute inset-0 bg-white rounded-[28px] z-0" />
        </>
    );
});
