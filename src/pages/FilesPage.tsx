import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Grid3X3, List, Search, FileText, Image, Video, File,
  Download, HardDrive, Loader2, Pencil, Trash2, Check, X,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import type { FileFilter, ViewMode, FileItem } from '@/types';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '@/config/apis';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const filterOptions: { label: string; value: FileFilter; icon: React.ElementType }[] = [
  { label: 'All', value: 'all', icon: HardDrive },
  { label: 'Images', value: 'images', icon: Image },
  { label: 'Videos', value: 'videos', icon: Video },
  { label: 'Documents', value: 'documents', icon: FileText },
  { label: 'Others', value: 'others', icon: File },
];

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return Image;
  if (type.startsWith('video/')) return Video;
  if (type.includes('pdf') || type.includes('document') || type.includes('text')) return FileText;
  return File;
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const formatSize = (bytes?: number) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

const getDisplayName = (file: FileItem) => file.displayName || file.filename;

const gravityItem = {
  hidden: { opacity: 0, y: -60 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 130,
      damping: 12,
      mass: 0.6,
      delay: i * 0.04,
    },
  }),
};

const isPremium = (subscription: { plan: string; status: string } | null) =>
  subscription?.plan === 'premium' && subscription?.status === 'active';

const FilesPage = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filter, setFilter] = useState<FileFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameLoading, setRenameLoading] = useState(false);
  const [deleteConfirmFile, setDeleteConfirmFile] = useState<FileItem | null>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const { subscription } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['files'],
    queryFn: async () => {
      const res = await api.get(API.files.list);
      return res.data as FileItem[];
    },
  });

  const filteredFiles = files.filter((file) => {
    const name = getDisplayName(file).toLowerCase();
    const matchesSearch = name.includes(searchQuery.toLowerCase());
    if (filter === 'all') return matchesSearch;
    if (filter === 'images') return matchesSearch && file.type?.startsWith('image/');
    if (filter === 'videos') return matchesSearch && file.type?.startsWith('video/');
    if (filter === 'documents') return matchesSearch && (file.type?.includes('pdf') || file.type?.includes('document') || file.type?.includes('text'));
    return matchesSearch && !file.type?.startsWith('image/') && !file.type?.startsWith('video/') && !file.type?.includes('pdf');
  });

  const checkPremium = () => {
    if (!isPremium(subscription)) {
      toast.error('Upgrade to Premium to use this feature');
      return false;
    }
    return true;
  };

  const handleDownload = async (file: FileItem) => {
    if (!checkPremium()) return;
    setDownloadingId(file.fileId);
    try {
      const res = await axios.get(API.files.download(file.fileId), {
        headers: { 'x-api-key': subscription!.key },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = getDisplayName(file);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`${getDisplayName(file)} downloaded`);
    } catch {
      toast.error('Download failed');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (file: FileItem) => {
    if (!checkPremium()) return;
    setDeletingId(file.fileId);
    try {
      await axios.delete(API.files.delete(file.fileId), {
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().token}`,
          'x-api-key': subscription!.key,
        },
      });
      queryClient.setQueryData(['files'], (old: FileItem[] | undefined) =>
        old ? old.filter(f => f.fileId !== file.fileId) : []
      );
      toast.success(`${getDisplayName(file)} deleted`);
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeletingId(null);
      setDeleteConfirmFile(null);
    }
  };

  const handleRename = async (file: FileItem) => {
    if (!checkPremium()) return;
    const trimmed = renameValue.trim();
    if (!trimmed || trimmed === getDisplayName(file)) {
      setRenamingId(null);
      return;
    }
    setRenameLoading(true);
    try {
      await axios.patch(API.files.rename(file.fileId), { newName: trimmed }, {
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().token}`,
          'x-api-key': subscription!.key,
        },
      });
      queryClient.setQueryData(['files'], (old: FileItem[] | undefined) =>
        old ? old.map(f => f.fileId === file.fileId ? { ...f, displayName: trimmed } : f) : []
      );
      toast.success('File renamed');
    } catch {
      toast.error('Rename failed');
    } finally {
      setRenameLoading(false);
      setRenamingId(null);
    }
  };

  const startRename = (file: FileItem) => {
    if (!checkPremium()) return;
    setRenamingId(file.fileId);
    setRenameValue(getDisplayName(file));
  };

  const renderFileName = (file: FileItem) => {
    if (renamingId === file.fileId) {
      return (
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <input
            ref={renameInputRef}
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleRename(file);
              if (e.key === 'Escape') setRenamingId(null);
            }}
            className="text-sm font-medium text-foreground bg-secondary/50 border border-border rounded-lg px-2 py-1 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 w-full min-w-0"
            disabled={renameLoading}
          />
          <motion.button whileTap={{ scale: 0.85 }} onClick={() => handleRename(file)} disabled={renameLoading} className="p-1 rounded-lg hover:bg-accent text-primary shrink-0">
            {renameLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          </motion.button>
          <motion.button whileTap={{ scale: 0.85 }} onClick={() => setRenamingId(null)} className="p-1 rounded-lg hover:bg-accent text-muted-foreground shrink-0">
            <X className="h-3.5 w-3.5" />
          </motion.button>
        </div>
      );
    }
    return <p className="text-sm font-medium text-foreground truncate">{getDisplayName(file)}</p>;
  };

  const renderActions = (file: FileItem, showAlways = false) => {
    const isDownloading = downloadingId === file.fileId;
    const isDeleting = deletingId === file.fileId;
    const visibilityClass = showAlways ? '' : 'opacity-0 group-hover:opacity-100';
    return (
      <div className={`flex items-center gap-0.5 transition-opacity ${visibilityClass}`} onClick={e => e.stopPropagation()}>
        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }} onClick={() => startRename(file)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground" title="Rename">
          <Pencil className="h-3.5 w-3.5" />
        </motion.button>
        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }} onClick={() => handleDownload(file)} disabled={isDownloading} className="p-1.5 rounded-lg hover:bg-accent text-primary disabled:opacity-50" title="Download">
          {isDownloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
        </motion.button>
        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }} onClick={() => setDeleteConfirmFile(file)} disabled={isDeleting} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive disabled:opacity-50" title="Delete">
          {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
        </motion.button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}>
        <h1 className="text-2xl md:text-3xl font-bold font-display text-foreground">My Files</h1>
        <p className="text-muted-foreground mt-1">Manage and organize your files</p>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.05 }}
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
      >
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted-foreground text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="glass-card flex p-1">
            {(['grid', 'list'] as const).map((mode) => (
              <motion.button
                key={mode}
                whileTap={{ scale: 0.9 }}
                onClick={() => setViewMode(mode)}
                className={`p-2 rounded-lg transition-all ${viewMode === mode ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {mode === 'grid' ? <Grid3X3 className="h-4 w-4" /> : <List className="h-4 w-4" />}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {filterOptions.map((opt, i) => (
          <motion.button
            key={opt.value}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 + i * 0.04 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(opt.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
              ${filter === opt.value
                ? 'bg-primary text-primary-foreground glow-primary'
                : 'glass-card text-muted-foreground hover:text-foreground'
              }
            `}
          >
            <opt.icon className="h-4 w-4" />
            {opt.label}
          </motion.button>
        ))}
      </div>

      {/* File Grid/List */}
      {isLoading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="h-32 bg-secondary rounded-xl mb-3" />
              <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
              <div className="h-3 bg-secondary rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredFiles.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="glass-card p-12 text-center"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <HardDrive className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-lg font-semibold font-display text-foreground mb-2">No files found</h3>
          <p className="text-muted-foreground text-sm">Upload some files to get started</p>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-2'
            }
          >
            {filteredFiles.map((file, idx) => {
              const Icon = getFileIcon(file.type);
              return (
                <motion.div
                  key={file._id}
                  custom={idx}
                  initial="hidden"
                  animate="visible"
                  variants={gravityItem}
                  whileHover={{ y: -4, scale: 1.01, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
                  className={`glass-card group cursor-pointer
                    ${viewMode === 'grid' ? 'p-4' : 'p-4 flex items-center gap-4'}
                  `}
                >
                  {viewMode === 'grid' ? (
                    <>
                      <div className="h-32 bg-secondary/50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-secondary transition-colors relative">
                        <Icon className="h-12 w-12 text-muted-foreground/40" />
                        <div className="absolute top-2 right-2">
                          {renderActions(file)}
                        </div>
                      </div>
                      {renderFileName(file)}
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-xs text-muted-foreground">{formatDate(file.createdAt)}</span>
                        {file.size != null && (
                          <span className="text-xs text-muted-foreground">{formatSize(file.size)}</span>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {renderFileName(file)}
                        <p className="text-xs text-muted-foreground">
                          {file.folder} · {formatDate(file.createdAt)}
                          {file.size != null && ` · ${formatSize(file.size)}`}
                        </p>
                      </div>
                      {renderActions(file)}
                    </>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmFile} onOpenChange={(open) => !open && setDeleteConfirmFile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete file?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-medium text-foreground">"{deleteConfirmFile ? getDisplayName(deleteConfirmFile) : ''}"</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmFile && handleDelete(deleteConfirmFile)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingId ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FilesPage;
