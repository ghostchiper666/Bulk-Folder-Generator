import React, { useState, useMemo, useRef, useEffect } from 'react';
import JSZip from 'jszip';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FolderPlus, 
  Folder, 
  FileText, 
  Download, 
  RefreshCw, 
  Copy, 
  Check, 
  Trash2, 
  FileCode, 
  Moon, 
  Sun, 
  Settings, 
  Info, 
  FileUp, 
  Sparkles, 
  FolderArchive,
  AlertCircle,
  Code,
  Briefcase,
  Megaphone,
  GraduationCap,
  Search,
  ChevronRight,
  ChevronDown,
  HardDrive,
  HelpCircle,
  Sliders,
  ListPlus,
  ShieldCheck
} from 'lucide-react';
import { FolderTree } from './components/FolderTree';
import { getHtmlTemplate } from './components/htmlTemplate';

// Define types for presets
interface Preset {
  name: string;
  description: string;
  icon: React.ReactNode;
  data: string;
}

export default function App() {
  // Theme state with local storage persistence
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme-mode');
    return saved ? saved === 'dark' : true;
  });

  // Core application state
  const [inputText, setInputText] = useState<string>(
    "Deswartha Group\nPT Chakra Global Transindo\nChakra Purnatravel\nLegalitas\nMedia\nMarketing Assets/2026\nClient_Feedback_Final\nInvoices_Pending\nProject_Phoenix_Archives"
  );
  const [allowSubfolders, setAllowSubfolders] = useState<boolean>(true);
  const [deduplicate, setDeduplicate] = useState<boolean>(true);
  const [replaceChar, setReplaceChar] = useState<string>("");
  const [zipFileName, setZipFileName] = useState<string>("folders");

  // Interaction and visual states
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [copiedCleaned, setCopiedCleaned] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Subfolder Visual Builder helper states
  const [quickParent, setQuickParent] = useState<string>("");
  const [quickChild, setQuickChild] = useState<string>("");

  // Collapsible control & guide state (closed by default for compact mobile viewport)
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);

  // Scroll synchronization for custom editor line numbers
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Sync scroll of line numbers with text editor scroll
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Sync document theme classes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme-mode', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme-mode', 'light');
    }
  }, [isDarkMode]);

  // Toast notification helper
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  // Preset structures data
  const PRESETS: Preset[] = useMemo(() => [
    {
      name: "Struktur Proyek IT",
      description: "Kerangka folder standar untuk pengembangan web dan mobile modern.",
      icon: <Code className="w-3.5 h-3.5 text-indigo-500" />,
      data: "src/components\nsrc/assets/images\nsrc/assets/styles\nsrc/hooks\nsrc/context\nsrc/utils\npublic/icons\ntests/unit\ntests/integration\ndist\ndocs/architecture"
    },
    {
      name: "Struktur Korporat",
      description: "Sistem pengarsipan keuangan, SDM, pemasaran, dan berkas legalitas.",
      icon: <Briefcase className="w-3.5 h-3.5 text-emerald-500" />,
      data: "Direksi/Keputusan\nKeuangan/Pajak/2026\nKeuangan/Invoice/Masuk\nSumber Daya Manusia/Kontrak Kerja\nPemasaran/Sosial Media/Instagram\nPemasaran/Sosial Media/TikTok\nLegalitas/Izin Usaha\nLegalitas/Akta Pendirian"
    },
    {
      name: "Akademis / Sekolah",
      description: "Penyusunan materi ajar, tugas, nilai, dan administrasi guru.",
      icon: <GraduationCap className="w-3.5 h-3.5 text-amber-500" />,
      data: "Materi Pembelajaran/Matematika\nMateri Pembelajaran/Bahasa Indonesia\nTugas Siswa/Kelas 10\nTugas Siswa/Kelas 11\nAdministrasi/Rencana Pelaksanaan Pembelajaran\nAdministrasi/Daftar Nilai"
    }
  ], []);

  // Process input text into clean paths, detecting duplicates and invalid chars
  const processed = useMemo(() => {
    const lines = inputText.split('\n');
    const cleanedList: string[] = [];
    let invalidCharsCount = 0;

    // A stack to track directories for indented layout parsing
    // Each item contains { indentLevel, segments }
    const stack: { indent: number; segments: string[] }[] = [];

    for (const line of lines) {
      const rawText = line.trim();
      if (!rawText) continue;

      // Calculate leading space/tab indentation level
      const leadingSpaces = line.match(/^[\s\t]*/)?.[0] || '';
      const indentLevel = leadingSpaces.replace(/\t/g, '    ').length;

      // Split the line by delimiters. We support both standard slash '/' and intuitive arrow '>'
      // This means "Galeri > Galeri Foto" splits to ['Galeri', 'Galeri Foto']
      const rawSegments = line.split(/[\/\\>]+/).map(s => s.trim()).filter(Boolean);
      if (rawSegments.length === 0) continue;

      // Clean individual segments, removing forbidden OS characters but keeping letters/spaces/symbols intact
      const cleanedSegments = rawSegments.map(segment => {
        let cleanSeg = segment.replace(/[:*?"<>|]/g, replaceChar);
        return cleanSeg.replace(/\s+/g, ' ').trim();
      }).filter(Boolean);

      if (cleanedSegments.length === 0) continue;

      // Count actual forbidden characters (excluding separators like '/' or '>')
      const regexForInvalid = /[:*?"|]/g;
      const matches = rawText.replace(/>/g, '').match(regexForInvalid);
      if (matches) {
        invalidCharsCount += matches.length;
      }

      if (!allowSubfolders) {
        // If nested directories are disabled, flatten into a single folder name
        const flatName = cleanedSegments.join(replaceChar || ' ');
        cleanedList.push(flatName);
      } else {
        // Nested subfolders allowed: apply indentation stack parsing or standard segments joining
        if (indentLevel === 0) {
          // Reset indentation stack on root elements
          stack.length = 0;
          stack.push({ indent: 0, segments: cleanedSegments });
          cleanedList.push(cleanedSegments.join('/'));
        } else {
          // Pop elements from stack until finding the parent level (which has strictly less indentation)
          while (stack.length > 0 && stack[stack.length - 1].indent >= indentLevel) {
            stack.pop();
          }

          const parentSegments = stack.length > 0 ? stack[stack.length - 1].segments : [];
          const fullSegments = [...parentSegments, ...cleanedSegments];

          stack.push({ indent: indentLevel, segments: fullSegments });
          cleanedList.push(fullSegments.join('/'));
        }
      }
    }

    const finalPaths: string[] = [];
    const seenPaths = new Set<string>();
    let duplicateCount = 0;

    for (const p of cleanedList) {
      if (!p) continue;
      
      if (!deduplicate) {
        finalPaths.push(p);
        continue;
      }

      if (!seenPaths.has(p)) {
        seenPaths.add(p);
        finalPaths.push(p);
      } else {
        duplicateCount++;
        let counter = 2;
        let unique = p;
        
        const idx = p.lastIndexOf('/');
        if (idx !== -1) {
          const parent = p.substring(0, idx);
          const name = p.substring(idx + 1);
          while (seenPaths.has(`${parent}/${name} (${counter})`)) {
            counter++;
          }
          unique = `${parent}/${name} (${counter})`;
        } else {
          while (seenPaths.has(`${p} (${counter})`)) {
            counter++;
          }
          unique = `${p} (${counter})`;
        }
        
        seenPaths.add(unique);
        finalPaths.push(unique);
      }
    }

    return {
      uniquePaths: finalPaths,
      duplicateCount,
      invalidCharsCount
    };
  }, [inputText, allowSubfolders, deduplicate, replaceChar]);

  // Compute lines count for line numbering sidebar
  const lineNumbers = useMemo(() => {
    const linesCount = inputText.split('\n').length;
    return Array.from({ length: Math.max(linesCount, 1) }, (_, i) => i + 1);
  }, [inputText]);

  // Extract all unique folder options for parent dropdown (including deep subfolders!)
  const allFolderOptions = useMemo(() => {
    const folders = new Set<string>();
    processed.uniquePaths.forEach(p => {
      folders.add(p);
      const parts = p.split('/');
      let current = "";
      parts.forEach(part => {
        current = current ? `${current}/${part}` : part;
        folders.add(current);
      });
    });
    return Array.from(folders).sort();
  }, [processed.uniquePaths]);

  // Filtered folder list for tree explorer query
  const filteredPathsForTree = useMemo(() => {
    if (!searchQuery.trim()) return processed.uniquePaths;
    const query = searchQuery.toLowerCase().trim();
    return processed.uniquePaths.filter(p => p.toLowerCase().includes(query));
  }, [processed.uniquePaths, searchQuery]);

  // Drag and drop event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target && typeof event.target.result === 'string') {
            setInputText(event.target.result);
            showNotification('success', `Berhasil mengimpor berkas: ${file.name}`);
          }
        };
        reader.readAsText(file);
      } else {
        showNotification('error', 'Hanya mendukung berkas berformat (.txt)');
      }
    }
  };

  const handleFileBrowse = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setInputText(event.target.result);
          showNotification('success', `Berhasil mengimpor berkas: ${file.name}`);
        }
      };
      reader.readAsText(file);
    }
  };

  // Copy cleaned directories list to clipboard
  const handleCopyList = () => {
    if (processed.uniquePaths.length === 0) {
      showNotification('info', 'Daftar folder kosong.');
      return;
    }
    const listString = processed.uniquePaths.join('\n');
    navigator.clipboard.writeText(listString)
      .then(() => {
        setCopiedCleaned(true);
        showNotification('success', 'Daftar folder bersih disalin ke clipboard!');
        setTimeout(() => setCopiedCleaned(false), 2000);
      })
      .catch(() => {
        showNotification('error', 'Gagal menyalin ke clipboard.');
      });
  };

  // Reset core states to defaults
  const handleReset = () => {
    setInputText("");
    setAllowSubfolders(true);
    setDeduplicate(true);
    setReplaceChar("");
    setZipFileName("folders");
    showNotification('info', 'Semua pengaturan dan data telah di-reset.');
  };

  // Generate ZIP file locally and start download
  const handleGenerateZip = async () => {
    if (processed.uniquePaths.length === 0) {
      showNotification('error', 'Masukkan minimal satu nama folder yang valid.');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      const zip = new JSZip();

      // Create directories inside ZIP
      processed.uniquePaths.forEach(path => {
        zip.folder(path);
      });

      const blob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
        setProgress(Math.round(metadata.percent));
      });

      const cleanZipName = zipFileName.trim() || "folders";
      const downloadName = cleanZipName.endsWith('.zip') ? cleanZipName : `${cleanZipName}.zip`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showNotification('success', `ZIP "${downloadName}" berhasil dibuat dan diunduh!`);
    } catch (err: any) {
      console.error(err);
      showNotification('error', `Gagal membuat ZIP: ${err.message || 'Terjadi galat'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Export independent single-file HTML generator
  const handleExportOfflineTool = () => {
    try {
      const htmlContent = getHtmlTemplate();
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = "bulk-folder-generator-offline.html";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showNotification('success', 'HTML mandiri offline berhasil diunduh!');
    } catch (err) {
      showNotification('error', 'Gagal mengekspor instrumen HTML.');
    }
  };

  // Apply quick structures presets
  const handleLoadPreset = (presetData: string) => {
    setInputText(presetData);
    showNotification('success', 'Preset struktur berhasil dimuat!');
  };

  // Visual subfolders appender
  const handleAddQuickSubfolder = () => {
    const trimmedChild = quickChild.trim();
    if (!trimmedChild) {
      showNotification('error', 'Isi nama subfolder terlebih dahulu.');
      return;
    }
    
    const prefix = quickParent ? `${quickParent}/` : '';
    const subfoldersToAdd = trimmedChild.split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => `${prefix}${s}`);

    if (subfoldersToAdd.length === 0) return;

    const currentLines = inputText.split('\n').map(l => l.trim()).filter(Boolean);
    const newLines = [...currentLines, ...subfoldersToAdd];
    setInputText(newLines.join('\n'));
    setQuickChild("");
    showNotification('success', `Menambahkan ${subfoldersToAdd.length} subfolder di bawah "${quickParent || 'Root'}"`);
  };

  // Quick automation packages applicator
  const handleApplyStructurePack = (packName: string) => {
    const prefix = quickParent ? `${quickParent}/` : 'ProyekBaru/';
    let paths: string[] = [];
    
    if (packName === 'dev') {
      paths = [
        `${prefix}src/components`,
        `${prefix}src/hooks`,
        `${prefix}src/utils`,
        `${prefix}public/assets`,
        `${prefix}tests`
      ];
    } else if (packName === 'finance') {
      paths = [
        `${prefix}Keuangan/Invoices`,
        `${prefix}Keuangan/Pajak`,
        `${prefix}Legalitas/Izin_Usaha`,
        `${prefix}SDM/Kontrak_Kerja`
      ];
    } else if (packName === 'marketing') {
      paths = [
        `${prefix}Pemasaran/Sosial_Media`,
        `${prefix}Pemasaran/Campaigns`,
        `${prefix}Aset_Kreatif/Desain`,
        `${prefix}Aset_Kreatif/Video`
      ];
    } else if (packName === 'academic') {
      paths = [
        `${prefix}Materi/Siswa`,
        `${prefix}Materi/Ujian`,
        `${prefix}Guru/Rencana_Ajar`,
        `${prefix}Guru/Daftar_Nilai`
      ];
    }

    const currentLines = inputText.split('\n').map(l => l.trim()).filter(Boolean);
    const newLines = [...currentLines, ...paths];
    setInputText(newLines.join('\n'));
    showNotification('success', `Menerapkan Paket Struktur otomatis di bawah "${prefix}"`);
  };

  // Drag and drop directory reordering handler
  const handleMoveFolder = (srcPath: string, destParentPath: string | null) => {
    if (!srcPath) return;

    // Safety check: Cannot drop into itself
    if (destParentPath === srcPath) {
      showNotification('error', 'Gagal: Tidak dapat memindahkan folder ke dalam dirinya sendiri.');
      return;
    }

    // Safety check: Cannot drop into descendant
    if (destParentPath && destParentPath.startsWith(srcPath + '/')) {
      showNotification('error', 'Gagal: Tidak dapat memindahkan folder ke dalam subfoldernya sendiri.');
      return;
    }

    const parts = srcPath.split('/');
    const folderName = parts[parts.length - 1];

    const lines = inputText.split('\n');
    const updatedLines: string[] = [];
    const stack: { indent: number; segments: string[] }[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const rawText = line.trim();
      if (!rawText) {
        updatedLines.push(line); // Preserve empty lines
        continue;
      }

      // Calculate leading space/tab indentation level
      const leadingSpaces = line.match(/^[\s\t]*/)?.[0] || '';
      const indentLevel = leadingSpaces.replace(/\t/g, '    ').length;

      // Split standard slash '/' and intuitive arrow '>'
      const rawSegments = line.split(/[\/\\>]+/).map(s => s.trim()).filter(Boolean);
      if (rawSegments.length === 0) {
        updatedLines.push(line);
        continue;
      }

      // Clean individual segments
      const cleanedSegments = rawSegments.map(segment => {
        let cleanSeg = segment.replace(/[:*?"<>|]/g, replaceChar);
        return cleanSeg.replace(/\s+/g, ' ').trim();
      }).filter(Boolean);

      if (cleanedSegments.length === 0) {
        updatedLines.push(line);
        continue;
      }

      let linePath = "";
      if (!allowSubfolders) {
        linePath = cleanedSegments.join(replaceChar || ' ');
      } else {
        if (indentLevel === 0) {
          stack.length = 0;
          stack.push({ indent: 0, segments: cleanedSegments });
          linePath = cleanedSegments.join('/');
        } else {
          while (stack.length > 0 && stack[stack.length - 1].indent >= indentLevel) {
            stack.pop();
          }
          const parentSegments = stack.length > 0 ? stack[stack.length - 1].segments : [];
          const fullSegments = [...parentSegments, ...cleanedSegments];
          stack.push({ indent: indentLevel, segments: fullSegments });
          linePath = fullSegments.join('/');
        }
      }

      // If the line is the folder being moved or one of its descendants
      if (linePath === srcPath || linePath.startsWith(srcPath + '/')) {
        const relativeSuffix = linePath.slice(srcPath.length);
        const newPath = destParentPath 
          ? `${destParentPath}/${folderName}${relativeSuffix}` 
          : `${folderName}${relativeSuffix}`;
        
        // Output the updated line in a clean format
        updatedLines.push(newPath);
      } else {
        updatedLines.push(line); // Leave unaffected lines completely untouched
      }
    }

    setInputText(updatedLines.join('\n'));
    
    const displayDest = destParentPath ? `ke dalam "${destParentPath}"` : 'ke tingkat luar (Root)';
    showNotification('success', `Berhasil memindahkan "${folderName}" ${displayDest}`);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 bg-[#F8FAFC] text-slate-800 dark:bg-[#090A0F] dark:text-slate-200 relative overflow-x-hidden ${isDarkMode ? 'dark' : ''}`}>
      
      {/* Background aesthetic blobs and animated floating shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-indigo-500/10 dark:bg-indigo-600/5 blur-[120px] animate-float-1" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-violet-500/10 dark:bg-violet-600/5 blur-[120px] animate-float-2" />
        
        {/* Animated moving background particles / floating shapes */}
        <div className="absolute inset-0 select-none opacity-40 dark:opacity-60">
          {/* Shape 1 */}
          <motion.div
            animate={{
              x: [0, 80, -40, 0],
              y: [0, -60, 100, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/4 left-10 w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-500/8 to-violet-500/8 dark:from-indigo-500/4 dark:to-violet-500/4 blur-xs border border-indigo-500/5"
          />
          
          {/* Shape 2 */}
          <motion.div
            animate={{
              x: [0, -100, 60, 0],
              y: [0, 120, -70, 0],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 28,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-2/3 left-[12%] w-32 h-32 rounded-full bg-gradient-to-br from-violet-500/8 to-pink-500/8 dark:from-violet-500/4 dark:to-pink-500/4 blur-sm border border-violet-500/5"
          />

          {/* Shape 3 */}
          <motion.div
            animate={{
              x: [0, 120, -60, 0],
              y: [0, -100, 50, 0],
              scale: [1, 1.12, 0.92, 1],
            }}
            transition={{
              duration: 26,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-[40%] right-[8%] w-28 h-28 rounded-[40px] bg-gradient-to-tr from-cyan-500/8 to-indigo-500/8 dark:from-cyan-500/4 dark:to-indigo-500/4 blur-xs border border-cyan-500/5"
          />

          {/* Shape 4 */}
          <motion.div
            animate={{
              x: [0, -70, 80, 0],
              y: [0, 80, -110, 0],
              rotate: [0, -180, -360],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-[12%] right-[22%] w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/8 to-blue-500/8 dark:from-indigo-500/4 dark:to-blue-500/4 blur-xs border border-indigo-500/5"
          />
          
          {/* Small twinkling light particles */}
          <motion.div
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[30%] left-[45%] w-2 h-2 rounded-full bg-indigo-400"
          />
          <motion.div
            animate={{ opacity: [0.1, 0.7, 0.1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-[70%] left-[30%] w-1.5 h-1.5 rounded-full bg-violet-400"
          />
          <motion.div
            animate={{ opacity: [0.3, 0.9, 0.3] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-[55%] right-[35%] w-2 h-2 rounded-full bg-pink-400"
          />
        </div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen w-full">

        {/* Drag and Drop Fullscreen Overlay */}
        <AnimatePresence>
          {isDragging && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="fixed inset-0 bg-indigo-600/10 dark:bg-indigo-500/5 backdrop-blur-md z-50 flex items-center justify-center border-4 border-dashed border-indigo-500/60"
            >
              <div className="bg-white/95 dark:bg-[#12141C]/95 p-10 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-800/80 text-center max-w-sm">
                <div className="w-16 h-16 bg-indigo-500/10 dark:bg-indigo-400/15 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-indigo-500/20">
                  <FileUp className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Impor Berkas</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Jatuhkan file .txt untuk membaca nama folder secara otomatis.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global sticky header with glassmorphism */}
        <header className="sm:sticky sm:top-0 relative z-40 border-b border-slate-200/60 dark:border-slate-800/80 bg-white/70 dark:bg-[#0C0E17]/70 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
            
            <div className="flex items-center gap-3.5">
              <div className="relative group flex-shrink-0">
                <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-xl blur-md opacity-45 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative w-11 h-11 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white border border-indigo-500/20">
                  <FolderPlus className="w-5.5 h-5.5 text-white animate-pulse" />
                </div>
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                  Bulk Folder Generator
                  <span className="text-[9px] tracking-widest font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-mono">v2.5</span>
                </h1>
                <p className="text-[10.5px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">Sistem Pembuat Struktur Direktori & Kompresi ZIP Offline</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button 
                onClick={handleExportOfflineTool}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 dark:bg-[#12141F] dark:hover:bg-[#1A1D2F] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-all cursor-pointer"
                title="Unduh versi HTML mandiri untuk digunakan offline sepenuhnya di masa mendatang."
                id="btn-export-offline"
              >
                <FileCode className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">Offline Tool</span>
              </button>

              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2.5 bg-white hover:bg-slate-50 dark:bg-[#12141F] dark:hover:bg-[#1A1D2F] rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                title={isDarkMode ? "Aktifkan Light Mode" : "Aktifkan Dark Mode"}
                id="btn-toggle-theme"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
              </button>
            </div>

          </div>
        </header>

        {/* Main interactive responsive dashboard body */}
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 relative z-10">
          
          {/* Left Area (Workspace & Options): spans 7 cols on large screens */}
          <section className="lg:col-span-7 flex flex-col gap-6">
            
            {/* The Code Editor container */}
            <div className="bg-white dark:bg-[#11131E] rounded-3xl border border-slate-200/80 dark:border-slate-800/90 overflow-hidden shadow-sm flex flex-col flex-grow min-h-[380px] sm:min-h-[440px] lg:min-h-[500px]">
              
              {/* Editor Header Bar */}
              <div className="px-5 pt-4 pb-3.5 bg-slate-50/80 dark:bg-[#141624] border-b border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between gap-4">
                <div className="flex items-end gap-3 flex-1 min-w-0">
                  {/* Decorative window controls */}
                  <div className="hidden sm:flex space-x-1.5 items-center mr-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                  </div>
                  
                  {/* IDE Tab Style: folders_list.txt and its count are side-by-side inside this "unclosed" tab */}
                  <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-[#11131E] border-t border-r border-l border-slate-200/80 dark:border-slate-800/90 rounded-t-xl -mb-[15px] relative z-10 shadow-xs min-w-0 max-w-[140px] xs:max-w-none">
                    <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-500 flex-shrink-0" />
                    <span className="text-[10px] sm:text-xs font-mono font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1 truncate">
                      folders_list.txt
                      <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500 fill-emerald-500/10 flex-shrink-0 animate-pulse" title="Secure Client-Side" />
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-mono font-black px-1 sm:px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/15 flex items-center justify-center min-w-[16px] sm:min-w-[18px] h-4 sm:h-4.5 flex-shrink-0">
                      {processed.uniquePaths.length}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Secure Offline Shield Badge */}
                  <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15 text-[10px] font-bold font-mono uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Secure Client-Side</span>
                  </div>

                  <button
                    onClick={() => setInputText("")}
                    className="text-xs font-bold text-rose-500 hover:text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                  >
                    Kosongkan
                  </button>
                </div>
              </div>

              {/* Editor Body */}
              <div className="flex-1 relative flex font-mono text-sm bg-transparent min-h-[300px]">
                {/* Sync Scrolling Line Numbers */}
                <div 
                  ref={lineNumbersRef}
                  className="w-10 sm:w-12 bg-slate-50/50 dark:bg-slate-900/10 text-slate-400 dark:text-slate-600 text-right pr-2.5 sm:pr-3.5 py-4 sm:py-6 select-none overflow-hidden border-r border-slate-200/50 dark:border-slate-800/40 font-mono text-[11px]"
                >
                  {lineNumbers.map((num) => (
                    <div key={num} className="h-6 leading-6">{num}</div>
                  ))}
                </div>

                {/* Main Input Textarea */}
                <textarea
                  ref={textareaRef}
                  onScroll={handleScroll}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 p-4 sm:p-6 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-700 focus:outline-none resize-none h-full leading-6 overflow-y-auto font-mono text-xs outline-none"
                  style={{ lineHeight: '1.5rem' }}
                  placeholder="Masukkan daftar nama folder di sini...&#10;Tuliskan satu folder di setiap baris.&#10;&#10;Gunakan garis miring (/) untuk subfolder:&#10;ProyekBaru/src/components&#10;ProyekBaru/docs/manual"
                />

                {/* Floating drag helper inside editor */}
                <div className="absolute bottom-4 right-4 px-3.5 py-1.5 bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/10 dark:border-indigo-500/20 rounded-xl hidden md:flex items-center gap-1.5 pointer-events-none select-none backdrop-blur-sm">
                  <FileUp className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-bold uppercase tracking-wider">Seret berkas .txt ke sini</span>
                </div>
              </div>

              {/* Drag file browser quick-loader footer */}
              <div className="p-4 bg-slate-50/50 dark:bg-[#141624]/60 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <Info className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Mendukung impor langsung atau drag-and-drop berkas teks (.txt).</span>
                </span>
                <label className="cursor-pointer font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                  Pilih Berkas Teks
                  <input 
                    type="file" 
                    accept=".txt" 
                    onChange={handleFileBrowse}
                    className="hidden" 
                  />
                </label>
              </div>

            </div>

            {/* Pusat Kontrol & Panduan Sistem (Collapsible Unified Panel) */}
            <div className="bg-white dark:bg-[#11131E] rounded-3xl border border-slate-200/80 dark:border-slate-800/90 overflow-hidden shadow-xs transition-all">
              
              {/* Header Tab / Table Title */}
              <div className="px-5 py-4 bg-slate-50/50 dark:bg-[#141624]/40 border-b border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
                    Kontrol &amp; Panduan Sistem
                  </h3>
                </div>
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/10 uppercase">
                  Pengaturan
                </span>
              </div>

              {/* Accordion 1: Panduan Cepat & Cara Mudah Buat Subfolder */}
              <div className="border-b border-slate-100 dark:border-slate-800/60">
                <button
                  onClick={() => setIsGuideOpen(!isGuideOpen)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50/40 dark:hover:bg-[#151726]/20 transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sans truncate">
                      💡 Panduan Cepat &amp; Cara Mudah Buat Subfolder
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 hidden sm:inline">
                      {isGuideOpen ? 'Sembunyikan' : 'Tampilkan'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isGuideOpen ? 'transform rotate-180' : ''}`} />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isGuideOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 space-y-4 border-t border-slate-100 dark:border-slate-800/40 bg-slate-50/20 dark:bg-[#0E101A]/20">
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                          Membuat subfolder (folder di dalam folder) sekarang jauh lebih gampang! Cukup gunakan salah satu dari <strong>3 cara super simpel</strong> di bawah ini (Klik contoh di bawah untuk mencobanya langsung):
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                          
                          {/* Method 1: Arrow */}
                          <button
                            onClick={() => {
                              setInputText("Galeri > Galeri Foto\nGaleri > Galeri Video");
                              showNotification('success', 'Menerapkan contoh: Cara Tanda Panah (>)');
                            }}
                            className="p-3.5 bg-white hover:bg-amber-50/40 dark:bg-[#121420] dark:hover:bg-amber-950/10 rounded-2xl border border-slate-200 dark:border-slate-800 text-left transition-all hover:scale-[1.01] cursor-pointer group"
                          >
                            <span className="text-[9px] font-bold text-amber-500 font-mono uppercase block mb-1.5 tracking-wider">PILIHAN 1: TANDA PANAH (&gt;)</span>
                            <span className="text-[11px] font-mono text-slate-700 dark:text-slate-300 block leading-normal group-hover:text-amber-600 dark:group-hover:text-amber-400">
                              Galeri &gt; Galeri Foto<br />
                              Galeri &gt; Galeri Video
                            </span>
                            <span className="text-[9.5px] text-slate-400 dark:text-slate-500 block mt-2 font-sans italic">
                              Sangat alami &amp; mudah dibaca
                            </span>
                          </button>

                          {/* Method 2: Indentation */}
                          <button
                            onClick={() => {
                              setInputText("Galeri\n  Galeri Foto\n  Galeri Video");
                              showNotification('success', 'Menerapkan contoh: Cara Indentasi Spasi');
                            }}
                            className="p-3.5 bg-white hover:bg-indigo-50/40 dark:bg-[#121420] dark:hover:bg-indigo-950/10 rounded-2xl border border-slate-200 dark:border-slate-800 text-left transition-all hover:scale-[1.01] cursor-pointer group"
                          >
                            <span className="text-[9px] font-bold text-indigo-500 font-mono uppercase block mb-1.5 tracking-wider">PILIHAN 2: LEWAT SPASI</span>
                            <span className="text-[11px] font-mono text-slate-700 dark:text-slate-300 block leading-normal group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                              Galeri<br />
                              &nbsp;&nbsp;Galeri Foto<br />
                              &nbsp;&nbsp;Galeri Video
                            </span>
                            <span className="text-[9.5px] text-slate-400 dark:text-slate-500 block mt-2 font-sans italic">
                              Beri 2 spasi di depan subfolder
                            </span>
                          </button>

                          {/* Method 3: Slash */}
                          <button
                            onClick={() => {
                              setInputText("Galeri/Galeri Foto\nGaleri/Galeri Video");
                              showNotification('success', 'Menerapkan contoh: Cara Garis Miring (/)');
                            }}
                            className="p-3.5 bg-white hover:bg-violet-50/40 dark:bg-[#121420] dark:hover:bg-violet-950/10 rounded-2xl border border-slate-200 dark:border-slate-800 text-left transition-all hover:scale-[1.01] cursor-pointer group"
                          >
                            <span className="text-[9px] font-bold text-violet-500 font-mono uppercase block mb-1.5 tracking-wider">PILIHAN 3: GARIS MIRING (/)</span>
                            <span className="text-[11px] font-mono text-slate-700 dark:text-slate-300 block leading-normal group-hover:text-violet-600 dark:group-hover:text-violet-400">
                              Galeri/Galeri Foto<br />
                              Galeri/Galeri Video
                            </span>
                            <span className="text-[9.5px] text-slate-400 dark:text-slate-500 block mt-2 font-sans italic">
                              Metode standar industri
                            </span>
                          </button>

                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Accordion 2: Asisten Penyusun Subfolder */}
              <div className="border-b border-slate-100 dark:border-slate-800/60">
                <button
                  onClick={() => setIsAssistantOpen(!isAssistantOpen)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50/40 dark:hover:bg-[#151726]/20 transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ListPlus className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sans truncate">
                      🛠️ Asisten Penyusun Subfolder
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 hidden sm:inline">
                      {isAssistantOpen ? 'Sembunyikan' : 'Tampilkan'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isAssistantOpen ? 'transform rotate-180' : ''}`} />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isAssistantOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 space-y-4 border-t border-slate-100 dark:border-slate-800/40 bg-slate-50/20 dark:bg-[#0E101A]/20">
                        <div className="space-y-3.5 pt-3">
                          <div>
                            <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase block font-mono mb-1.5">
                              1. Pilih Folder Induk (Opsional)
                            </label>
                            <select
                              value={quickParent}
                              onChange={(e) => setQuickParent(e.target.value)}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                            >
                              <option value="">[ Root / Tidak Ada Induk ]</option>
                              {allFolderOptions.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase block font-mono mb-1.5">
                              2. Masukkan Subfolder (Pisah Dengan Koma)
                            </label>
                            <div className="flex gap-2">
                              <input 
                                type="text"
                                value={quickChild}
                                onChange={(e) => setQuickChild(e.target.value)}
                                placeholder="Contoh: Pajak, Laporan, Invoice"
                                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
                              />
                              <button
                                onClick={handleAddQuickSubfolder}
                                className="px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                              >
                                Tambah
                              </button>
                            </div>
                          </div>

                          {/* Structure categories shortcut */}
                          <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800/40 space-y-2">
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase block font-mono">
                              Paket Struktur Instan:
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => handleApplyStructurePack('dev')}
                                className="p-2 text-[10.5px] text-left rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                <Code className="w-3.5 h-3.5 text-indigo-500" />
                                <span>IT &amp; Dev Pack</span>
                              </button>
                              <button
                                onClick={() => handleApplyStructurePack('finance')}
                                className="p-2 text-[10.5px] text-left rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Corporate Pack</span>
                              </button>
                              <button
                                onClick={() => handleApplyStructurePack('marketing')}
                                className="p-2 text-[10.5px] text-left rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                <Megaphone className="w-3.5 h-3.5 text-rose-500" />
                                <span>Creative Pack</span>
                              </button>
                              <button
                                onClick={() => handleApplyStructurePack('academic')}
                                className="p-2 text-[10.5px] text-left rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
                                <span>Education Pack</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Accordion 3: Konfigurasi ZIP & Pembersihan */}
              <div>
                <button
                  onClick={() => setIsConfigOpen(!isConfigOpen)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50/40 dark:hover:bg-[#151726]/20 transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Sliders className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sans truncate">
                      ⚙️ Konfigurasi ZIP &amp; Pembersihan
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 hidden sm:inline">
                      {isConfigOpen ? 'Sembunyikan' : 'Tampilkan'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isConfigOpen ? 'transform rotate-180' : ''}`} />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isConfigOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-6 pt-1 border-t border-slate-100 dark:border-slate-800/40 bg-slate-50/20 dark:bg-[#0E101A]/20">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3">
                          
                          {/* Structure options */}
                          <div className="space-y-4">
                            
                            {/* Allow subfolders */}
                            <div className="flex items-start gap-3">
                              <div className="pt-0.5">
                                <input 
                                  type="checkbox" 
                                  id="allowSubfoldersToggle" 
                                  checked={allowSubfolders} 
                                  onChange={() => setAllowSubfolders(!allowSubfolders)}
                                  className="w-4 h-4 accent-indigo-600 rounded border-slate-300 dark:border-slate-800 dark:bg-slate-900 focus:ring-indigo-500 cursor-pointer"
                                />
                              </div>
                              <div>
                                <label htmlFor="allowSubfoldersToggle" className="text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer flex items-center gap-1.5">
                                  Aktifkan Subfolder (/)
                                </label>
                                <span className="text-[10.5px] text-slate-400 dark:text-slate-500 block leading-normal mt-0.5">
                                  Karakter garis miring akan dikonversi menjadi folder bersarang secara bertingkat.
                                </span>
                              </div>
                            </div>

                            {/* Auto-deduplicate */}
                            <div className="flex items-start gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/40">
                              <div className="pt-0.5">
                                <input 
                                  type="checkbox" 
                                  id="deduplicateToggle" 
                                  checked={deduplicate} 
                                  onChange={() => setDeduplicate(!deduplicate)}
                                  className="w-4 h-4 accent-indigo-600 rounded border-slate-300 dark:border-slate-800 dark:bg-slate-900 focus:ring-indigo-500 cursor-pointer"
                                />
                              </div>
                              <div>
                                <label htmlFor="deduplicateToggle" className="text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer flex items-center gap-1.5">
                                  Deduplikasi Otomatis
                                </label>
                                <span className="text-[10.5px] text-slate-400 dark:text-slate-500 block leading-normal mt-0.5">
                                  Mencegah duplikasi nama folder dengan menambahkan urutan angka otomatis (misalnya `(2)`).
                                </span>
                              </div>
                            </div>

                          </div>

                          {/* Character replace and filename */}
                          <div className="space-y-4">
                            
                            {/* Invalid Character Replacement */}
                            <div className="space-y-2">
                              <label htmlFor="replaceCharInput" className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block font-mono">
                                Karakter Pengganti Tak Valid
                              </label>
                              <input 
                                type="text"
                                id="replaceCharInput"
                                maxLength={1}
                                value={replaceChar}
                                onChange={(e) => setReplaceChar(e.target.value)}
                                placeholder="Dihapus (Dibiarkan Kosong)"
                                className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
                              />
                              <span className="text-[9.5px] text-slate-400 dark:text-slate-500 block leading-tight">
                                Menggantikan karakter dilarang di Windows &amp; Linux seperti bintang, titik dua, tanda tanya, dan tanda kutip.
                              </span>
                            </div>

                            {/* ZIP Package Filename */}
                            <div className="space-y-2 pt-1">
                              <label htmlFor="zipNameInput" className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block font-mono">
                                Nama Berkas ZIP Keluar
                              </label>
                              <div className="relative">
                                <input 
                                  type="text" 
                                  id="zipNameInput"
                                  value={zipFileName}
                                  onChange={(e) => setZipFileName(e.target.value)}
                                  placeholder="folders"
                                  className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                                />
                                <span className="absolute right-3.5 top-2.5 text-slate-400 dark:text-slate-600 text-xs font-mono select-none">.zip</span>
                              </div>
                            </div>

                          </div>

                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

          </section>

          {/* Right Area (Explorer Previews & Fast Actions): spans 5 cols */}
          <section className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Action Card: Core ZIP Generator Actions */}
            <div className="bg-gradient-to-br from-indigo-900/90 to-violet-950/95 dark:from-indigo-950/90 dark:to-slate-950/95 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden border border-indigo-500/10">
              <div className="absolute top-[-30%] right-[-20%] w-[180px] h-[180px] rounded-full bg-indigo-500/20 blur-[50px] pointer-events-none" />
              
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2">
                  <FolderArchive className="w-5 h-5 text-indigo-300" />
                  <span className="text-xs font-bold uppercase tracking-widest font-mono text-indigo-200">Ekstraksi & Unduhan</span>
                </div>

                <p className="text-xs text-indigo-100/90 leading-relaxed font-sans">
                  Selesaikan perancangan struktur direktori Anda lalu ekspor menjadi folder ZIP terkompresi secara instan dalam hitungan milidetik.
                </p>

                {/* Progress bar container */}
                {isGenerating && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-[11px] font-mono font-bold text-indigo-200">
                      <span>MENGOMPRES STRUKTUR FOLDER</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-150"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Primary Action Button */}
                <button
                  disabled={processed.uniquePaths.length === 0 || isGenerating}
                  onClick={handleGenerateZip}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none text-xs uppercase tracking-wider font-mono"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Memproses {progress}%</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-white" />
                      <span>Generate Folder ZIP</span>
                    </>
                  )}
                </button>

                {/* Quick actions row */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button 
                    disabled={processed.uniquePaths.length === 0}
                    onClick={handleCopyList}
                    className="py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-30 disabled:transform-none border border-white/5"
                  >
                    {copiedCleaned ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-indigo-300" />
                        <span>Copy List</span>
                      </>
                    )}
                  </button>
                  
                  <button 
                    onClick={handleReset}
                    className="py-2 bg-rose-500/15 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer border border-rose-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Reset</span>
                  </button>
                </div>

              </div>
            </div>



            {/* Folder Explorer View */}
            <div className="flex flex-col gap-2.5">
              
              {/* Explorer Search */}
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Cari direktori folder..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-[#11131E] border border-slate-200 dark:border-slate-800/90 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-400 dark:placeholder-slate-600 shadow-sm"
                />
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    Batal
                  </button>
                )}
              </div>

              {/* Recursive Folder Tree Component */}
              <FolderTree paths={filteredPathsForTree} onMoveFolder={handleMoveFolder} />

            </div>

          </section>

        </main>

        {/* Global sticky/floating footer with statistics */}
        <footer className="bg-white dark:bg-[#0C0E17] border-t border-slate-200 dark:border-slate-800/80 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 select-none mt-12">
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-8 text-xs font-medium">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
              <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                Status: {isGenerating ? 'Mengompres' : 'Siap'}
              </span>
            </div>
            <div className="text-slate-400 dark:text-slate-500">Sesi: Aktif Lokal</div>
            <div className="text-slate-400 dark:text-slate-500">Teknologi: JSZip Kompresi Client-side</div>
          </div>
          
          <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            Copyright &copy; 2026&ndash;Present PT Deswartha Industries. Seluruh Hak Cipta Dilindungi.
          </div>

        </footer>

        {/* Toast Notification Container */}
        <AnimatePresence>
          {notification && (
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-6 right-6 z-50 pointer-events-none"
            >
              <div className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border text-xs font-semibold ${
                notification.type === 'success' 
                  ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800 dark:bg-[#122e23]/95 dark:border-emerald-950/60 dark:text-emerald-300' 
                  : notification.type === 'error'
                  ? 'bg-rose-50/95 border-rose-200 text-rose-800 dark:bg-[#2d1215]/95 dark:border-rose-950/60 dark:text-rose-300'
                  : 'bg-indigo-50/95 border-indigo-200 text-indigo-800 dark:bg-[#15122e]/95 dark:border-indigo-950/60 dark:text-indigo-300'
              }`}>
                <span className="text-sm font-bold">
                  {notification.type === 'success' ? '✓' : notification.type === 'error' ? '⚠' : 'ℹ'}
                </span>
                <span>{notification.message}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
