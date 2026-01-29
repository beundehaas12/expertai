import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface ComponentShowcaseProps {
    title: string;
    description: string;
    children: React.ReactNode;
    code: string;
}

// Simple syntax highlighter for TSX code
function highlightCode(code: string): React.ReactNode[] {
    const lines = code.split('\n');

    return lines.map((line, lineIndex) => {
        const tokens: React.ReactNode[] = [];
        let remaining = line;
        let keyIndex = 0;

        // Keywords
        const keywords = /\b(import|export|from|const|let|var|function|return|if|else|interface|type|class|extends|implements|new|this|true|false|null|undefined|async|await)\b/g;
        // Strings
        const strings = /(["'`])(?:(?!\1)[^\\]|\\.)*?\1/g;
        // Comments
        const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/|{\/\*[\s\S]*?\*\/})/g;
        // JSX tags
        const jsxTags = /(<\/?[A-Za-z][A-Za-z0-9]*|<\/?>)/g;
        // Props/attributes
        const props = /\b([a-zA-Z][a-zA-Z0-9]*)(=)/g;
        // Types
        const types = /:\s*([A-Z][a-zA-Z0-9]*(?:<[^>]+>)?|\([^)]*\)\s*=>\s*[a-zA-Z]+)/g;

        // Process the line with regex replacements
        let processedLine = remaining;
        const segments: { start: number; end: number; type: string; content: string }[] = [];

        // Find comments first (highest priority)
        let match;
        const commentRegex = /(\/\/.*$|{\/\*[\s\S]*?\*\/})/g;
        while ((match = commentRegex.exec(remaining)) !== null) {
            segments.push({ start: match.index, end: match.index + match[0].length, type: 'comment', content: match[0] });
        }

        // Find strings
        const stringRegex = /(["'`])(?:(?!\1)[^\\]|\\.)*?\1/g;
        while ((match = stringRegex.exec(remaining)) !== null) {
            const overlaps = segments.some(s => match!.index >= s.start && match!.index < s.end);
            if (!overlaps) {
                segments.push({ start: match.index, end: match.index + match[0].length, type: 'string', content: match[0] });
            }
        }

        // Sort segments by start position
        segments.sort((a, b) => a.start - b.start);

        // Build highlighted line
        let pos = 0;
        for (const seg of segments) {
            if (seg.start > pos) {
                // Process text before this segment
                const before = remaining.slice(pos, seg.start);
                tokens.push(...highlightPlainCode(before, `${lineIndex}-${keyIndex++}`));
            }
            // Add the segment with its color
            const color = seg.type === 'comment' ? '#6A9955' : '#CE9178';
            tokens.push(<span key={`${lineIndex}-${keyIndex++}`} style={{ color }}>{seg.content}</span>);
            pos = seg.end;
        }

        // Process remaining text
        if (pos < remaining.length) {
            tokens.push(...highlightPlainCode(remaining.slice(pos), `${lineIndex}-${keyIndex++}`));
        }

        return (
            <div key={lineIndex}>
                {tokens.length > 0 ? tokens : '\n'}
            </div>
        );
    });
}

function highlightPlainCode(text: string, keyPrefix: string): React.ReactNode[] {
    const tokens: React.ReactNode[] = [];

    // Enhanced regex patterns for better matching
    const pattern = /(\b(?:import|export|from|const|let|var|function|return|if|else|interface|type|class|extends|new|true|false|null|undefined|async|await)\b)|(<\/?[A-Za-z][A-Za-z0-9.]*\s*)|(\s*\/?>)|(\b[a-zA-Z][a-zA-Z0-9]*(?==))|(:?\s*[A-Z][a-zA-Z0-9<>[\]]*(?:\s*\|\s*[A-Za-z][A-Za-z0-9<>[\]]*)*)|(\{|\}|\(|\)|\[|\]|=>|===|!==|&&|\|\||\.)|([0-9]+)/g;

    let lastIndex = 0;
    let match;
    let keyIndex = 0;

    while ((match = pattern.exec(text)) !== null) {
        // Add text before match
        if (match.index > lastIndex) {
            tokens.push(<span key={`${keyPrefix}-${keyIndex++}`} style={{ color: '#D4D4D4' }}>{text.slice(lastIndex, match.index)}</span>);
        }

        const value = match[0];
        let color = '#D4D4D4';

        // Keywords
        if (match[1]) {
            color = '#C586C0'; // Purple for keywords
        }
        // JSX opening tags
        else if (match[2]) {
            color = '#4EC9B0'; // Teal for tags
        }
        // JSX closing
        else if (match[3]) {
            color = '#808080'; // Gray for brackets
        }
        // Props
        else if (match[4]) {
            color = '#9CDCFE'; // Light blue for props
        }
        // Types
        else if (match[5] && match[5].includes(':')) {
            color = '#4EC9B0'; // Teal for types
        }
        // Punctuation
        else if (match[6]) {
            color = '#D4D4D4';
        }
        // Numbers
        else if (match[7]) {
            color = '#B5CEA8'; // Light green for numbers
        }

        tokens.push(<span key={`${keyPrefix}-${keyIndex++}`} style={{ color }}>{value}</span>);
        lastIndex = pattern.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
        tokens.push(<span key={`${keyPrefix}-${keyIndex++}`} style={{ color: '#D4D4D4' }}>{text.slice(lastIndex)}</span>);
    }

    return tokens;
}

export function ComponentShowcase({ title, description, children, code }: ComponentShowcaseProps) {
    const [showCode, setShowCode] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div
            className="bg-white rounded-xl overflow-hidden"
            style={{ border: '1px solid #DADADA' }}
        >
            {/* Header */}
            <div className="p-6 border-b border-[#DADADA]">
                <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500">{description}</p>
            </div>

            {/* Preview Area */}
            <div
                className="p-8 flex items-center justify-center relative"
                style={{ backgroundColor: '#FAFAFA', minHeight: '200px' }}
            >
                {children}
            </div>

            {/* Code Section */}
            <div className="border-t border-[#DADADA]">
                {/* Toggle & Copy Buttons */}
                <div className="flex items-center justify-between px-4 py-2 bg-white">
                    <button
                        onClick={() => setShowCode(!showCode)}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        {showCode ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        {showCode ? 'Hide Code' : 'View Code'}
                    </button>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        {copied ? (
                            <>
                                <Check size={16} className="text-green-600" />
                                <span className="text-green-600">Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy size={16} />
                                Copy Code
                            </>
                        )}
                    </button>
                </div>

                {/* Code Display */}
                <AnimatePresence>
                    {showCode && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <pre
                                className="p-4 text-sm"
                                style={{
                                    backgroundColor: '#1E1E1E',
                                    fontFamily: "'Fira Code', 'Monaco', monospace",
                                    lineHeight: 1.6,
                                    textAlign: 'left',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                }}
                            >
                                <code style={{ display: 'block', textAlign: 'left' }}>
                                    {highlightCode(code)}
                                </code>
                            </pre>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
