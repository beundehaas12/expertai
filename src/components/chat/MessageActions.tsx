import { ThumbsUp, ThumbsDown, Share2, MoreHorizontal, Copy, Flag, FileDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Dropdown } from '../ui/Dropdown';

interface MessageActionsProps {
    messageId: string;
    messageContent?: string;
}

export function MessageActions({ messageId, messageContent = '' }: MessageActionsProps) {

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
    };

    const handleReport = () => {
        console.log('Report message:', messageId);
    };

    const handleExportPdf = async () => {

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

    // Motion button props for consistent styling
    const motionProps = {
        whileHover: { backgroundColor: '#e6f2f9' },
        whileTap: { backgroundColor: '#F2F8FC' },
        transition: { duration: 0 }
    };

    // Small variant: 32px button (w-8 h-8), 16px icon
    const buttonClass = "w-8 h-8 rounded-full bg-white flex items-center justify-center";

    return (
        <div className="flex items-center gap-1 mt-2 -ml-2">
            <motion.button
                onClick={handleThumbsUp}
                className={buttonClass}
                {...motionProps}
                aria-label="Like"
                title="Like"
            >
                <ThumbsUp size={16} className="text-gray-700" />
            </motion.button>
            <motion.button
                onClick={handleThumbsDown}
                className={buttonClass}
                {...motionProps}
                aria-label="Dislike"
                title="Dislike"
            >
                <ThumbsDown size={16} className="text-gray-700" />
            </motion.button>
            <motion.button
                onClick={handleShare}
                className={buttonClass}
                {...motionProps}
                aria-label="Share"
                title="Share"
            >
                <Share2 size={16} className="text-gray-700" />
            </motion.button>

            {/* More dropdown using shared Dropdown component */}
            <Dropdown
                trigger={
                    <motion.button
                        className={buttonClass}
                        {...motionProps}
                        aria-label="More"
                        title="More"
                    >
                        <MoreHorizontal size={16} className="text-gray-700" />
                    </motion.button>
                }
                items={[
                    {
                        icon: <Copy size={18} />,
                        label: 'Copy to clipboard',
                        onClick: handleCopy,
                    },
                    {
                        icon: <FileDown size={18} />,
                        label: 'Export as PDF',
                        onClick: handleExportPdf,
                    },
                    {
                        icon: <Flag size={18} />,
                        label: 'Report issue',
                        onClick: handleReport,
                    },
                ]}
                position="left"
                direction="up"
            />
        </div>
    );
}
