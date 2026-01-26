interface ExpertButtonProps {
    label?: string;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
}

export function ExpertButton({ label, onClick, disabled, className = '' }: ExpertButtonProps) {
    const hasLabel = Boolean(label);

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                group
                inline-flex items-center justify-center gap-2
                bg-black rounded-lg
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                ${hasLabel ? 'px-[10px] h-8' : 'w-8 h-8'}
                ${className}
            `}
            style={{
                fontFamily: "'Fira Sans', sans-serif",
            }}
        >
            <img
                src="/img/expert-ai-spark-button.svg"
                alt=""
                className={`${hasLabel ? 'w-4 h-4' : 'w-5 h-5'} transition-all duration-200 group-hover:brightness-0 group-hover:invert`}
            />
            {hasLabel && (
                <span
                    className="text-white font-normal"
                    style={{
                        fontSize: '14px',
                        lineHeight: '15.8px',
                    }}
                >
                    {label}
                </span>
            )}
        </button>
    );
}
