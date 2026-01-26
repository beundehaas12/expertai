

interface FormattedTextProps {
    text: string;
}

export function FormattedText({ text }: FormattedTextProps) {
    // Split text into lines and render with appropriate formatting
    const lines = text.split('\n');

    const renderLine = (line: string, index: number) => {
        // Main heading (# )
        if (line.startsWith('# ')) {
            return (
                <h2 key={index} className="text-lg font-semibold text-gray-900 mt-4 mb-2 first:mt-0">
                    {line.slice(2)}
                </h2>
            );
        }

        // Sub heading (## )
        if (line.startsWith('## ')) {
            return (
                <h3 key={index} className="text-base font-semibold text-gray-800 mt-4 mb-2">
                    {line.slice(3)}
                </h3>
            );
        }

        // Horizontal rule (---)
        if (line.trim() === '---') {
            return <hr key={index} className="my-4 border-gray-200" />;
        }

        // Bullet point (• or - )
        if (line.startsWith('• ') || line.startsWith('- ')) {
            return (
                <li key={index} className="ml-4 text-gray-700 mb-1 list-disc list-inside">
                    {line.slice(2)}
                </li>
            );
        }

        // Numbered list (1. 2. etc)
        const numberedMatch = line.match(/^(\d+)\.\s(.+)/);
        if (numberedMatch) {
            return (
                <li key={index} className="ml-4 text-gray-700 mb-1 list-decimal list-inside">
                    {numberedMatch[2]}
                </li>
            );
        }

        // Empty line = paragraph break
        if (line.trim() === '') {
            return <div key={index} className="h-2" />;
        }

        // Regular paragraph
        return (
            <p key={index} className="text-gray-700 mb-1">
                {line}
            </p>
        );
    };

    return (
        <div className="formatted-text">
            {lines.map((line, index) => renderLine(line, index))}
        </div>
    );
}
