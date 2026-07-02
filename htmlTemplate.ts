export function getHtmlTemplate(): string {
  return `<!DOCTYPE html>
<html lang="id" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bulk Folder Generator - Offline Standalone Tool</title>
  
  <!-- Tailwind CSS Play CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Lucide Icons CDN -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <!-- JSZip CDN -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace'],
          }
        }
      }
    }
  </script>
  <style>
    /* Custom scrollbars */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }
    .dark ::-webkit-scrollbar-thumb {
      background: #1e293b;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
    .dark ::-webkit-scrollbar-thumb:hover {
      background: #334155;
    }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 dark:bg-[#0B0F19] dark:text-slate-100 min-h-screen flex flex-col font-sans transition-colors duration-300 relative">

  <!-- Main layout container -->
  <div class="flex flex-col min-h-screen w-full">

    <!-- Drag over overlay -->
    <div id="dragOverlay" class="fixed inset-0 bg-indigo-500/10 dark:bg-indigo-500/5 backdrop-blur-sm z-50 flex items-center justify-center border-4 border-dashed border-indigo-500/50 pointer-events-none opacity-0 transition-all duration-300">
      <div class="bg-white dark:bg-[#121826] p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 text-center max-w-sm">
        <div class="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
          <i data-lucide="file-up" class="w-6 h-6 text-indigo-600 dark:text-indigo-400"></i>
        </div>
        <h3 class="text-lg font-bold mb-1">Impor Berkas Teks</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400">Lepaskan berkas .txt Anda di sini untuk memuat daftar folder.</p>
      </div>
    </div>

    <!-- Header Banner -->
    <header class="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#111726]/80 backdrop-blur-md sticky top-0 z-40">
      <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-500/10">
            <i data-lucide="folder-git-2" class="w-5 h-5"></i>
          </div>
          <div>
            <h1 class="text-sm font-bold tracking-tight flex items-center gap-2">
              Bulk Folder Generator
              <span class="text-[9px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/25">MANDIRI</span>
            </h1>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">Alat Pembuat Struktur Folder Standalone Tanpa Internet</p>
          </div>
        </div>
        
        <!-- Mode Toggle & Theme Actions -->
        <div class="flex items-center gap-2">
          <button id="themeToggle" class="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 cursor-pointer transition-colors" title="Ubah Tema">
            <i data-lucide="sun" id="sunIcon" class="w-4 h-4 hidden text-amber-500"></i>
            <i data-lucide="moon" id="moonIcon" class="w-4 h-4 text-indigo-500"></i>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-grow max-w-6xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      <!-- LEFT COLUMN: Editor & Configuration (7 cols) -->
      <section class="lg:col-span-7 flex flex-col gap-6">
        
        <!-- Monospace Editor Panel -->
        <div class="bg-white dark:bg-[#111726] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm flex flex-col h-[480px]">
          
          <div class="px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              <i data-lucide="text-quote" class="w-4 h-4 text-indigo-500"></i>
              <span class="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">daftar_folder.txt</span>
            </div>
            
            <div class="flex items-center gap-2">
              <button id="btnSample" class="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline cursor-pointer">
                Pakai Contoh
              </button>
              <span class="text-slate-300 dark:text-slate-700">|</span>
              <button id="btnClear" class="text-xs font-medium text-rose-500 hover:text-rose-600 dark:text-rose-400 hover:underline cursor-pointer">
                Kosongkan
              </button>
            </div>
          </div>

          <!-- Code Input and Line Numbering -->
          <div class="flex-1 flex font-mono text-xs bg-transparent relative overflow-hidden">
            <div id="lineNumbers" class="w-10 bg-slate-50/50 dark:bg-slate-900/10 text-slate-400 dark:text-slate-600 text-right pr-2.5 py-4 select-none border-r border-slate-200/50 dark:border-slate-800/30 overflow-hidden font-mono text-[11px]">
              <div>1</div>
            </div>
            
            <textarea id="folderInput" class="flex-1 p-4 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none resize-none h-full leading-6 overflow-y-auto outline-none" style="line-height: 1.5rem;" placeholder="Masukkan daftar nama folder di sini...&#10;Ketik satu folder di setiap baris.&#10;&#10;Contoh untuk subfolder:&#10;ProyekA/src/components&#10;ProyekA/docs/panduan"></textarea>
          </div>

          <!-- Footer of Editor -->
          <div class="px-4 py-3 bg-slate-50/50 dark:bg-slate-900/25 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span class="flex items-center gap-1.5">
              <i data-lucide="info" class="w-3.5 h-3.5 text-indigo-500"></i>
              <span>Seret file .txt langsung ke atas layar ini.</span>
            </span>
            <label class="cursor-pointer font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Pilih Berkas
              <input type="file" id="fileUpload" accept=".txt" class="hidden">
            </label>
          </div>
        </div>

        <!-- Configurations Panel -->
        <div class="bg-white dark:bg-[#111726] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm space-y-4">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 font-mono">
            <i data-lucide="settings-2" class="w-3.5 h-3.5"></i>
            Pengaturan Struktur & Karakter
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
            <div class="space-y-3">
              <div class="flex items-start gap-2.5">
                <input type="checkbox" id="allowSubfolders" checked class="w-4 h-4 mt-0.5 accent-indigo-600 rounded border-slate-300 dark:border-slate-800 cursor-pointer">
                <div>
                  <label for="allowSubfolders" class="text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
                    Aktifkan Bersarang (/)
                  </label>
                  <p class="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
                    Karakter '/' dikonversi menjadi subfolder tingkat demi tingkat secara otomatis.
                  </p>
                </div>
              </div>
              
              <div class="flex items-start gap-2.5">
                <input type="checkbox" id="deduplicate" checked class="w-4 h-4 mt-0.5 accent-indigo-600 rounded border-slate-300 dark:border-slate-800 cursor-pointer">
                <div>
                  <label for="deduplicate" class="text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
                    Cegah Nama Duplikat
                  </label>
                  <p class="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
                    Menghindari duplikasi dengan menambahkan indeks nomor urut otomatis (misal: (2)).
                  </p>
                </div>
              </div>
            </div>

            <div class="space-y-3">
              <div class="space-y-1.5">
                <label for="replaceChar" class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block font-mono">
                  Karakter Tidak Valid
                </label>
                <select id="replaceChar" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 cursor-pointer">
                  <option value="">Hapus Karakter Ilegal</option>
                  <option value="-">Ganti dengan Strip ( - )</option>
                  <option value="_">Ganti dengan Garis Bawah ( _ )</option>
                  <option value=" ">Ganti dengan Spasi</option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label for="zipName" class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block font-mono">
                  Nama Fail ZIP Hasil
                </label>
                <div class="relative flex items-center">
                  <input type="text" id="zipName" value="folders" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500">
                  <span class="absolute right-3 text-slate-400 dark:text-slate-600 text-xs font-mono select-none">.zip</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      <!-- RIGHT COLUMN: Preview, Stats & Download (5 cols) -->
      <section class="lg:col-span-5 flex flex-col gap-6">
        
        <!-- Download and Compression Control Card -->
        <div class="bg-gradient-to-br from-slate-900 to-indigo-950 dark:from-[#111726] dark:to-[#0D1220] p-5 rounded-2xl text-white border border-indigo-500/10 shadow-md">
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <i data-lucide="archive" class="w-4 h-4"></i>
              </div>
              <div>
                <span class="text-[10px] font-bold text-indigo-300 uppercase tracking-widest font-mono block">Ekspor Struktur</span>
                <span class="text-xs text-slate-300 font-medium leading-tight">Buat arsip direktori offline sekarang</span>
              </div>
            </div>

            <!-- Total stats preview -->
            <div class="grid grid-cols-2 gap-3 py-1">
              <div class="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                <span class="text-lg font-bold text-indigo-300 font-mono block" id="statTotal">0</span>
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Folder</span>
              </div>
              <div class="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                <span class="text-lg font-bold text-amber-400 font-mono block" id="statDuplicates">0</span>
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Deduplikasi</span>
              </div>
            </div>

            <!-- Progress Loading Indicator -->
            <div id="progressCard" class="hidden space-y-1 pt-1">
              <div class="flex justify-between items-center text-[10px] font-mono text-indigo-300">
                <span>MEMPROSES STRUKTUR...</span>
                <span id="progressPercent">0%</span>
              </div>
              <div class="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div id="progressBar" class="h-full bg-indigo-500 transition-all duration-150" style="width: 0%"></div>
              </div>
            </div>

            <!-- Main Generation Button -->
            <button id="btnGenerate" disabled class="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] text-xs font-mono uppercase tracking-wider">
              <i data-lucide="download" class="w-4 h-4"></i>
              <span>Unduh Folder ZIP</span>
            </button>

            <!-- Secondary copy/reset row -->
            <div class="grid grid-cols-2 gap-2 text-xs font-medium">
              <button id="btnCopyList" class="py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                <i data-lucide="copy" class="w-3.5 h-3.5 text-indigo-300"></i>
                <span id="copyBtnText">Salin Daftar</span>
              </button>
              <button id="btnReset" class="py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                <i data-lucide="rotate-ccw" class="w-3.5 h-3.5 text-rose-400"></i>
                <span>Atur Ulang</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Live Preview & Folder Explorer -->
        <div class="bg-white dark:bg-[#111726] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm flex flex-col flex-grow min-h-[300px]">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/40 mb-3">
            <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1.5">
              <i data-lucide="folder-search" class="w-4 h-4 text-indigo-500"></i>
              Pratinjau Struktur Folder
            </h2>
            <span class="text-[10px] bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400 font-mono" id="previewCount">0 item</span>
          </div>

          <!-- Fast filter search input -->
          <div class="relative mb-3">
            <input type="text" id="searchQuery" placeholder="Cari folder..." class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 placeholder-slate-400">
            <i data-lucide="search" class="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400"></i>
          </div>

          <!-- Empty fallback -->
          <div id="treeEmpty" class="flex flex-col items-center justify-center py-10 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 text-center flex-grow">
            <i data-lucide="folder-plus" class="w-7 h-7 text-slate-300 dark:text-slate-700 mb-2"></i>
            <p class="text-[11px] text-slate-400 dark:text-slate-500 leading-normal max-w-[200px]">
              Ketik nama folder di editor kiri untuk memvisualisasikan diagram direktori Anda di sini.
            </p>
          </div>

          <!-- Active Tree visual container -->
          <div id="treeContainer" class="hidden overflow-y-auto max-h-[280px] space-y-0.5 p-1 border border-slate-100 dark:border-slate-850 rounded-xl bg-slate-50/20 dark:bg-slate-950/10 flex-grow"></div>
        </div>

      </section>

    </main>

    <!-- Simple Modern Footer -->
    <footer class="bg-white dark:bg-[#0D1220] border-t border-slate-200 dark:border-slate-800/80 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 dark:text-slate-500 select-none">
      <div class="flex items-center gap-2">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        <span class="font-bold text-slate-500 dark:text-slate-400 font-mono uppercase">Offline Terisolasi</span>
      </div>
      <span>Bulk Folder Generator • Generator Mandiri Kompatibel Multi-Platform</span>
      <span>Deswartha Industries &copy; 2026.</span>
    </footer>

    <!-- Toast Success alert bubble -->
    <div id="successAlert" class="hidden fixed bottom-6 right-6 z-50 animate-bounce">
      <div class="px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 border text-xs font-semibold bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-[#122c20] dark:border-emerald-900/50 dark:text-emerald-300">
        <span class="text-emerald-500 text-sm font-bold">✓</span>
        <span>Arsip ZIP berhasil dibuat dan diunduh!</span>
      </div>
    </div>

  </div>

  <!-- App scripts embedded directly -->
  <script>
    // --- Application State ---
    let appState = {
      inputText: "",
      allowSubfolders: true,
      deduplicate: true,
      replaceChar: "",
      zipName: "folders",
      isDarkMode: true,
      uniquePaths: [],
      duplicateCount: 0,
      invalidCharsCount: 0
    };
    
    let currentSearchQuery = "";

    // --- DOM Elements ---
    const themeToggle = document.getElementById('themeToggle');
    const sunIcon = document.getElementById('sunIcon');
    const moonIcon = document.getElementById('moonIcon');
    const folderInput = document.getElementById('folderInput');
    const lineNumbers = document.getElementById('lineNumbers');
    const allowSubfoldersCheckbox = document.getElementById('allowSubfolders');
    const deduplicateCheckbox = document.getElementById('deduplicate');
    const replaceCharSelect = document.getElementById('replaceChar');
    const zipNameInput = document.getElementById('zipName');
    
    const statTotal = document.getElementById('statTotal');
    const statDuplicates = document.getElementById('statDuplicates');
    
    const previewCount = document.getElementById('previewCount');
    const treeEmpty = document.getElementById('treeEmpty');
    const treeContainer = document.getElementById('treeContainer');
    
    const dragOverlay = document.getElementById('dragOverlay');
    const fileUpload = document.getElementById('fileUpload');
    
    const progressCard = document.getElementById('progressCard');
    const progressPercent = document.getElementById('progressPercent');
    const progressBar = document.getElementById('progressBar');
    const successAlert = document.getElementById('successAlert');
    
    const btnSample = document.getElementById('btnSample');
    const btnClear = document.getElementById('btnClear');
    const btnGenerate = document.getElementById('btnGenerate');
    const btnCopyList = document.getElementById('btnCopyList');
    const copyBtnText = document.getElementById('copyBtnText');
    const btnReset = document.getElementById('btnReset');
    const searchQueryInput = document.getElementById('searchQuery');

    // --- Sync scrolling of lines numbers ---
    function updateLineNumbers() {
      const lines = folderInput.value.split('\\n');
      const count = Math.max(lines.length, 1);
      let html = '';
      for (let i = 1; i <= count; i++) {
        html += '<div class="h-6 leading-6 text-[10px]">' + i + '</div>';
      }
      lineNumbers.innerHTML = html;
    }

    folderInput.addEventListener('scroll', () => {
      lineNumbers.scrollTop = folderInput.scrollTop;
    });

    // --- Process text inputs into folders path array ---
    function processInputs() {
      const text = folderInput.value;
      const lines = text.split('\\n');
      const cleanedList = [];
      let invalidCount = 0;
      
      const allowSub = allowSubfoldersCheckbox.checked;
      const deDup = deduplicateCheckbox.checked;
      const repChar = replaceCharSelect.value;
      
      // Indentation stack
      const stack = [];

      lines.forEach(line => {
        const rawText = line.trim();
        if (!rawText) return;

        // Calculate leading space/tab indentation level
        const leadingSpaces = line.match(/^[\\s\\t]*/)?.[0] || '';
        const indentLevel = leadingSpaces.replace(/\\t/g, '    ').length;

        // Split standard slash '/' and intuitive arrow '>'
        const rawSegments = line.split(/[\\/\\\\>]+/).map(s => s.trim()).filter(Boolean);
        if (rawSegments.length === 0) return;

        // Clean individual segments
        const cleanedSegments = rawSegments.map(segment => {
          let cleanSeg = segment.replace(/[:*?"<>|]/g, repChar);
          return cleanSeg.replace(/\\s+/g, ' ').trim();
        }).filter(Boolean);

        if (cleanedSegments.length === 0) return;

        // Count forbidden characters
        const regexForInvalid = /[:*?"|]/g;
        const matches = rawText.replace(/>/g, '').match(regexForInvalid);
        if (matches) {
          invalidCount += matches.length;
        }

        if (!allowSub) {
          const flatName = cleanedSegments.join(repChar || ' ');
          cleanedList.push(flatName);
        } else {
          if (indentLevel === 0) {
            stack.length = 0;
            stack.push({ indent: 0, segments: cleanedSegments });
            cleanedList.push(cleanedSegments.join('/'));
          } else {
            while (stack.length > 0 && stack[stack.length - 1].indent >= indentLevel) {
              stack.pop();
            }

            const parentSegments = stack.length > 0 ? stack[stack.length - 1].segments : [];
            const fullSegments = [...parentSegments, ...cleanedSegments];

            stack.push({ indent: indentLevel, segments: fullSegments });
            cleanedList.push(fullSegments.join('/'));
          }
        }
      });

      // Deduplicate mechanism
      const finalPaths = [];
      const seenPaths = new Set();
      let dupCount = 0;
      
      cleanedList.forEach(p => {
        if (!p) return;
        if (!deDup) {
          finalPaths.push(p);
          return;
        }
        
        if (!seenPaths.has(p)) {
          seenPaths.add(p);
          finalPaths.push(p);
        } else {
          dupCount++;
          let counter = 2;
          let unique = p;
          const idx = p.lastIndexOf('/');
          if (idx !== -1) {
            const parent = p.substring(0, idx);
            const name = p.substring(idx + 1);
            while (seenPaths.has(parent + '/' + name + ' (' + counter + ')')) {
              counter++;
            }
            unique = parent + '/' + name + ' (' + counter + ')';
          } else {
            while (seenPaths.has(p + ' (' + counter + ')')) {
              counter++;
            }
            unique = p + ' (' + counter + ')';
          }
          seenPaths.add(unique);
          finalPaths.push(unique);
        }
      });

      appState.uniquePaths = finalPaths;
      appState.duplicateCount = dupCount;
      appState.invalidCharsCount = invalidCount;
      
      updateUI();
    }

    // --- Render visual directory tree ---
    function buildAndRenderTree(paths) {
      if (paths.length === 0) {
        treeEmpty.classList.remove('hidden');
        treeContainer.classList.add('hidden');
        treeContainer.innerHTML = '';
        return;
      }
      
      treeEmpty.classList.add('hidden');
      treeContainer.classList.remove('hidden');
      
      const root = { name: "Root", children: {} };
      paths.forEach(p => {
        const parts = p.split('/');
        let current = root;
        parts.forEach(part => {
          if (!part) return;
          if (!current.children[part]) {
            current.children[part] = { name: part, children: {} };
          }
          current = current.children[part];
        });
      });
      
      treeContainer.innerHTML = '';
      
      function renderNode(container, name, node) {
        const itemDiv = document.createElement('div');
        itemDiv.className = "my-0.5 select-none";
        
        const row = document.createElement('div');
        row.className = "flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer text-xs font-mono transition-colors text-slate-700 dark:text-slate-300";
        
        const childKeys = Object.keys(node.children);
        const hasChildren = childKeys.length > 0;
        
        const arrowSpan = document.createElement('span');
        arrowSpan.className = "flex items-center justify-center w-3 h-3 text-slate-400";
        if (hasChildren) {
          arrowSpan.innerHTML = '<i data-lucide="chevron-down" class="w-3 h-3"></i>';
        } else {
          arrowSpan.innerHTML = '<span class="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 ml-1"></span>';
        }
        
        const folderIcon = document.createElement('i');
        folderIcon.setAttribute('data-lucide', 'folder');
        folderIcon.className = "w-3.5 h-3.5 text-indigo-500 fill-indigo-500/10";
        
        const label = document.createElement('span');
        label.className = "truncate font-medium text-[11px]";
        label.textContent = name;
        
        row.appendChild(arrowSpan);
        row.appendChild(folderIcon);
        row.appendChild(label);
        itemDiv.appendChild(row);
        
        if (hasChildren) {
          const subContainer = document.createElement('div');
          subContainer.className = "pl-3 ml-2 border-l border-slate-200 dark:border-slate-800 space-y-0.5";
          
          childKeys.sort().forEach(childName => {
            renderNode(subContainer, childName, node.children[childName]);
          });
          
          itemDiv.appendChild(subContainer);
          
          row.addEventListener('click', (e) => {
            e.stopPropagation();
            subContainer.classList.toggle('hidden');
            if (subContainer.classList.contains('hidden')) {
              arrowSpan.innerHTML = '<i data-lucide="chevron-right" class="w-3 h-3"></i>';
            } else {
              arrowSpan.innerHTML = '<i data-lucide="chevron-down" class="w-3 h-3"></i>';
            }
            lucide.createIcons();
          });
        }
        
        container.appendChild(itemDiv);
      }
      
      Object.keys(root.children).sort().forEach(topName => {
        renderNode(treeContainer, topName, root.children[topName]);
      });
      
      lucide.createIcons();
    }

    function renderFilteredTree() {
      if (!currentSearchQuery) {
        buildAndRenderTree(appState.uniquePaths);
      } else {
        const filtered = appState.uniquePaths.filter(p => p.toLowerCase().includes(currentSearchQuery));
        buildAndRenderTree(filtered);
      }
    }

    function updateUI() {
      statTotal.textContent = appState.uniquePaths.length;
      statDuplicates.textContent = appState.duplicateCount;
      previewCount.textContent = appState.uniquePaths.length + " item";
      
      btnGenerate.disabled = appState.uniquePaths.length === 0;
      updateLineNumbers();
      renderFilteredTree();
    }

    // --- Interactive Handlers ---
    folderInput.addEventListener('input', () => {
      appState.inputText = folderInput.value;
      processInputs();
    });
    
    allowSubfoldersCheckbox.addEventListener('change', processInputs);
    deduplicateCheckbox.addEventListener('change', processInputs);
    replaceCharSelect.addEventListener('change', processInputs);
    
    searchQueryInput.addEventListener('input', () => {
      currentSearchQuery = searchQueryInput.value.toLowerCase().trim();
      renderFilteredTree();
    });

    // Theme toggler
    themeToggle.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      const isDark = document.documentElement.classList.contains('dark');
      if (isDark) {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
      } else {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
      }
    });

    // Load sample data
    btnSample.addEventListener('click', () => {
      folderInput.value = "Deswartha Group\\nPT Chakra Global Transindo\\nChakra Purnatravel\\nLegalitas\\nLegalitas\\nLegalitas/Media\\nLegalitas/Media\\nProyek Konstruksi/Gambar Teknik\\nProyek Konstruksi/Finansial/Invoice\\nPengarsipan/2026/Pajak\\nLaporan Akhir Tahun";
      folderInput.dispatchEvent(new Event('input'));
    });

    // Clear content
    btnClear.addEventListener('click', () => {
      folderInput.value = "";
      folderInput.dispatchEvent(new Event('input'));
    });

    // Reset settings
    btnReset.addEventListener('click', () => {
      folderInput.value = "";
      allowSubfoldersCheckbox.checked = true;
      deduplicateCheckbox.checked = true;
      replaceCharSelect.value = "";
      zipNameInput.value = "folders";
      searchQueryInput.value = "";
      currentSearchQuery = "";
      folderInput.dispatchEvent(new Event('input'));
    });

    // Copy to clipboard
    btnCopyList.addEventListener('click', () => {
      if (appState.uniquePaths.length === 0) return;
      const cleanString = appState.uniquePaths.join('\\n');
      navigator.clipboard.writeText(cleanString).then(() => {
        copyBtnText.textContent = "Tersalin!";
        setTimeout(() => {
          copyBtnText.textContent = "Salin Daftar";
        }, 1500);
      });
    });

    // Drag and Drop
    window.addEventListener('dragover', (e) => {
      e.preventDefault();
      dragOverlay.classList.remove('opacity-0', 'pointer-events-none');
    });

    dragOverlay.addEventListener('dragleave', () => {
      dragOverlay.classList.add('opacity-0', 'pointer-events-none');
    });

    window.addEventListener('drop', (e) => {
      e.preventDefault();
      dragOverlay.classList.add('opacity-0', 'pointer-events-none');
      
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            folderInput.value = event.target.result;
            folderInput.dispatchEvent(new Event('input'));
          };
          reader.readAsText(file);
        }
      }
    });

    // File Browser
    fileUpload.addEventListener('change', (e) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          folderInput.value = event.target.result;
          folderInput.dispatchEvent(new Event('input'));
        };
        reader.readAsText(file);
      }
    });

    // Offline JSZip Generation
    btnGenerate.addEventListener('click', async () => {
      if (appState.uniquePaths.length === 0) return;
      
      btnGenerate.disabled = true;
      progressCard.classList.remove('hidden');
      successAlert.classList.add('hidden');
      
      try {
        const zip = new JSZip();
        
        appState.uniquePaths.forEach(path => {
          zip.folder(path);
        });
        
        const blob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
          const percent = Math.round(metadata.percent);
          progressPercent.textContent = percent + '%';
          progressBar.style.width = percent + '%';
        });
        
        const customZipName = zipNameInput.value.trim() || 'folders';
        const finalZipName = customZipName.endsWith('.zip') ? customZipName : customZipName + '.zip';
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = finalZipName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        successAlert.classList.remove('hidden');
        progressCard.classList.add('hidden');
        setTimeout(() => {
          successAlert.classList.add('hidden');
        }, 4000);
        
      } catch (err) {
        console.error("ZIP Error", err);
        alert("Gagal membuat arsip ZIP: " + err.message);
        progressCard.classList.add('hidden');
      } finally {
        btnGenerate.disabled = false;
      }
    });

    // --- Bootstrapping ---
    lucide.createIcons();
    processInputs();
  </script>
</body>
</html>`;
}
