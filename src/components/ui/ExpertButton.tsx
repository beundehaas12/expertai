import { useState } from 'react';

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
    const gradientBorder = `conic-gradient(
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
    )`;

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
                className={`
                    relative z-10
                    group
                    inline-flex items-center justify-center gap-2
                    rounded-full
                    transition-all duration-200
                    disabled:opacity-50
                    ${hasLabel ? 'px-[10px] h-8' : 'w-8 h-8'}
                    ${isActive ? 'bg-white' : 'bg-black'}
                    ${className}
                `}
                style={{
                    fontFamily: "'Fira Sans', sans-serif",
                }}
            >
                <img
                    src="/img/expert-ai-spark-button.svg"
                    alt=""
                    className={`
                        ${hasLabel ? 'w-4 h-4' : 'w-5 h-5'} 
                        transition-all duration-200
                        ${isActive ? 'brightness-0' : 'group-hover:brightness-0 group-hover:invert'}
                    `}
                />
                {hasLabel && (
                    <span
                        className={`font-normal ${isActive ? 'text-black' : 'text-white'}`}
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
}

