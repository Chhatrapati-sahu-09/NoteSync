import React, { useState } from 'react';
import { Download, X, FileText, FileCode, Printer, Check } from 'lucide-react';
import { useNoteSyncStore } from '../store/useNoteSyncStore';
import { jsPDF } from 'jspdf';

export const ExportModal: React.FC = () => {
  const { exportModalOpen, setExportModalOpen, notes, activeVideo } = useNoteSyncStore();

  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!exportModalOpen || !activeVideo) return null;

  const videoNotes = notes.filter((n) => n.videoId === activeVideo.id);

  const exportAsMarkdown = () => {
    let mdContent = `# Notesync Export: ${activeVideo.title}\n\n`;
    mdContent += `*Exported on ${new Date().toLocaleDateString()}*\n\n---\n\n`;

    videoNotes.forEach((n, idx) => {
      mdContent += `### ${idx + 1}. [${n.formattedTime}] ${n.title}\n`;
      mdContent += `**Category:** ${n.category}\n\n`;
      mdContent += `${n.content}\n\n`;
      if (n.screenshot) {
        mdContent += `*Attached Frame Screenshot at ${n.screenshot.formattedTime}*\n\n`;
      }
      mdContent += `---\n\n`;
    });

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeVideo.title.substring(0, 20)}_notes.md`;
    link.click();

    triggerSuccess('Markdown');
  };

  const exportAsTXT = () => {
    let txt = `NOTESYNC EXPORT: ${activeVideo.title}\nDate: ${new Date().toLocaleString()}\n\n`;

    videoNotes.forEach((n, idx) => {
      txt += `[${n.formattedTime}] ${n.title} (${n.category})\n`;
      txt += `${n.content}\n`;
      txt += `----------------------------------------\n\n`;
    });

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeVideo.title.substring(0, 20)}_notes.txt`;
    link.click();

    triggerSuccess('TXT');
  };

  const exportAsPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(`NoteSync: ${activeVideo.title.substring(0, 40)}`, 14, 20);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Exported Date: ${new Date().toLocaleDateString()}`, 14, 28);
      doc.line(14, 32, 196, 32);

      let yPos = 40;

      videoNotes.forEach((n, idx) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(`[${n.formattedTime}] ${n.title}`, 14, yPos);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`Category: ${n.category}`, 14, yPos + 6);

        const splitText = doc.splitTextToSize(n.content, 175);
        doc.text(splitText, 14, yPos + 12);

        yPos += 16 + splitText.length * 5;
        doc.setDrawColor(230, 230, 230);
        doc.line(14, yPos - 4, 196, yPos - 4);
      });

      doc.save(`${activeVideo.title.substring(0, 20)}_notes.pdf`);
      triggerSuccess('PDF');
    } catch (e) {
      console.error('Failed to export PDF', e);
    }
  };

  const triggerSuccess = (type: string) => {
    setDownloadSuccess(type);
    setTimeout(() => {
      setDownloadSuccess(null);
      setExportModalOpen(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Export Notes ({videoNotes.length} notes)
            </h3>
          </div>
          <button
            onClick={() => setExportModalOpen(false)}
            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-500">
          Choose your preferred format to export notes and timestamp data for <strong>{activeVideo.title}</strong>.
        </p>

        {downloadSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-500" />
            <span>Successfully exported as {downloadSuccess}!</span>
          </div>
        )}

        {/* Options Grid */}
        <div className="grid grid-cols-1 gap-2 pt-1">
          <button
            onClick={exportAsMarkdown}
            className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-all group text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                <FileCode className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Markdown (.md)
                </p>
                <p className="text-[10px] text-zinc-400">
                  Ideal for Obsidian, Notion, GitHub
                </p>
              </div>
            </div>
            <Download className="w-4 h-4 text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-100" />
          </button>

          <button
            onClick={exportAsPDF}
            className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-all group text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                <Printer className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  PDF Document (.pdf)
                </p>
                <p className="text-[10px] text-zinc-400">
                  Print-ready document layout
                </p>
              </div>
            </div>
            <Download className="w-4 h-4 text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-100" />
          </button>

          <button
            onClick={exportAsTXT}
            className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-all group text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Plain Text (.txt)
                </p>
                <p className="text-[10px] text-zinc-400">
                  Simple lightweight plain text format
                </p>
              </div>
            </div>
            <Download className="w-4 h-4 text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-100" />
          </button>
        </div>
      </div>
    </div>
  );
};
