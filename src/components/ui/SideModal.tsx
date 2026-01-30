import { useState } from 'react';
import { X, ArrowLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

type VoiceVariant = 'waveform' | 'glow' | 'moving-glow' | 'intelligence';
type ButtonPosition = 'none' | 'header' | 'actionbar' | 'floating';

export type BackgroundImage =
    | 'background.jpg'
    | 'Expert AI - white -  background images 01.jpg'
    | 'Expert AI - white -  background images 02.jpg'
    | 'Expert AI - white -  background images 03.jpg'
    | 'Expert AI - white -  background images 04.jpg'
    | 'Expert AI - white -  background images 05.jpg'
    | 'Expert AI - white -  background images 07.jpg'
    | 'Expert AI - white -  background images 08.jpg'
    | 'Expert AI - white -  background images 09.jpg'
    | 'Expert AI - white -  background images 10.jpg'
    | 'Expert AI - white -  background images 11.jpg'
    | 'Expert AI - white -  background images 12.jpg'
    | 'Expert AI - white -  background images 13.jpg'
    | 'Expert AI - white -  background images 14.jpg'
    | 'Expert AI - white -  background images 17.jpg'
    | 'Expert AI - white -  background images 18.jpg';

const BACKGROUND_OPTIONS: { value: BackgroundImage; label: string }[] = [
    { value: 'background.jpg', label: 'Default' },
    { value: 'Expert AI - white -  background images 01.jpg', label: 'Style 1' },
    { value: 'Expert AI - white -  background images 02.jpg', label: 'Style 2' },
    { value: 'Expert AI - white -  background images 03.jpg', label: 'Style 3' },
    { value: 'Expert AI - white -  background images 04.jpg', label: 'Style 4' },
    { value: 'Expert AI - white -  background images 05.jpg', label: 'Style 5' },
    { value: 'Expert AI - white -  background images 07.jpg', label: 'Style 6' },
    { value: 'Expert AI - white -  background images 08.jpg', label: 'Style 7' },
    { value: 'Expert AI - white -  background images 09.jpg', label: 'Style 8' },
    { value: 'Expert AI - white -  background images 10.jpg', label: 'Style 9' },
    { value: 'Expert AI - white -  background images 11.jpg', label: 'Style 10' },
    { value: 'Expert AI - white -  background images 12.jpg', label: 'Style 11' },
    { value: 'Expert AI - white -  background images 13.jpg', label: 'Style 12' },
    { value: 'Expert AI - white -  background images 14.jpg', label: 'Style 13' },
    { value: 'Expert AI - white -  background images 17.jpg', label: 'Style 14' },
    { value: 'Expert AI - white -  background images 18.jpg', label: 'Style 15' },
];

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
    deepThinking?: boolean;
    onDeepThinkingChange?: (enabled: boolean) => void;
    backgroundImage?: BackgroundImage;
    onBackgroundImageChange?: (image: BackgroundImage) => void;
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
    deepThinking = false,
    onDeepThinkingChange,
    backgroundImage = 'background.jpg',
    onBackgroundImageChange,
}: SideModalProps) {
    const [settingsView, setSettingsView] = useState<'main' | 'background'>('main');

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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {settingsView !== 'main' && (
                                    <button onClick={() => setSettingsView('main')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                                        <ArrowLeft size={20} color="#6b7280" />
                                    </button>
                                )}
                                <h2 style={{ fontSize: '18px', fontWeight: 500, color: '#111827', margin: 0 }}>
                                    {settingsView === 'background' ? 'Background Image' : title}
                                </h2>
                            </div>
                            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <X size={20} color="#6b7280" />
                            </button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                            {settingsView === 'background' ? (
                                <div>
                                    <p style={{ fontSize: '14px', color: '#6b7280', marginTop: 0, marginBottom: '16px', textAlign: 'left' }}>
                                        Select a background image for the chat start screen
                                    </p>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                        {BACKGROUND_OPTIONS.map(({ value, label }) => (
                                            <button
                                                key={value}
                                                onClick={() => onBackgroundImageChange?.(value)}
                                                style={{
                                                    position: 'relative',
                                                    aspectRatio: '16/10',
                                                    borderRadius: '8px',
                                                    overflow: 'hidden',
                                                    border: backgroundImage === value ? '3px solid #111827' : '2px solid #DADADA',
                                                    padding: 0,
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                <img src={`./img/backgrounds/${value}`} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                {backgroundImage === value && (
                                                    <div style={{ position: 'absolute', bottom: '8px', left: '8px', backgroundColor: '#111827', color: '#fff', fontSize: '11px', fontWeight: 500, padding: '4px 8px', borderRadius: '4px' }}>Selected</div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : children || (
                                <>
                                    <div style={{ marginBottom: '24px' }}>
                                        <button
                                            onClick={() => setSettingsView('background')}
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #DADADA', backgroundColor: '#ffffff', cursor: 'pointer' }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                {/* Thumbnail preview */}
                                                <div style={{
                                                    width: '48px',
                                                    height: '32px',
                                                    borderRadius: '4px',
                                                    overflow: 'hidden',
                                                    border: '1px solid #DADADA',
                                                    flexShrink: 0,
                                                }}>
                                                    <img
                                                        src={`./img/backgrounds/${backgroundImage}`}
                                                        alt="Current background"
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                </div>
                                                <div style={{ textAlign: 'left' }}>
                                                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>Change Background Image</div>
                                                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>Customize the chat start screen</div>
                                                </div>
                                            </div>
                                            <ChevronRight size={20} color="#6b7280" />
                                        </button>
                                    </div>
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
                                            Quick Thinking Animation
                                        </h3>

                                        {/* Animation Display (non-selectable) */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                padding: '12px 16px',
                                                borderRadius: '8px',
                                                border: '1px solid #DADADA',
                                                backgroundColor: '#ffffff',
                                            }}
                                        >
                                            {/* Lottie Preview */}
                                            <div style={{ width: 32, height: 32, flexShrink: 0 }}>
                                                <DotLottieReact
                                                    src="https://lottie.host/8d36566e-b09d-4b9d-9428-65dbc07b3a57/t0GL6PpqqT.lottie"
                                                    loop
                                                    autoplay
                                                    style={{ width: 32, height: 32 }}
                                                />
                                            </div>
                                            <span style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>
                                                Thinking...
                                            </span>
                                        </div>
                                    </div>

                                    {/* Deep Thinking Toggle */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '12px', marginTop: 0, textAlign: 'left' }}>
                                            Deep Thinking Mode
                                        </h3>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '12px 16px',
                                                borderRadius: '8px',
                                                border: '1px solid #DADADA',
                                                backgroundColor: '#ffffff',
                                            }}
                                        >
                                            <div style={{ textAlign: 'left' }}>
                                                <span style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>
                                                    Enable Deep Thinking
                                                </span>
                                                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', marginBottom: 0, textAlign: 'left' }}>
                                                    Extended reasoning with visible chain-of-thought
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => onDeepThinkingChange?.(!deepThinking)}
                                                style={{
                                                    position: 'relative',
                                                    width: '44px',
                                                    height: '24px',
                                                    borderRadius: '12px',
                                                    backgroundColor: deepThinking ? '#111827' : '#d1d5db',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    transition: 'background-color 0.2s',
                                                    flexShrink: 0,
                                                }}
                                                role="switch"
                                                aria-checked={deepThinking}
                                            >
                                                <span
                                                    style={{
                                                        position: 'absolute',
                                                        top: '4px',
                                                        left: deepThinking ? '24px' : '4px',
                                                        width: '16px',
                                                        height: '16px',
                                                        borderRadius: '50%',
                                                        backgroundColor: 'white',
                                                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                                        transition: 'left 0.2s',
                                                    }}
                                                />
                                            </button>
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
