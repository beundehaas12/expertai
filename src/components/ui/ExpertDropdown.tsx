import { MessageCircle, FileSearch } from 'lucide-react';
import { Dropdown } from './Dropdown';
import { ExpertButton } from './ExpertButton';

interface ExpertDropdownProps {
    onStartChat?: () => void;
    onSummarize?: () => void;
    position?: 'left' | 'center' | 'right';
}

export function ExpertDropdown({ onStartChat, onSummarize, position = 'right' }: ExpertDropdownProps) {
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
            trigger={<ExpertButton />}
            items={items}
            position={position}
            minWidth={200}
        />
    );
}
