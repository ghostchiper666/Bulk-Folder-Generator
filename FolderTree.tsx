import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Folder, 
  ChevronRight, 
  ChevronDown, 
  GripVertical, 
  MoveRight, 
  Plus, 
  HelpCircle,
  FolderOpen,
  ArrowUpRight
} from 'lucide-react';

export interface TreeNode {
  name: string;
  children: { [key: string]: TreeNode };
}

export function buildTree(paths: string[]): TreeNode {
  const root: TreeNode = { name: "Root", children: {} };

  for (const p of paths) {
    const parts = p.split('/');
    let current = root;
    for (const part of parts) {
      if (!part) continue;
      if (!current.children[part]) {
        current.children[part] = { name: part, children: {} };
      }
      current = current.children[part];
    }
  }

  return root;
}

interface FolderNodeProps {
  name: string;
  node: TreeNode;
  currentPath: string;
  draggedPath: string | null;
  setDraggedPath: (path: string | null) => void;
  onMoveFolder?: (srcPath: string, destParentPath: string | null) => void;
}

const FolderNode: React.FC<FolderNodeProps> = ({ 
  name, 
  node, 
  currentPath, 
  draggedPath,
  setDraggedPath,
  onMoveFolder 
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);

  const childrenKeys = Object.keys(node.children);
  const hasChildren = childrenKeys.length > 0;

  // Check if this folder is currently being dragged
  const isBeingDragged = draggedPath === currentPath;

  // Determine if this folder is a valid drop target
  const isValidDropTarget = useMemo(() => {
    if (!draggedPath) return false;
    if (draggedPath === currentPath) return false;
    // Cannot drop into a direct subfolder of the dragged folder
    if (currentPath.startsWith(draggedPath + '/')) return false;
    return true;
  }, [draggedPath, currentPath]);

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    setDraggedPath(currentPath);
    e.dataTransfer.setData("text/plain", currentPath);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.stopPropagation();
    setDraggedPath(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isValidDropTarget) {
      setIsDragOver(true);
      e.dataTransfer.dropEffect = "move";
    } else {
      e.dataTransfer.dropEffect = "none";
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (isValidDropTarget && onMoveFolder && draggedPath) {
      onMoveFolder(draggedPath, currentPath);
      setDraggedPath(null);
    }
  };

  return (
    <div 
      className={`select-none my-2.5 transition-all duration-300 ${
        isBeingDragged ? 'opacity-30 scale-[0.97] border border-dashed border-indigo-500/60 rounded-xl bg-indigo-50/5 dark:bg-indigo-950/10 shadow-inner' : ''
      }`}
    >
      <div 
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`group flex items-center justify-between py-2.5 px-3.5 rounded-xl border transition-all duration-300 cursor-grab active:cursor-grabbing ${
          isDragOver 
            ? 'bg-indigo-100/90 border-indigo-500 scale-[1.02] shadow-lg shadow-indigo-500/10 dark:bg-indigo-950/60 dark:border-indigo-400' 
            : draggedPath && isValidDropTarget
            ? 'bg-indigo-50/10 border-dashed border-indigo-300 dark:bg-indigo-950/10 dark:border-indigo-800/40 animate-pulse'
            : 'bg-white hover:bg-slate-50 dark:bg-[#121422] dark:hover:bg-[#181A2D] border-slate-200/60 dark:border-slate-800/80 shadow-2xs hover:shadow-xs'
        }`}
      >
        <div className={`flex items-center gap-3 flex-1 min-w-0 ${draggedPath ? 'pointer-events-none' : ''}`}>
          {/* Drag handle */}
          <span className="text-slate-300 dark:text-slate-700 group-hover:text-slate-400 dark:group-hover:text-slate-500 transition-colors cursor-grab">
            <GripVertical className="w-3.5 h-3.5" />
          </span>

          {/* Toggle Button */}
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="flex items-center justify-center w-5 h-5 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800/60 text-slate-400 dark:text-slate-500 transition-colors"
          >
            {hasChildren ? (
              isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            )}
          </button>
          
          {/* Icon */}
          <div className="flex items-center justify-center flex-shrink-0">
            {isOpen && hasChildren ? (
              <FolderOpen className="w-4.5 h-4.5 text-amber-500 dark:text-amber-400 fill-amber-500/15" />
            ) : (
              <Folder className="w-4.5 h-4.5 text-amber-500 dark:text-amber-400 fill-amber-500/15" />
            )}
          </div>

          {/* Folder name */}
          <span className="truncate font-mono text-[12px] font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {name}
          </span>
        </div>

        {/* Drop zone visual helper */}
        {isDragOver && (
          <motion.div 
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[9.5px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-mono flex items-center gap-1.5"
          >
            <span>Pindahkan Ke Sini</span>
            <MoveRight className="w-3 h-3 animate-bounce" />
          </motion.div>
        )}
      </div>
      
      {/* Nested children container */}
      <AnimatePresence initial={false}>
        {hasChildren && isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="pl-5 ml-6 border-l border-slate-200/80 dark:border-slate-800/80 space-y-2 mt-1.5 overflow-hidden"
          >
            {childrenKeys.sort().map((childName) => (
              <FolderNode
                key={childName}
                name={childName}
                node={node.children[childName]}
                currentPath={`${currentPath}/${childName}`}
                draggedPath={draggedPath}
                setDraggedPath={setDraggedPath}
                onMoveFolder={onMoveFolder}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface FolderTreeProps {
  paths: string[];
  onMoveFolder?: (srcPath: string, destParentPath: string | null) => void;
}

export const FolderTree: React.FC<FolderTreeProps> = ({ paths, onMoveFolder }) => {
  const treeRoot = React.useMemo(() => buildTree(paths), [paths]);
  const topFolders = Object.keys(treeRoot.children);
  const [draggedPath, setDraggedPath] = useState<string | null>(null);
  const [isRootDragOver, setIsRootDragOver] = useState(false);

  // Drag over the general tree container to move folder to root level
  const handleRootDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedPath && draggedPath.includes('/')) {
      setIsRootDragOver(true);
    }
  };

  const handleRootDragLeave = () => {
    setIsRootDragOver(false);
  };

  const handleRootDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsRootDragOver(false);
    if (draggedPath && onMoveFolder) {
      onMoveFolder(draggedPath, null);
      setDraggedPath(null);
    }
  };

  if (paths.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8 border border-dashed border-slate-200 dark:border-slate-800/80 rounded-3xl bg-white/40 dark:bg-[#11131E]/20 text-center shadow-inner relative overflow-hidden min-h-[300px]">
        <div className="relative mb-6">
          <div className="absolute -inset-2 bg-amber-500/10 rounded-full blur-xl animate-pulse" />
          <div className="relative w-16 h-16 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10 rounded-2xl flex items-center justify-center text-amber-500 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40 shadow-sm">
            <FolderOpen className="w-7 h-7" />
          </div>
        </div>
        <h5 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-2 tracking-tight">Visualizer Struktur Kosong</h5>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium font-sans max-w-[320px] leading-relaxed">
          Tuliskan daftar nama folder Anda di editor sebelah kiri. Gunakan garis miring (<code className="font-mono text-indigo-500 font-bold">/</code>), tanda panah (<code className="font-mono text-indigo-500 font-bold">&gt;</code>), atau spasi untuk menyusun tingkatan subfolder secara instan.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Drag & Drop Hint */}
      <div className="flex items-center gap-2 px-1 text-[11px] text-slate-500 dark:text-slate-400 font-sans">
        <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
        <span><strong>Tips:</strong> Klik &amp; seret folder mana saja ke folder induk lain untuk memindahkannya.</span>
      </div>

      {/* Main tree list and drop container */}
      <div 
        onDragOver={handleRootDragOver}
        onDragLeave={handleRootDragLeave}
        onDrop={handleRootDrop}
        className={`border border-slate-200/80 dark:border-slate-800/90 rounded-3xl bg-slate-50/40 dark:bg-[#11131E]/40 p-4 sm:p-5 overflow-y-auto max-h-[460px] shadow-xs relative transition-all duration-300 ${
          isRootDragOver 
            ? 'bg-indigo-500/10 border-indigo-500 dark:border-indigo-400 border-2 border-dashed scale-[1.01]' 
            : ''
        }`}
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200/50 dark:border-slate-800/40">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
              Live Interactive Folder Tree
            </span>
          </div>
          <span className="text-[10px] font-mono bg-slate-200/50 dark:bg-slate-800 px-2 py-0.5 rounded-full font-bold text-slate-600 dark:text-slate-400">
            {paths.length} item
          </span>
        </div>

        <div className="space-y-1">
          {topFolders.sort().map((folderName) => (
            <FolderNode
              key={folderName}
              name={folderName}
              node={treeRoot.children[folderName]}
              currentPath={folderName}
              draggedPath={draggedPath}
              setDraggedPath={setDraggedPath}
              onMoveFolder={onMoveFolder}
            />
          ))}
        </div>

        {/* Floating helper for dropping on Root level */}
        {draggedPath && draggedPath.includes('/') && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-3.5 rounded-2xl border-2 border-dashed text-center flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              isRootDragOver 
                ? 'bg-indigo-100/60 border-indigo-500 dark:bg-indigo-950/40 dark:border-indigo-400' 
                : 'bg-white/80 border-slate-300 dark:bg-slate-900/60 dark:border-slate-800 text-slate-500 dark:text-slate-400'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider">
              Lepaskan di sini untuk memindahkan ke Root (tingkat luar)
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
};
