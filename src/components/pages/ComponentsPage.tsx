import { ComponentShowcase } from './ComponentShowcase';
import { ExpertButton } from '../ui/ExpertButton';
import { ExpertDropdown } from '../ui/ExpertDropdown';
import { ChatInput } from '../voice';

// Full ExpertButton component code
const expertButtonCode = `import { useState } from 'react';

interface ExpertButtonProps {
    label?: string;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    isActive?: boolean;
}

export function ExpertButton({ label, onClick, disabled, className = '', isActive = false }: ExpertButtonProps) {
    const hasLabel = Boolean(label);
    const [isHovered, setIsHovered] = useState(false);

    // Expert AI gradient: angular gradient with pink/red, blue, green color stops
    const gradientBorder = \`conic-gradient(
        from 0deg,
        #F29097 5%,
        #E5202E 15%,
        #F29097 30%,
        #80BDE1 40%,
        #007AC3 50%,
        #80BDE1 60%,
        #C2DE90 70%,
        #85BC20 85%,
        #C2DE90 95%,
        #F29097 100%
    )\`;

    // Show gradient border on hover OR when active
    const showBorder = (isHovered || isActive) && !disabled;

    return (
        <div
            className="relative inline-flex"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Gradient border (1.5px outside) */}
            <div
                className="absolute rounded-full transition-opacity duration-200"
                style={{
                    top: '-1.5px',
                    left: '-1.5px',
                    right: '-1.5px',
                    bottom: '-1.5px',
                    background: gradientBorder,
                    opacity: showBorder ? 1 : 0,
                    zIndex: 0,
                }}
            />

            <button
                onClick={onClick}
                disabled={disabled}
                className={\`
                    relative z-10
                    group
                    inline-flex items-center justify-center gap-2
                    rounded-full
                    transition-all duration-200
                    disabled:opacity-50
                    \${hasLabel ? 'px-[10px] h-8' : 'w-8 h-8'}
                    \${isActive ? 'bg-white' : 'bg-black'}
                    \${className}
                \`}
                style={{
                    fontFamily: "'Fira Sans', sans-serif",
                }}
            >
                <img
                    src="./img/expert-ai-spark-button.svg"
                    alt=""
                    className={\`
                        \${hasLabel ? 'w-4 h-4' : 'w-5 h-5'} 
                        transition-all duration-200
                        \${isActive ? 'brightness-0' : 'group-hover:brightness-0 group-hover:invert'}
                    \`}
                />
                {hasLabel && (
                    <span
                        className={\`font-normal \${isActive ? 'text-black' : 'text-white'}\`}
                        style={{
                            fontSize: '14px',
                            lineHeight: '15.8px',
                        }}
                    >
                        {label}
                    </span>
                )}
            </button>
        </div>
    );
}`;

// Full dropdown component code
const dropdownCode = `import { useState, useRef, useEffect } from 'react';
import { MessageCircle, FileSearch } from 'lucide-react';
import { ExpertButton } from './ExpertButton';

export function ExpertDropdown() {
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

    return (
        <div className="relative" ref={dropdownRef}>
            <div onClick={() => setShowDropdown(!showDropdown)}>
                <ExpertButton isActive={showDropdown} />
            </div>

            {showDropdown && (
                <div
                    className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg overflow-hidden min-w-[180px] py-2 z-50"
                    style={{ border: '1px solid #DADADA', borderRadius: '8px' }}
                >
                    <button
                        className="w-full flex items-center hover:bg-gray-50 transition-colors text-left"
                        style={{ gap: '8px', paddingLeft: '16px', paddingRight: '16px', height: '32px' }}
                        onClick={() => { /* Handle action */ setShowDropdown(false); }}
                    >
                        <MessageCircle size={18} style={{ color: '#323232' }} />
                        <span className="text-sm" style={{ color: '#323232' }}>Start a chat</span>
                    </button>
                    <button
                        className="w-full flex items-center hover:bg-gray-50 transition-colors text-left"
                        style={{ gap: '8px', paddingLeft: '16px', paddingRight: '16px', height: '32px' }}
                        onClick={() => { /* Handle action */ setShowDropdown(false); }}
                    >
                        <FileSearch size={18} style={{ color: '#323232' }} />
                        <span className="text-sm" style={{ color: '#323232' }}>Summarize document</span>
                    </button>
                </div>
            )}
        </div>
    );
}`;

// Full chat input component code  
const chatInputCode = `import { useState, useRef } from 'react';
import { Mic, ArrowUp, Plus, X, Image, FileText } from 'lucide-react';

interface ChatInputProps {
    onSend: (text: string, images?: string[]) => void;
    placeholder?: string;
}

export function ChatInput({ onSend, placeholder = "Ask Expert AI..." }: ChatInputProps) {
    const [value, setValue] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [showAttachments, setShowAttachments] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const attachmentRef = useRef<HTMLDivElement>(null);

    const handleSend = () => {
        if (value.trim()) {
            onSend(value.trim());
            setValue('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="relative w-full">
            <div
                className="flex items-center gap-3 px-4 bg-white rounded-full"
                style={{
                    border: '1px solid #DADADA',
                    height: '48px',
                }}
            >
                {/* Attachment Button */}
                <div className="relative" ref={attachmentRef}>
                    <button
                        onClick={() => setShowAttachments(!showAttachments)}
                        className={\`w-8 h-8 rounded-full flex items-center justify-center transition-colors \${
                            showAttachments ? 'bg-gray-200' : 'hover:bg-gray-100'
                        }\`}
                    >
                        {showAttachments ? <X size={18} color="#323232" /> : <Plus size={18} color="#323232" />}
                    </button>

                    {/* Attachment Dropdown */}
                    {showAttachments && (
                        <div
                            className="absolute left-0 bottom-full mb-2 bg-white rounded-lg shadow-lg py-2 z-50"
                            style={{ border: '1px solid #DADADA', minWidth: '160px' }}
                        >
                            <button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
                                <Image size={18} color="#323232" />
                                <span className="text-sm" style={{ color: '#323232' }}>Upload image</span>
                            </button>
                            <button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
                                <FileText size={18} color="#323232" />
                                <span className="text-sm" style={{ color: '#323232' }}>Upload document</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Input Field */}
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-1 outline-none bg-transparent"
                    style={{
                        fontFamily: "'Fira Sans', sans-serif",
                        fontSize: '14px',
                        color: '#232323',
                    }}
                />

                {/* Mic Button */}
                <button
                    onClick={() => setIsRecording(!isRecording)}
                    className={\`w-8 h-8 rounded-full flex items-center justify-center transition-colors \${
                        isRecording ? 'bg-red-100' : 'hover:bg-gray-100'
                    }\`}
                >
                    <Mic size={18} color={isRecording ? '#E5202E' : '#323232'} />
                </button>

                {/* Send Button */}
                <button
                    onClick={handleSend}
                    disabled={!value.trim()}
                    className="w-8 h-8 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                    <ArrowUp size={18} color="white" />
                </button>
            </div>
        </div>
    );
}`;


export function ComponentsPage() {
    return (
        <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="max-w-4xl mx-auto px-8 py-12">
                {/* Page Header */}
                <div className="mb-12">
                    <h1 className="text-3xl font-semibold text-gray-900 mb-4">
                        Expert AI Components
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Copy-paste ready React components for building Expert AI-powered interfaces.
                    </p>

                    {/* Installation Instructions */}
                    <div
                        className="bg-white rounded-xl p-6"
                        style={{ border: '1px solid #DADADA' }}
                    >
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Installation</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-2">1. Install dependencies:</p>
                                <pre
                                    className="p-3 rounded-lg text-sm overflow-x-auto"
                                    style={{
                                        backgroundColor: '#1E1E1E',
                                        color: '#D4D4D4',
                                        fontFamily: "'Fira Code', monospace",
                                    }}
                                >
                                    npm install framer-motion lucide-react
                                </pre>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-2">2. Add font to your HTML head:</p>
                                <pre
                                    className="p-3 rounded-lg text-sm overflow-x-auto"
                                    style={{
                                        backgroundColor: '#1E1E1E',
                                        color: '#D4D4D4',
                                        fontFamily: "'Fira Code', monospace",
                                    }}
                                >
                                    {`<link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@300;400;500&display=swap" rel="stylesheet">`}
                                </pre>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-2">3. Add icon to public folder:</p>
                                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                    public/img/expert-ai-spark-button.svg
                                </code>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Component Grid */}
                <div className="space-y-8">
                    {/* Button with Label */}
                    <ComponentShowcase
                        title="Button with Label"
                        description="Expert AI button with text label and animated gradient border on hover."
                        code={expertButtonCode}
                    >
                        <ExpertButton label="Ask Expert AI" onClick={() => { }} />
                    </ComponentShowcase>

                    {/* Button Icon Only */}
                    <ComponentShowcase
                        title="Button Icon"
                        description="Compact icon-only button. Uses the same component with no label prop."
                        code={expertButtonCode}
                    >
                        <ExpertButton onClick={() => { }} />
                    </ComponentShowcase>

                    {/* Dropdown */}
                    <ComponentShowcase
                        title="Dropdown"
                        description="Expert AI button with dropdown menu. Click to reveal actions."
                        code={dropdownCode}
                    >
                        <ExpertDropdown position="left" />
                    </ComponentShowcase>

                    {/* Chat Input */}
                    <ComponentShowcase
                        title="Chat Input"
                        description="Full-featured chat input with attachments, voice recording, and send button."
                        code={chatInputCode}
                    >
                        <div style={{ width: '100%', maxWidth: '500px' }}>
                            <ChatInput onSend={() => { }} variant="glow" />
                        </div>
                    </ComponentShowcase>
                </div>
            </div>
        </div>
    );
}
