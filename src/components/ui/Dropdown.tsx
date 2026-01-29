import { useState, useRef, useEffect, ReactNode } from 'react';

export interface DropdownItem {
    icon: ReactNode;
    label: string;
    onClick: () => void;
}

interface DropdownProps {
    trigger: ReactNode;
    items: DropdownItem[];
    position?: 'left' | 'center' | 'right';
    direction?: 'up' | 'down';
    minWidth?: number;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function Dropdown({
    trigger,
    items,
    position = 'left',
    direction = 'down',
    minWidth = 180,
    isOpen: controlledOpen,
    onOpenChange,
}: DropdownProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Support both controlled and uncontrolled modes
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = (open: boolean) => {
        if (controlledOpen === undefined) {
            setInternalOpen(open);
        }
        onOpenChange?.(open);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Position classes
    const positionClasses = {
        left: 'left-0',
        center: 'left-1/2 -translate-x-1/2',
        right: 'right-0',
    };

    const directionClasses = direction === 'up'
        ? 'bottom-full mb-2'
        : 'top-full mt-2';

    return (
        <div className="relative" ref={dropdownRef}>
            <div onClick={() => setOpen(!isOpen)}>
                {trigger}
            </div>

            {isOpen && (
                <div
                    className={`absolute ${positionClasses[position]} ${directionClasses} bg-white shadow-lg z-50 py-2`}
                    style={{
                        border: '1px solid #DADADA',
                        borderRadius: '8px',
                        minWidth: `${minWidth}px`,
                    }}
                >
                    {items.map((item, index) => (
                        <button
                            key={index}
                            className="w-full flex items-center text-left"
                            style={{
                                gap: '8px',
                                paddingLeft: '16px',
                                paddingRight: '16px',
                                height: '32px'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E6F2F9'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            onClick={() => {
                                item.onClick();
                                setOpen(false);
                            }}
                        >
                            <span style={{ color: '#323232', flexShrink: 0 }}>{item.icon}</span>
                            <span className="text-sm whitespace-nowrap" style={{ color: '#323232' }}>
                                {item.label}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
