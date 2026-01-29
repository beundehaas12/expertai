import { useState, useRef, useEffect } from 'react';
import { MessageCircle, FileSearch } from 'lucide-react';
import { ExpertButton } from './ExpertButton';

interface ExpertDropdownProps {
    onStartChat?: () => void;
    onSummarize?: () => void;
    position?: 'left' | 'center' | 'right';
}

export function ExpertDropdown({ onStartChat, onSummarize, position = 'right' }: ExpertDropdownProps) {
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
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showDropdown]);

    const handleStartChat = () => {
        setShowDropdown(false);
        onStartChat?.();
    };

    const handleSummarize = () => {
        setShowDropdown(false);
        onSummarize?.();
    };

    // Position classes for dropdown alignment
    const positionClasses = {
        left: 'left-0',
        center: 'left-1/2 -translate-x-1/2',
        right: 'right-0',
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div onClick={() => setShowDropdown(!showDropdown)}>
                <ExpertButton isActive={showDropdown} />
            </div>

            {showDropdown && (
                <div
                    className={`absolute ${positionClasses[position]} top-full mt-2 bg-white rounded-lg shadow-lg overflow-hidden py-2 z-50`}
                    style={{
                        border: '1px solid #DADADA',
                        borderRadius: '8px',
                        minWidth: '200px',
                    }}
                >
                    <button
                        className="w-full flex items-center hover:bg-gray-50 transition-colors text-left"
                        style={{ gap: '8px', paddingLeft: '16px', paddingRight: '16px', height: '32px' }}
                        onClick={handleStartChat}
                    >
                        <MessageCircle size={18} style={{ color: '#323232', flexShrink: 0 }} />
                        <span className="text-sm whitespace-nowrap" style={{ color: '#323232' }}>Start a chat</span>
                    </button>
                    <button
                        className="w-full flex items-center hover:bg-gray-50 transition-colors text-left"
                        style={{ gap: '8px', paddingLeft: '16px', paddingRight: '16px', height: '32px' }}
                        onClick={handleSummarize}
                    >
                        <FileSearch size={18} style={{ color: '#323232', flexShrink: 0 }} />
                        <span className="text-sm whitespace-nowrap" style={{ color: '#323232' }}>Summarize document</span>
                    </button>
                </div>
            )}
        </div>
    );
}
