import { useState } from 'react';
import { MessageCircle, FileSearch } from 'lucide-react';
import { Dropdown } from './Dropdown';
import { ExpertButton } from './ExpertButton';

interface ExpertDropdownProps {
    onStartChat?: () => void;
    onSummarize?: () => void;
    position?: 'left' | 'center' | 'right';
}

export function ExpertDropdown({ onStartChat, onSummarize, position = 'right' }: ExpertDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);

    const items = [
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
        <Dropdown
            trigger={<ExpertButton isActive={isOpen} />}
            items={items}
            position={position}
            minWidth={200}
            isOpen={isOpen}
            onOpenChange={setIsOpen}
        />
    );
}
