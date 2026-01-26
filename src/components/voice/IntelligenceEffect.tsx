import { memo } from 'react';

interface IntelligenceEffectProps {
  isActive: boolean;
  intensity?: number; // 0-1 based on voice volume
  contained?: boolean; // If true, use contained styling for previews
}

export const IntelligenceEffect = memo(function IntelligenceEffect({
  isActive,
  intensity = 0.5,
  contained = false
}: IntelligenceEffectProps) {
  if (!isActive) return null;

  // Scale opacity and blur based on voice intensity
  const baseOpacity = 0.4 + intensity * 0.6; // 0.4 to 1.0

  // Contained mode - simpler gradient border for previews
  if (contained) {
    return (
      <>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '28px',
            background: `conic-gradient(
              from var(--angle, 0deg),
              #F29097, #E5202E, #F29097,
              #C2DE90, #85BC20, #C2DE90,
              #80BDE1, #007AC3, #80BDE1, #F29097
            )`,
            filter: 'blur(8px)',
            opacity: baseOpacity,
            animation: 'intelligence-spin 5000ms infinite linear',
            zIndex: 0,
          }}
        />
        <style>{`
          @property --angle {
            inherits: false;
            initial-value: 0deg;
            syntax: "<angle>";
          }
          @keyframes intelligence-spin {
            to { --angle: 360deg; }
          }
        `}</style>
      </>
    );
  }

  // Full-screen mode (original behavior)
  return (
    <>
      {/* Small glow layer */}
      <div
        className="fixed inset-0 pointer-events-none z-[9999]"
        style={{
          borderStyle: 'solid',
          borderWidth: `${9 + intensity * 5}px`,
          borderImage: `conic-gradient(
            from var(--angle, 0deg),
            #F29097,
            #E5202E,
            #F29097,
            #C2DE90,
            #85BC20,
            #C2DE90,
            #80BDE1,
            #007AC3,
            #80BDE1,
            #F29097
          ) 1`,
          filter: `blur(${2 + intensity * 2}px)`,
          margin: '-4px',
          opacity: baseOpacity,
          animation: 'intelligence-spin 5000ms infinite linear',
          transition: 'border-width 0.1s ease-out, filter 0.1s ease-out, opacity 0.1s ease-out',
        }}
      />
      {/* Medium glow layer */}
      <div
        className="fixed inset-0 pointer-events-none z-[9998]"
        style={{
          borderStyle: 'solid',
          borderWidth: `${17 + intensity * 8}px`,
          borderImage: `conic-gradient(
            from var(--angle, 0deg),
            #F29097,
            #E5202E,
            #F29097,
            #C2DE90,
            #85BC20,
            #C2DE90,
            #80BDE1,
            #007AC3,
            #80BDE1,
            #F29097
          ) 1`,
          filter: `blur(${5 + intensity * 4}px)`,
          margin: '-10px',
          opacity: baseOpacity * 0.9,
          animation: 'intelligence-spin 5000ms infinite linear',
          transition: 'border-width 0.1s ease-out, filter 0.1s ease-out, opacity 0.1s ease-out',
        }}
      />
      {/* Large glow layer */}
      <div
        className="fixed inset-0 pointer-events-none z-[9997]"
        style={{
          borderStyle: 'solid',
          borderWidth: `${30 + intensity * 15}px`,
          borderImage: `conic-gradient(
            from var(--angle, 0deg),
            #F29097,
            #E5202E,
            #F29097,
            #C2DE90,
            #85BC20,
            #C2DE90,
            #80BDE1,
            #007AC3,
            #80BDE1,
            #F29097
          ) 1`,
          filter: `blur(${10 + intensity * 6}px)`,
          margin: '-20px',
          mixBlendMode: 'hard-light',
          opacity: baseOpacity * 0.8,
          animation: 'intelligence-spin 5000ms infinite linear',
          transition: 'border-width 0.1s ease-out, filter 0.1s ease-out, opacity 0.1s ease-out',
        }}
      />
      <style>{`
        @property --angle {
          inherits: false;
          initial-value: 0deg;
          syntax: "<angle>";
        }
        
        @keyframes intelligence-spin {
          to {
            --angle: 360deg;
          }
        }
      `}</style>
    </>
  );
});
