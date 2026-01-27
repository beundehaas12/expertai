import { useState, useRef, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Share2, MoreHorizontal, Copy, Flag, FileDown } from 'lucide-react';

interface MessageActionsProps {
    messageId: string;
    messageContent?: string;
}

export function MessageActions({ messageId, messageContent = '' }: MessageActionsProps) {
    const [moreOpen, setMoreOpen] = useState(false);
    const moreRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
                setMoreOpen(false);
            }
        };

        if (moreOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [moreOpen]);

    const handleThumbsUp = () => {
        console.log('Thumbs up for message:', messageId);
    };

    const handleThumbsDown = () => {
        console.log('Thumbs down for message:', messageId);
    };

    const handleShare = () => {
        console.log('Share message:', messageId);
    };

    const handleCopy = () => {
        // Copy the message content to clipboard
        if (messageContent) {
            navigator.clipboard.writeText(messageContent);
        }
        setMoreOpen(false);
    };

    const handleReport = () => {
        console.log('Report message:', messageId);
        setMoreOpen(false);
    };

    const handleExportPdf = async () => {
        setMoreOpen(false);

        // Dynamic import of jspdf for code splitting
        const { jsPDF } = await import('jspdf');

        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const timestamp = new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);

        // Header
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Expert AI Response', margin, 25);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated: ${timestamp}`, margin, 33);

        // Divider line
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, 38, pageWidth - margin, 38);

        // Content - clean up markdown-style formatting for plain text
        const cleanContent = messageContent
            .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove bold markers
            .replace(/\*(.*?)\*/g, '$1')      // Remove italic markers
            .replace(/`(.*?)`/g, '$1');       // Remove code markers

        doc.setTextColor(30, 30, 30);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');

        // Split text into lines that fit the page width
        const lines = doc.splitTextToSize(cleanContent, contentWidth);

        let yPosition = 48;
        const lineHeight = 6;
        const pageHeight = doc.internal.pageSize.getHeight();
        const bottomMargin = 30;

        lines.forEach((line: string) => {
            // Check if we need a new page
            if (yPosition > pageHeight - bottomMargin) {
                doc.addPage();
                yPosition = margin;
            }
            doc.text(line, margin, yPosition);
            yPosition += lineHeight;
        });

        // Footer
        const footerY = pageHeight - 15;
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text('Exported from Expert AI', margin, footerY);

        // Generate filename with timestamp
        const filename = `expert-ai-response-${new Date().toISOString().slice(0, 10)}.pdf`;

        // Save/download the PDF
        doc.save(filename);
    };

    // Small variant: 32px button (w-8 h-8), 16px icon
    const buttonClass = "w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors";

    return (
        <div className="flex items-center gap-1 mt-2">
            <button
                onClick={handleThumbsUp}
                className={buttonClass}
                aria-label="Like"
                title="Like"
            >
                <ThumbsUp size={16} className="text-gray-700" />
            </button>
            <button
                onClick={handleThumbsDown}
                className={buttonClass}
                aria-label="Dislike"
                title="Dislike"
            >
                <ThumbsDown size={16} className="text-gray-700" />
            </button>
            <button
                onClick={handleShare}
                className={buttonClass}
                aria-label="Share"
                title="Share"
            >
                <Share2 size={16} className="text-gray-700" />
            </button>

            {/* More dropdown - same pattern as ActionBar Expert button dropdown */}
            <div ref={moreRef} className="relative">
                <button
                    onClick={() => setMoreOpen(!moreOpen)}
                    className={`${buttonClass} ${moreOpen ? 'bg-gray-100' : ''}`}
                    aria-label="More"
                    title="More"
                >
                    <MoreHorizontal size={16} className="text-gray-700" />
                </button>

                {/* Dropdown Menu - same style as ActionBar dropdown (line 77-88) */}
                {moreOpen && (
                    <div
                        className="absolute left-0 bottom-full mb-2 bg-white rounded-lg shadow-lg border border-[#DADADA] overflow-hidden min-w-[160px] z-50 py-2"
                        style={{ borderRadius: '8px' }}
                    >
                        <button
                            className="w-full px-4 h-8 flex items-center gap-3 text-gray-700 hover:bg-gray-50 transition-colors text-left whitespace-nowrap"
                            onClick={handleCopy}
                        >
                            <Copy size={18} className="text-gray-500" />
                            <span className="text-sm">Copy to clipboard</span>
                        </button>
                        <button
                            className="w-full px-4 h-8 flex items-center gap-3 text-gray-700 hover:bg-gray-50 transition-colors text-left whitespace-nowrap"
                            onClick={handleExportPdf}
                        >
                            <FileDown size={18} className="text-gray-500" />
                            <span className="text-sm">Export as PDF</span>
                        </button>
                        <button
                            className="w-full px-4 h-8 flex items-center gap-3 text-gray-700 hover:bg-gray-50 transition-colors text-left whitespace-nowrap"
                            onClick={handleReport}
                        >
                            <Flag size={18} className="text-gray-500" />
                            <span className="text-sm">Report issue</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
