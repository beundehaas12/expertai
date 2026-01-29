import { useState } from 'react';
import { FolderOpen, FileText, Bookmark, Share2, Settings, MessageCircle, FileSearch } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExpertButton } from './ExpertButton';
import { Dropdown } from './Dropdown';

interface ActionBarProps {
    onNewChat?: () => void;
    onStartChat?: () => void;
    onSummarize?: () => void;
    showExpertButton?: boolean;
}

const actionButtons = [
    { icon: FolderOpen, label: 'Files', action: 'files' },
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

export function ActionBar({ onStartChat, onSummarize, showExpertButton = true }: ActionBarProps) {
    const [hoveredButton, setHoveredButton] = useState<string | null>(null);
    const [showExpertTooltip, setShowExpertTooltip] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleClick = (_action: string) => {
        // Dummy handlers - no functionality implemented
    };

    const dropdownItems = [
        {
            icon: <MessageCircle size={18} />,
            label: 'Start a chat',
            onClick: () => onStartChat?.(),
        },
        {
            icon: <FileSearch size={18} />,
            label: 'Summarize document',
            onClick: () => onSummarize?.(),
        },
    ];

    return (
        <div className="flex flex-col items-center gap-2">
            {actionButtons.map(({ icon: Icon, label, action }) => (
                <div
                    key={action}
                    className="relative"
                    onMouseEnter={() => setHoveredButton(action)}
                    onMouseLeave={() => setHoveredButton(null)}
                >
                    <motion.button
                        onClick={() => handleClick(action)}
                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center"
                        whileHover={{ backgroundColor: '#e6f2f9' }}
                        whileTap={{ backgroundColor: '#F2F8FC' }}
                        transition={{ duration: 0 }}
                        aria-label={label}
                    >
                        <Icon size={20} className="text-gray-700" />
                    </motion.button>
                    <ActionBarTooltip label={label} show={hoveredButton === action} />
                </div>
            ))}

            {/* Expert AI Button with Dropdown */}
            {showExpertButton && (
                <div
                    className="relative"
                    onMouseEnter={() => !dropdownOpen && setShowExpertTooltip(true)}
                    onMouseLeave={() => setShowExpertTooltip(false)}
                >
                    <Dropdown
                        trigger={<ExpertButton isActive={dropdownOpen} />}
                        items={dropdownItems}
                        position="right"
                        isOpen={dropdownOpen}
                        onOpenChange={(open) => {
                            setDropdownOpen(open);
                            if (open) setShowExpertTooltip(false);
                        }}
                    />
                    <ActionBarTooltip label="Ask Expert AI" show={showExpertTooltip && !dropdownOpen} />
                </div>
            )}
        </div>
    );
}
