import { useState, useEffect, useCallback } from 'react';
import { MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SelectionTooltipProps {
    onChatAboutSelection: (selectedText: string) => void;
    containerRef: React.RefObject<HTMLElement | null>;
}

interface TooltipPosition {
    x: number;
    y: number;
    isAbove: boolean; // true = above selection, false = below selection
}

export function SelectionTooltip({ onChatAboutSelection, containerRef }: SelectionTooltipProps) {
    const [position, setPosition] = useState<TooltipPosition | null>(null);
    const [selectedText, setSelectedText] = useState('');

    const handleMouseUp = useCallback((e: MouseEvent) => {
        // Small delay to ensure selection is complete
        setTimeout(() => {
            const selection = window.getSelection();
            const text = selection?.toString().trim() || '';

            if (text && containerRef.current) {
                // Check if selection is within our container
                const anchorNode = selection?.anchorNode;
                if (anchorNode && containerRef.current.contains(anchorNode)) {
                    const containerRect = containerRef.current.getBoundingClientRect();
                    const scrollTop = containerRef.current.scrollTop;

                    // Use mouse position for tooltip placement (more intuitive - appears where user released)
                    const mouseX = e.clientX - containerRect.left;
                    const mouseY = e.clientY - containerRect.top + scrollTop;

                    // Check if there's enough space below for the tooltip (approx 50px needed)
                    const spaceBelow = containerRect.bottom - e.clientY;
                    const isAbove = spaceBelow < 60; // Show above if not enough space below

                    // Position tooltip at mouse position
                    setPosition({
                        x: mouseX,
                        y: isAbove
                            ? mouseY - 12 // Above: a bit above mouse
                            : mouseY + 12, // Below: a bit below mouse
                        isAbove,
                    });
                    setSelectedText(text);
                }
            }
        }, 10);
    }, [containerRef]);

    const handleMouseDown = useCallback(() => {
        // Hide tooltip when starting a new selection
        setPosition(null);
        setSelectedText('');
    }, []);

    const handleClick = useCallback(() => {
        if (selectedText) {
            onChatAboutSelection(selectedText);
            setPosition(null);
            setSelectedText('');
            // Clear the selection
            window.getSelection()?.removeAllRanges();
        }
    }, [selectedText, onChatAboutSelection]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener('mouseup', handleMouseUp);
        container.addEventListener('mousedown', handleMouseDown);

        return () => {
            container.removeEventListener('mouseup', handleMouseUp);
            container.removeEventListener('mousedown', handleMouseDown);
        };
    }, [containerRef, handleMouseUp, handleMouseDown]);

    // Hide tooltip when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (position && !(e.target as HTMLElement).closest('.selection-tooltip')) {
                setPosition(null);
                setSelectedText('');
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [position]);

    return (
        <AnimatePresence>
            {position && selectedText && (
                <motion.div
                    initial={{ opacity: 0, y: position.isAbove ? 5 : -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: position.isAbove ? 5 : -5 }}
                    transition={{ duration: 0.15 }}
                    className="selection-tooltip absolute z-50"
                    style={{
                        left: position.x,
                        top: position.y,
                        transform: position.isAbove
                            ? 'translate(-50%, -100%)' // Above: pull up by full height
                            : 'translate(-50%, 0)', // Below: keep at position
                    }}
                >
                    <button
                        onClick={handleClick}
                        className="flex items-center gap-1 px-2 text-white font-normal shadow-lg hover:opacity-90 transition-opacity whitespace-nowrap"
                        style={{ backgroundColor: '#232323', fontSize: '12px', height: '24px', borderRadius: 0 }}
                    >
                        <MessageCircle size={12} />
                        Chat about this
                    </button>
                    {/* Arrow - points down when above, points up when below */}
                    <div
                        className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 ${position.isAbove ? 'top-full' : 'bottom-full'
                            }`}
                        style={position.isAbove ? {
                            borderLeft: '4px solid transparent',
                            borderRight: '4px solid transparent',
                            borderTop: '4px solid #232323',
                        } : {
                            borderLeft: '4px solid transparent',
                            borderRight: '4px solid transparent',
                            borderBottom: '4px solid #232323',
                        }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
