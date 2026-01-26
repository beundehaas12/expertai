import { useState, useRef, useEffect } from 'react';
import { Plus, FileText, Bookmark, Share2, Settings, MessageCircle } from 'lucide-react';
import { ExpertButton } from './ExpertButton';

interface ActionBarProps {
    onNewChat?: () => void;
    onStartChat?: () => void;
}

const actionButtons = [
    { icon: Plus, label: 'New', action: 'new' },
    { icon: FileText, label: 'Documents', action: 'documents' },
    { icon: Bookmark, label: 'Saved', action: 'saved' },
    { icon: Share2, label: 'Share', action: 'share' },
    { icon: Settings, label: 'Settings', action: 'settings' },
] as const;

export function ActionBar({ onNewChat, onStartChat }: ActionBarProps) {
    const [showDropdown, setShowDropdown] = useState(false);
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

    return (
        <div className="flex flex-col items-center gap-2 p-2">
            {actionButtons.map(({ icon: Icon, label, action }) => (
                <button
                    key={action}
                    onClick={() => handleClick(action)}
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors"
                    aria-label={label}
                    title={label}
                >
                    <Icon size={20} className="text-gray-700" />
                </button>
            ))}

            {/* Expert AI Button with Dropdown */}
            <div className="relative" ref={dropdownRef}>
                <div onClick={() => setShowDropdown(!showDropdown)}>
                    <ExpertButton />
                </div>

                {/* Dropdown Menu */}
                {showDropdown && (
                    <div
                        className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-[#DADADA] overflow-hidden min-w-[160px] z-50 py-2"
                        style={{ borderRadius: '8px' }}
                    >
                        <button
                            className="w-full px-4 h-8 flex items-center gap-3 text-gray-700 hover:bg-gray-50 transition-colors text-left whitespace-nowrap"
                            onClick={handleStartChat}
                        >
                            <MessageCircle size={18} className="text-gray-500" />
                            <span className="text-sm">Start a chat</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
