import { useState, useRef, useEffect } from 'react';
import { Plus, FileText, Bookmark, Share2, Settings, MessageCircle, FileSearch } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExpertButton } from './ExpertButton';

interface ActionBarProps {
    onNewChat?: () => void;
    onStartChat?: () => void;
    showExpertButton?: boolean;
}

const actionButtons = [
    { icon: Plus, label: 'New Chat', action: 'new' },
    { icon: FileText, label: 'Documents', action: 'documents' },
    { icon: Bookmark, label: 'Saved Items', action: 'saved' },
    { icon: Share2, label: 'Share', action: 'share' },
    { icon: Settings, label: 'Settings', action: 'settings' },
] as const;

// Tooltip component for action bar buttons (positioned to the left with arrow pointing right)
function ActionBarTooltip({ label, show }: { label: string; show: boolean }) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, x: 5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-full top-1/2 -translate-y-1/2 mr-2 z-[100]"
                >
                    <div
                        className="text-white font-normal shadow-lg whitespace-nowrap px-2 flex items-center"
                        style={{ backgroundColor: '#232323', fontSize: '12px', height: '24px', borderRadius: 0 }}
                    >
                        {label}
                    </div>
                    {/* Arrow pointing right */}
                    <div
                        className="absolute top-1/2 -translate-y-1/2 left-full w-0 h-0"
                        style={{
                            borderTop: '4px solid transparent',
                            borderBottom: '4px solid transparent',
                            borderLeft: '4px solid #232323',
                        }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export function ActionBar({ onNewChat, onStartChat, showExpertButton = true }: ActionBarProps) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [hoveredButton, setHoveredButton] = useState<string | null>(null);
    const [showExpertTooltip, setShowExpertTooltip] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    const handleClick = (action: string) => {
        if (action === 'new' && onNewChat) {
            onNewChat();
        }
        // Other actions can be implemented later
    };

    const handleStartChat = () => {
        setShowDropdown(false);
        if (onStartChat) {
            onStartChat();
        }
    };

    const handleSummarize = () => {
        setShowDropdown(false);
        // Summarize document action - can be implemented later
    };

    return (
        <div className="flex flex-col items-center gap-2">
            {actionButtons.map(({ icon: Icon, label, action }) => (
                <div
                    key={action}
                    className="relative"
                    onMouseEnter={() => setHoveredButton(action)}
                    onMouseLeave={() => setHoveredButton(null)}
                >
                    <button
                        onClick={() => handleClick(action)}
                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors"
                        aria-label={label}
                    >
                        <Icon size={20} className="text-gray-700" />
                    </button>
                    <ActionBarTooltip label={label} show={hoveredButton === action} />
                </div>
            ))}

            {/* Expert AI Button with Dropdown */}
            {showExpertButton && (
                <div
                    className="relative"
                    ref={dropdownRef}
                    onMouseEnter={() => !showDropdown && setShowExpertTooltip(true)}
                    onMouseLeave={() => setShowExpertTooltip(false)}
                >
                    <div onClick={() => { setShowDropdown(!showDropdown); setShowExpertTooltip(false); }}>
                        <ExpertButton isActive={showDropdown} />
                    </div>
                    <ActionBarTooltip label="Ask Expert AI" show={showExpertTooltip && !showDropdown} />

                    {/* Dropdown Menu */}
                    {showDropdown && (
                        <div
                            className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-[#DADADA] overflow-hidden min-w-[180px] z-50 py-2"
                            style={{ borderRadius: '8px' }}
                        >
                            <button
                                className="w-full px-4 h-8 flex items-center gap-3 text-gray-700 hover:bg-gray-50 transition-colors text-left whitespace-nowrap"
                                onClick={handleStartChat}
                            >
                                <MessageCircle size={18} className="text-gray-500" />
                                <span className="text-sm">Start a chat</span>
                            </button>
                            <button
                                className="w-full px-4 h-8 flex items-center gap-3 text-gray-700 hover:bg-gray-50 transition-colors text-left whitespace-nowrap"
                                onClick={handleSummarize}
                            >
                                <FileSearch size={18} className="text-gray-500" />
                                <span className="text-sm">Summarize document</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
