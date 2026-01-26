import { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type VoiceVariant = 'waveform' | 'glow' | 'moving-glow' | 'intelligence';

interface SideModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children?: React.ReactNode;
    voiceVariant?: VoiceVariant;
    onVoiceVariantChange?: (variant: VoiceVariant) => void;
}

const voiceVariants: { value: VoiceVariant; label: string }[] = [
    { value: 'waveform', label: 'Waveform' },
    { value: 'glow', label: 'Glow' },
    { value: 'moving-glow', label: 'Moving Glow' },
    { value: 'intelligence', label: 'Intelligence' },
];

export function SideModal({
    isOpen,
    onClose,
    title = 'Settings',
    children,
    voiceVariant = 'waveform',
    onVoiceVariantChange,
}: SideModalProps) {
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
                                <div style={{ marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '12px', marginTop: 0 }}>
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
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
