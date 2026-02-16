import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Grid3X3,
  List,
  Search,
  Filter,
  FileText,
  Image,
  Video,
  File,
  Download,
  Trash2,
  MoreHorizontal,
  HardDrive,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import type { FileFilter, ViewMode, FileItem } from '@/types';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { API } from '@/config/apis';
import { useQuery } from '@tanstack/react-query';

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

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FilesPage = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filter, setFilter] = useState<FileFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { subscription } = useAuthStore();

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['files'],
    queryFn: async () => {
      const res = await api.get(API.files.list);
      return res.data as FileItem[];
    },
  });

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.originalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.name?.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === 'all') return matchesSearch;
    if (filter === 'images') return matchesSearch && file.type?.startsWith('image/');
    if (filter === 'videos') return matchesSearch && file.type?.startsWith('video/');
    if (filter === 'documents') return matchesSearch && (file.type?.includes('pdf') || file.type?.includes('document') || file.type?.includes('text'));
    return matchesSearch && !file.type?.startsWith('image/') && !file.type?.startsWith('video/') && !file.type?.includes('pdf');
  });

  const handleDownload = async (fileId: string) => {
    if (subscription?.plan !== 'premium' || subscription?.status !== 'active') {
      toast.error('Upgrade to Premium to download files');
      return;
    }
    try {
      const res = await api.get(API.files.download(fileId), {
        headers: { 'x-api-key': subscription.key },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'download';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch {
      toast.error('Download failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Files</h1>
        <p className="text-muted-foreground mt-1">Manage and organize your files</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="glass-card flex p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${filter === opt.value
                ? 'gradient-primary text-primary-foreground glow-purple'
                : 'glass-card text-muted-foreground hover:text-foreground glass-hover'
              }
            `}
          >
            <opt.icon className="h-4 w-4" />
            {opt.label}
          </button>
        ))}
      </div>

      {/* File Grid/List */}
      {isLoading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="h-32 bg-secondary/50 rounded-lg mb-3" />
              <div className="h-4 bg-secondary/50 rounded w-3/4 mb-2" />
              <div className="h-3 bg-secondary/50 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredFiles.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 text-center"
        >
          <HardDrive className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No files found</h3>
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`glass-card group cursor-pointer glass-hover
                    ${viewMode === 'grid' ? 'p-4' : 'p-4 flex items-center gap-4'}
                  `}
                >
                  {viewMode === 'grid' ? (
                    <>
                      <div className="h-32 bg-secondary/30 rounded-lg flex items-center justify-center mb-3 group-hover:bg-secondary/50 transition-colors">
                        {file.type?.startsWith('image/') && file.url ? (
                          <img src={file.url} alt={file.originalName} className="h-full w-full object-cover rounded-lg" loading="lazy" />
                        ) : (
                          <Icon className="h-12 w-12 text-muted-foreground/50" />
                        )}
                      </div>
                      <p className="text-sm font-medium text-foreground truncate">{file.originalName || file.name}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">{formatSize(file.size)}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDownload(file._id); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-primary/20 text-primary"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-lg bg-secondary/30 flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{file.originalName || file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatSize(file.size)} · {new Date(file.createdAt).toLocaleDateString()}</p>
                      </div>
                      <button
                        onClick={() => handleDownload(file._id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-md hover:bg-primary/20 text-primary"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default FilesPage;
