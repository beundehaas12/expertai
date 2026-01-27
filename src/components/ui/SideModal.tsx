import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type VoiceVariant = 'waveform' | 'glow' | 'moving-glow' | 'intelligence';
type ButtonPosition = 'none' | 'header' | 'actionbar' | 'floating';

interface SideModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children?: React.ReactNode;
    voiceVariant?: VoiceVariant;
    onVoiceVariantChange?: (variant: VoiceVariant) => void;
    buttonPosition?: ButtonPosition;
    onButtonPositionChange?: (position: ButtonPosition) => void;
    isSplitView?: boolean;
}

const voiceVariants: { value: VoiceVariant; label: string }[] = [
    { value: 'waveform', label: 'Waveform' },
    { value: 'glow', label: 'Glow' },
    { value: 'moving-glow', label: 'Moving Glow' },
    { value: 'intelligence', label: 'Intelligence' },
];

const buttonPositions: { value: ButtonPosition; label: string }[] = [
    { value: 'none', label: 'None' },
    { value: 'header', label: 'Banner' },
    { value: 'actionbar', label: 'Vertical Action Bar' },
    { value: 'floating', label: 'Floating Button' },
];

// Animation code for developers to copy
const ANIMATION_CODE = `// ThinkingAnimation Component
// Dependencies: framer-motion
import { motion } from 'framer-motion';

export function ThinkingAnimation() {
  // Spark paths (static logo shape)
  const SPARK_GREEN = "M29.71 16.83 C23.90 27.22 12.68 34.08 0 34.08 L0 29.92 C12.47 29.92 23.06 22.44 27.64 11.64 C28.05 13.09 28.68 14.34 29.71 16.83 Z";
  const SPARK_RED = "M47.38 29.71 C36.99 23.90 29.92 12.68 29.92 0 L34.08 0 C34.08 12.47 41.56 23.06 52.36 27.64 C50.91 28.05 49.66 28.68 47.38 29.71 Z";
  const SPARK_BLUE = "M34.29 47.38 C40.10 36.99 51.32 30.13 64.00 30.13 L64.00 34.28 C51.53 34.28 40.93 41.77 36.36 52.57 C35.95 51.12 35.32 49.87 34.29 47.38 Z";
  const SPARK_BLACK = "M16.83 34.29 C27.22 40.10 34.08 51.32 34.08 64.00 L29.92 64.00 C29.92 51.53 22.44 40.93 11.64 36.36 C13.09 35.95 14.34 35.32 16.83 34.29 Z";

  // Ring paths (spinning circle with gaps)
  const RING_GREEN = "M2 28 C2 16 16 2 28 2 L28 6 C18 6 6 18 6 28 C6 28 4 28 2 28 Z";
  const RING_RED = "M36 2 C48 2 62 16 62 28 L58 28 C58 18 46 6 36 6 C36 6 36 4 36 2 Z";
  const RING_BLUE = "M62 36 C62 48 48 62 36 62 L36 58 C46 58 58 46 58 36 C58 36 60 36 62 36 Z";
  const RING_BLACK = "M28 62 C16 62 2 48 2 36 L6 36 C6 46 18 58 28 58 C28 58 28 60 28 62 Z";

  const DURATION = 2.0;
  const TIMES = [0, 0.3, 0.7, 1];

  return (
    <div className="relative w-6 h-6">
      <svg width="24" height="24" viewBox="0 0 64 64" fill="none">
        <motion.g
          animate={{ rotate: [0, 0, 360, 360] }}
          transition={{ duration: DURATION, repeat: Infinity, times: TIMES, ease: "easeInOut" }}
          style={{ originX: '32px', originY: '32px', transformBox: 'view-box' }}
        >
          <motion.path fill="#85BC20" animate={{ d: [SPARK_GREEN, RING_GREEN, RING_GREEN, SPARK_GREEN] }} transition={{ duration: DURATION, repeat: Infinity, times: TIMES, ease: "easeInOut" }} />
          <motion.path fill="#E5202E" animate={{ d: [SPARK_RED, RING_RED, RING_RED, SPARK_RED] }} transition={{ duration: DURATION, repeat: Infinity, times: TIMES, ease: "easeInOut" }} />
          <motion.path fill="#007AC3" animate={{ d: [SPARK_BLUE, RING_BLUE, RING_BLUE, SPARK_BLUE] }} transition={{ duration: DURATION, repeat: Infinity, times: TIMES, ease: "easeInOut" }} />
          <motion.path fill="#232323" animate={{ d: [SPARK_BLACK, RING_BLACK, RING_BLACK, SPARK_BLACK] }} transition={{ duration: DURATION, repeat: Infinity, times: TIMES, ease: "easeInOut" }} />
        </motion.g>
      </svg>
    </div>
  );
}`;

// Inline animation preview (no text, continuous)
function AnimationPreview() {
    const SPARK_GREEN = "M29.71 16.83 C23.90 27.22 12.68 34.08 0 34.08 L0 29.92 C12.47 29.92 23.06 22.44 27.64 11.64 C28.05 13.09 28.68 14.34 29.71 16.83 Z";
    const SPARK_RED = "M47.38 29.71 C36.99 23.90 29.92 12.68 29.92 0 L34.08 0 C34.08 12.47 41.56 23.06 52.36 27.64 C50.91 28.05 49.66 28.68 47.38 29.71 Z";
    const SPARK_BLUE = "M34.29 47.38 C40.10 36.99 51.32 30.13 64.00 30.13 L64.00 34.28 C51.53 34.28 40.93 41.77 36.36 52.57 C35.95 51.12 35.32 49.87 34.29 47.38 Z";
    const SPARK_BLACK = "M16.83 34.29 C27.22 40.10 34.08 51.32 34.08 64.00 L29.92 64.00 C29.92 51.53 22.44 40.93 11.64 36.36 C13.09 35.95 14.34 35.32 16.83 34.29 Z";

    const RING_GREEN = "M2 28 C2 16 16 2 28 2 L28 6 C18 6 6 18 6 28 C6 28 4 28 2 28 Z";
    const RING_RED = "M36 2 C48 2 62 16 62 28 L58 28 C58 18 46 6 36 6 C36 6 36 4 36 2 Z";
    const RING_BLUE = "M62 36 C62 48 48 62 36 62 L36 58 C46 58 58 46 58 36 C58 36 60 36 62 36 Z";
    const RING_BLACK = "M28 62 C16 62 2 48 2 36 L6 36 C6 46 18 58 28 58 C28 58 28 60 28 62 Z";

    const DURATION = 2.0;
    const TIMES = [0, 0.3, 0.7, 1];

    return (
        <div className="relative w-8 h-8">
            <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <motion.g
                    animate={{ rotate: [0, 0, 360, 360] }}
                    transition={{ duration: DURATION, repeat: Infinity, times: TIMES, ease: "easeInOut" }}
                    style={{ originX: '32px', originY: '32px', transformBox: 'view-box' }}
                >
                    <motion.path fill="#85BC20" animate={{ d: [SPARK_GREEN, RING_GREEN, RING_GREEN, SPARK_GREEN] }} transition={{ duration: DURATION, repeat: Infinity, times: TIMES, ease: "easeInOut" }} />
                    <motion.path fill="#E5202E" animate={{ d: [SPARK_RED, RING_RED, RING_RED, SPARK_RED] }} transition={{ duration: DURATION, repeat: Infinity, times: TIMES, ease: "easeInOut" }} />
                    <motion.path fill="#007AC3" animate={{ d: [SPARK_BLUE, RING_BLUE, RING_BLUE, SPARK_BLUE] }} transition={{ duration: DURATION, repeat: Infinity, times: TIMES, ease: "easeInOut" }} />
                    <motion.path fill="#232323" animate={{ d: [SPARK_BLACK, RING_BLACK, RING_BLACK, SPARK_BLACK] }} transition={{ duration: DURATION, repeat: Infinity, times: TIMES, ease: "easeInOut" }} />
                </motion.g>
            </svg>
        </div>
    );
}

export function SideModal({
    isOpen,
    onClose,
    title = 'Settings',
    children,
    voiceVariant = 'waveform',
    onVoiceVariantChange,
    buttonPosition = 'header',
    onButtonPositionChange,
    isSplitView = false,
}: SideModalProps) {
    const [copied, setCopied] = useState(false);

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(ANIMATION_CODE);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            zIndex: 100,
                        }}
                    />

                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'tween', duration: 0.2 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            right: 0,
                            height: '100%',
                            width: '400px',
                            maxWidth: '100%',
                            backgroundColor: '#ffffff',
                            zIndex: 101,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '1px', backgroundColor: '#DADADA' }} />

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: '60px', flexShrink: 0 }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 500, color: '#111827', margin: 0 }}>{title}</h2>
                            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <X size={20} color="#6b7280" />
                            </button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                            {children || (
                                <>
                                    <div style={{ marginBottom: '24px', opacity: isSplitView ? 1 : 0.5 }}>
                                        <h3 style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px', marginTop: 0, textAlign: 'left' }}>
                                            Expert AI Call to Action Position
                                        </h3>
                                        {!isSplitView && (
                                            <div style={{
                                                fontSize: '12px',
                                                color: '#6b7280',
                                                marginBottom: '12px',
                                                padding: '8px 12px',
                                                backgroundColor: '#f3f4f6',
                                                borderRadius: '6px',
                                                textAlign: 'left',
                                            }}>
                                                This setting only works in Split view
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {buttonPositions.map(({ value, label }) => (
                                                <button
                                                    key={value}
                                                    onClick={() => isSplitView && onButtonPositionChange?.(value)}
                                                    disabled={!isSplitView}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        padding: '12px 16px',
                                                        borderRadius: '8px',
                                                        border: buttonPosition === value ? '2px solid #111827' : '1px solid #DADADA',
                                                        backgroundColor: buttonPosition === value ? '#F9FAFB' : '#ffffff',
                                                        cursor: isSplitView ? 'pointer' : 'not-allowed',
                                                        textAlign: 'left',
                                                        transition: 'all 0.15s ease',
                                                    }}
                                                >
                                                    {/* Radio button */}
                                                    <div
                                                        style={{
                                                            width: '18px',
                                                            height: '18px',
                                                            borderRadius: '50%',
                                                            border: buttonPosition === value ? '2px solid #111827' : '2px solid #9ca3af',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        {buttonPosition === value && (
                                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#111827' }} />
                                                        )}
                                                    </div>
                                                    <span style={{ fontSize: '14px', fontWeight: buttonPosition === value ? 500 : 400, color: '#111827' }}>
                                                        {label}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '12px', marginTop: 0, textAlign: 'left' }}>
                                            Voice Input Style
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {voiceVariants.map(({ value, label }) => (
                                                <button
                                                    key={value}
                                                    onClick={() => onVoiceVariantChange?.(value)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        padding: '12px 16px',
                                                        borderRadius: '8px',
                                                        border: voiceVariant === value ? '2px solid #111827' : '1px solid #DADADA',
                                                        backgroundColor: voiceVariant === value ? '#F9FAFB' : '#ffffff',
                                                        cursor: 'pointer',
                                                        textAlign: 'left',
                                                        transition: 'all 0.15s ease',
                                                    }}
                                                >
                                                    {/* Radio button */}
                                                    <div
                                                        style={{
                                                            width: '18px',
                                                            height: '18px',
                                                            borderRadius: '50%',
                                                            border: voiceVariant === value ? '2px solid #111827' : '2px solid #9ca3af',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        {voiceVariant === value && (
                                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#111827' }} />
                                                        )}
                                                    </div>
                                                    <span style={{ fontSize: '14px', fontWeight: voiceVariant === value ? 500 : 400, color: '#111827' }}>
                                                        {label}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Thinking Animation Section */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '12px', marginTop: 0, textAlign: 'left' }}>
                                            Thinking Animation
                                        </h3>

                                        {/* Animation Preview */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '16px',
                                            backgroundColor: '#f9fafb',
                                            borderRadius: '8px',
                                            marginBottom: '12px',
                                        }}>
                                            <AnimationPreview />
                                            <span style={{ fontSize: '14px', fontWeight: 500, color: '#232323' }}>Thinking...</span>
                                        </div>

                                        {/* Copy Code Button */}
                                        <button
                                            onClick={handleCopyCode}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                width: '100%',
                                                padding: '12px 16px',
                                                borderRadius: '8px',
                                                border: '1px solid #DADADA',
                                                backgroundColor: copied ? '#f0fdf4' : '#ffffff',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s ease',
                                            }}
                                        >
                                            {copied ? (
                                                <>
                                                    <Check size={16} color="#16a34a" />
                                                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#16a34a' }}>Copied!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={16} color="#374151" />
                                                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>Copy Animation Code</span>
                                                </>
                                            )}
                                        </button>

                                        {/* Dependencies Note */}
                                        <div style={{
                                            fontSize: '12px',
                                            color: '#6b7280',
                                            marginTop: '12px',
                                            padding: '8px 12px',
                                            backgroundColor: '#f3f4f6',
                                            borderRadius: '6px',
                                            textAlign: 'left',
                                        }}>
                                            <strong>Required:</strong> framer-motion (npm install framer-motion)
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
