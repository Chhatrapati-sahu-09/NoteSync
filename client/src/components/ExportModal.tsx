import React, { useState } from 'react';
import { Download, X, FileText, FileCode, Printer, Check } from 'lucide-react';
import { useNoteSyncStore } from '../store/useNoteSyncStore';
import { jsPDF } from 'jspdf';

export const ExportModal: React.FC = () => {
  const { exportModalOpen, setExportModalOpen, notes, activeVideo } = useNoteSyncStore();

  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!exportModalOpen || !activeVideo) return null;

  const videoNotes = notes.filter((n) => n.videoId === activeVideo.id);

  const getImageDataUrl = async (url: string): Promise<string | null> => {
    if (url.startsWith('data:')) return url;
    try {
      const imgUrl = url.startsWith('http') ? url : window.location.origin + url;
      const res = await fetch(imgUrl);
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error('Failed to fetch image Data URL', e);
      return null;
    }
  };

  const exportAsMarkdown = () => {
    let mdContent = `# NoteSync Export: ${activeVideo.title}\n\n`;
    mdContent += `*Exported on ${new Date().toLocaleString()}*\n\n---\n\n`;

    videoNotes.forEach((n, idx) => {
      mdContent += `### ${idx + 1}. [${n.formattedTime}] ${n.title}\n`;
      mdContent += `**Category:** \`${n.category}\`  |  **Favorite:** ${n.isFavorite ? '★ Yes' : '☆ No'}\n\n`;
      mdContent += `${n.content}\n\n`;
      if (n.screenshot) {
        const imgUrl = n.screenshot.dataUrl.startsWith('data:')
          ? n.screenshot.dataUrl
          : window.location.origin + n.screenshot.dataUrl;
        mdContent += `#### Attached Frame Snapshot:\n`;
        mdContent += `![Frame Snapshot at ${n.screenshot.formattedTime}](${imgUrl})\n\n`;
      }
      mdContent += `---\n\n`;
    });

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeVideo.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes.md`;
    link.click();

    triggerSuccess('Markdown');
  };

  const exportAsTXT = () => {
    let txt = `==================================================\n`;
    txt += `  NOTESYNC LECTURE EXPORT: ${activeVideo.title.toUpperCase()}\n`;
    txt += `  Export Date: ${new Date().toLocaleString()}\n`;
    txt += `==================================================\n\n`;

    videoNotes.forEach((n, idx) => {
      txt += `--------------------------------------------------\n`;
      txt += `[${idx + 1}] TIME: ${n.formattedTime} | CATEGORY: ${n.category}\n`;
      txt += `TITLE: ${n.title}\n`;
      txt += `FAVORITE: ${n.isFavorite ? 'Yes' : 'No'}\n`;
      txt += `--------------------------------------------------\n`;
      txt += `${n.content}\n`;
      if (n.screenshot) {
        txt += `[Attached Screenshot Frame Saved at ${n.screenshot.formattedTime}]\n`;
      }
      txt += `\n\n`;
    });

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeVideo.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes.txt`;
    link.click();

    triggerSuccess('TXT');
  };

  const exportAsPDF = async () => {
    try {
      const doc = new jsPDF();
      
      // Document Header Accent
      doc.setFillColor(17, 24, 39); // Zinc-900 / Dark accent bar
      doc.rect(0, 0, 210, 8, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(17, 24, 39);
      doc.text(`NoteSync Workspace Notes`, 14, 22);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Video Lecture: ${activeVideo.title.substring(0, 70)}${activeVideo.title.length > 70 ? '...' : ''}`, 14, 29);
      doc.text(`Export Date: ${new Date().toLocaleString()}`, 14, 35);
      doc.line(14, 39, 196, 39);

      let yPos = 48;

      for (let idx = 0; idx < videoNotes.length; idx++) {
        const n = videoNotes[idx];
        
        // Calculate needed spacing. If page overflow, insert a page break
        const splitText = doc.splitTextToSize(n.content, 175);
        let neededSpace = 25 + splitText.length * 5;
        let hasImage = false;
        let imgDataUrl: string | null = null;

        if (n.screenshot) {
          imgDataUrl = await getImageDataUrl(n.screenshot.dataUrl);
          if (imgDataUrl) {
            neededSpace += 52; // height of image + margin
            hasImage = true;
          }
        }

        if (yPos + neededSpace > 280) {
          doc.addPage();
          // Draw page top accent bar
          doc.setFillColor(17, 24, 39);
          doc.rect(0, 0, 210, 8, 'F');
          yPos = 22;
        }

        // Draw note card background header container
        doc.setFillColor(248, 250, 252); // soft slate border box
        doc.rect(14, yPos, 182, 9, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        doc.text(`[${n.formattedTime}] ${n.title}`, 18, yPos + 6);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(99, 102, 241); // indigo categories
        doc.text(`Category: ${n.category}  |  Favorite: ${n.isFavorite ? 'Yes' : 'No'}`, 18, yPos + 14);

        doc.setFontSize(9.5);
        doc.setTextColor(51, 65, 85);
        doc.text(splitText, 18, yPos + 20);

        yPos += 22 + splitText.length * 5;

        if (hasImage && imgDataUrl) {
          try {
            // Draw screenshot image
            doc.addImage(imgDataUrl, 'PNG', 18, yPos, 85, 48);
            yPos += 52;
          } catch (imgError) {
            console.error('Failed to render image in jsPDF', imgError);
          }
        }

        // Separator line
        yPos += 4;
        doc.setDrawColor(241, 245, 249);
        doc.line(14, yPos, 196, yPos);
        yPos += 8;
      }

      doc.save(`${activeVideo.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes.pdf`);
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
