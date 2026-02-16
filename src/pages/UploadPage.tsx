import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, Cloud, FileUp, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '@/config/apis';
import { Link } from 'react-router-dom';

const UploadPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const { subscription } = useAuthStore();

  const isPremium = subscription?.plan === 'premium' && subscription?.status === 'active';

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) {
      setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (!isPremium || !subscription?.key) {
      toast.error('Premium subscription required');
      return;
    }

    setUploading(true);
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        await axios.post(API.files.upload, formData, {
          headers: {
            'x-api-key': subscription.key,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (e) => {
            const pct = Math.round((e.loaded * 100) / (e.total || 1));
            setUploadProgress((prev) => ({ ...prev, [file.name]: pct }));
          },
        });
        toast.success(`${file.name} uploaded`);
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    setUploading(false);
    setFiles([]);
    setUploadProgress({});
  };

  if (!isPremium) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Upload Files</h1>
          <p className="text-muted-foreground mt-1">Upload your files securely to FTP-Server</p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 text-center gradient-border"
        >
          <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6 glow-purple">
            <Cloud className="h-10 w-10 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-3">Premium Feature</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Upgrade to Premium to upload files, access API keys, and unlock unlimited storage.
          </p>
          <Link
            to="/dashboard/subscription"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity glow-purple"
          >
            Upgrade to Premium
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Upload Files</h1>
        <p className="text-muted-foreground mt-1">Drag & drop or browse to upload</p>
      </div>

      {/* Drop zone */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`glass-card p-12 text-center border-2 border-dashed transition-all duration-300 cursor-pointer
          ${dragActive ? 'border-primary bg-primary/5 glow-purple' : 'border-border hover:border-primary/50'}
        `}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <motion.div
          animate={dragActive ? { scale: 1.05, y: -5 } : { scale: 1, y: 0 }}
          className="inline-block"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <FileUp className="h-8 w-8 text-primary" />
          </div>
        </motion.div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {dragActive ? 'Drop files here' : 'Drag & drop files'}
        </h3>
        <p className="text-muted-foreground text-sm">or click to browse from your device</p>
      </motion.div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">{files.length} file(s) selected</h3>
            <button
              onClick={uploadFiles}
              disabled={uploading}
              className="px-5 py-2.5 rounded-lg gradient-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Upload All
            </button>
          </div>

          {files.map((file, i) => {
            const progress = uploadProgress[file.name];
            return (
              <motion.div
                key={`${file.name}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-4 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileUp className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  {progress !== undefined && (
                    <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full gradient-primary rounded-full"
                      />
                    </div>
                  )}
                </div>
                {progress === 100 ? (
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                ) : (
                  <button
                    onClick={() => removeFile(i)}
                    className="p-1.5 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UploadPage;
