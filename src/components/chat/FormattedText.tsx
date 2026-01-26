interface FormattedTextProps {
    text: string;
}

// Render inline formatting like **bold**
function renderInlineFormatting(text: string): React.ReactNode {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
        // Look for **bold**
        const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);

        if (boldMatch && boldMatch.index !== undefined) {
            // Add text before the match
            if (boldMatch.index > 0) {
                parts.push(remaining.slice(0, boldMatch.index));
            }
            // Add the bold text
            parts.push(<strong key={key++} className="font-semibold">{boldMatch[1]}</strong>);
            remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
        } else {
            // No more matches, add remaining text
            parts.push(remaining);
            break;
        }
    }

    return parts.length === 1 ? parts[0] : parts;
}

export function FormattedText({ text }: FormattedTextProps) {
    // Split text into lines and render with appropriate formatting
    const lines = text.split('\n');

    const renderLine = (line: string, index: number) => {
        // Main heading (# )
        if (line.startsWith('# ')) {
            return (
                <h2 key={index} className="text-lg font-semibold text-gray-900 mt-4 mb-2 first:mt-0">
                    {renderInlineFormatting(line.slice(2))}
                </h2>
            );
        }

        // Sub heading (## )
        if (line.startsWith('## ')) {
            return (
                <h3 key={index} className="text-base font-semibold text-gray-800 mt-4 mb-2">
                    {renderInlineFormatting(line.slice(3))}
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
                    {renderInlineFormatting(line.slice(2))}
                </li>
            );
        }

        // Numbered list (1. 2. etc)
        const numberedMatch = line.match(/^(\d+)\.\s(.+)/);
        if (numberedMatch) {
            return (
                <li key={index} className="ml-4 text-gray-700 mb-1 list-decimal list-inside">
                    {renderInlineFormatting(numberedMatch[2])}
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
                {renderInlineFormatting(line)}
            </p>
        );
    };

    return (
        <div className="formatted-text">
            {lines.map((line, index) => renderLine(line, index))}
        </div>
    );
}
