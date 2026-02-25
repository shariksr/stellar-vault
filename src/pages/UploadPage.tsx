import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Cloud, FileUp, X, CheckCircle2, Loader2, KeyRound, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '@/config/apis';
import { Link } from 'react-router-dom';

const TOKEN_TTL = 300; // 5 minutes in seconds

type UploadStep = 'select' | 'token' | 'uploading' | 'done';

const UploadPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [step, setStep] = useState<UploadStep>('select');
  const [uploadToken, setUploadToken] = useState<string | null>(null);
  const [generatingToken, setGeneratingToken] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(TOKEN_TTL);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { subscription } = useAuthStore();

  const isPremium = subscription?.plan === 'premium' && subscription?.status === 'active';

  // Countdown timer for token expiry
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSecondsLeft(TOKEN_TTL);
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

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

  const generateToken = async (retryCount = 0): Promise<string | null> => {
    if (!subscription?.key) return null;
    try {
      const { data } = await axios.post(API.files.generateUploadToken, {}, {
        headers: { 'x-api-key': subscription.key },
      });
      return data.uploadToken;
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 400 && retryCount < 3) {
        // Active token exists — wait and retry
        toast.info('Waiting for existing upload token to expire…');
        await new Promise((r) => setTimeout(r, 3000));
        return generateToken(retryCount + 1);
      }
      throw err;
    }
  };

  const handlePrepareUpload = async () => {
    if (!isPremium || !subscription?.key) {
      toast.error('Premium subscription required');
      return;
    }
    setGeneratingToken(true);
    try {
      const token = await generateToken();
      if (token) {
        setUploadToken(token);
        setStep('token');
        startTimer();
        toast.success('Upload token ready — you can now upload');
      }
    } catch {
      toast.error('Failed to generate upload token');
    } finally {
      setGeneratingToken(false);
    }
  };

  // Auto-regenerate token when countdown hits 0
  useEffect(() => {
    if (step === 'token' && secondsLeft === 0) {
      toast.info('Token expired — generating a new one…');
      handlePrepareUpload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, step]);

  const uploadFiles = async () => {
    if (!uploadToken) {
      toast.error('No upload token available');
      return;
    }
    setStep('uploading');
    stopTimer();

    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }

    try {
      await axios.post(API.files.upload, formData, {
        headers: { 'x-upload-token': uploadToken, 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded * 100) / (e.total || 1));
          // Apply overall progress to all files proportionally
          setUploadProgress(
            files.reduce((acc, file) => ({ ...acc, [file.name]: pct }), {} as Record<string, number>)
          );
        },
      });
      setStep('done');
      toast.success(`${files.length} file(s) uploaded successfully`);
    } catch {
      toast.error('Upload failed');
      setStep('token'); // Go back to token step so they can retry
    }
  };

  const resetUpload = () => {
    setFiles([]);
    setUploadProgress({});
    setStep('select');
    setUploadToken(null);
    stopTimer();
    setSecondsLeft(TOKEN_TTL);
  };

  if (!isPremium) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display text-foreground">Upload Files</h1>
          <p className="text-muted-foreground mt-1">Upload your files securely to FTP-Server</p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 14 }}
          className="glass-card p-12 text-center elevated"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6"
          >
            <Cloud className="h-10 w-10 text-primary" />
          </motion.div>
          <h2 className="text-xl font-bold font-display text-foreground mb-3">Premium Feature</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Upgrade to Premium to upload files, access API keys, and unlock unlimited storage.
          </p>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link
              to="/dashboard/subscription"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors glow-primary"
            >
              Upgrade to Premium
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-display text-foreground">Upload Files</h1>
        <p className="text-muted-foreground mt-1">
          {step === 'select' && 'Drag & drop or browse to upload'}
          {step === 'token' && 'Token ready — click Upload to start'}
          {step === 'uploading' && 'Uploading your files…'}
          {step === 'done' && 'All files uploaded successfully'}
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3">
        {[
          { key: 'select', label: 'Select Files', icon: FileUp },
          { key: 'token', label: 'Prepare', icon: KeyRound },
          { key: 'uploading', label: 'Upload', icon: Upload },
          { key: 'done', label: 'Done', icon: CheckCircle2 },
        ].map((s, i, arr) => {
          const stepOrder = ['select', 'token', 'uploading', 'done'];
          const currentIdx = stepOrder.indexOf(step);
          const thisIdx = stepOrder.indexOf(s.key);
          const isActive = thisIdx <= currentIdx;
          const Icon = s.icon;
          return (
            <div key={s.key} className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < arr.length - 1 && (
                <div className={`w-6 h-0.5 rounded-full transition-colors ${thisIdx < currentIdx ? 'bg-primary' : 'bg-border'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Drop zone — only in select step */}
      {step === 'select' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`glass-card p-12 text-center border-2 border-dashed transition-all duration-300 cursor-pointer
            ${dragActive ? 'border-primary bg-primary/5 glow-primary' : 'border-border hover:border-primary/50'}
          `}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input id="file-input" type="file" multiple onChange={handleFileSelect} className="hidden" />
          <motion.div
            animate={dragActive ? { scale: 1.1, y: -10, rotate: -5 } : { scale: 1, y: 0, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 12 }}
            className="inline-block"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <FileUp className="h-8 w-8 text-primary" />
            </div>
          </motion.div>
          <h3 className="text-lg font-semibold font-display text-foreground mb-2">
            {dragActive ? 'Drop files here' : 'Drag & drop files'}
          </h3>
          <p className="text-muted-foreground text-sm">or click to browse from your device</p>
        </motion.div>
      )}

      {/* Token ready state */}
      {step === 'token' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-lg font-semibold font-display text-foreground mb-1">Upload Token Ready</h3>
          <p className="text-muted-foreground text-sm mb-5">Your secure upload session is active. Click below to start uploading.</p>
          <div className="flex justify-center gap-3">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={uploadFiles}
              disabled={generatingToken}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 glow-primary"
            >
              <Upload className="h-4 w-4" />
              Upload All
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={resetUpload}
              className="px-5 py-2.5 rounded-xl bg-muted text-muted-foreground font-semibold text-sm hover:bg-muted/80 transition-colors"
            >
              Cancel
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Done state */}
      {step === 'done' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle2 className="h-7 w-7 text-primary" />
          </motion.div>
          <h3 className="text-lg font-semibold font-display text-foreground mb-1">Upload Complete</h3>
          <p className="text-muted-foreground text-sm mb-5">{files.length} file(s) uploaded successfully.</p>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={resetUpload}
            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors glow-primary"
          >
            Upload More
          </motion.button>
        </motion.div>
      )}

      {/* File list */}
      <AnimatePresence>
        {files.length > 0 && step !== 'done' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">{files.length} file(s) selected</h3>
              {step === 'select' && (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handlePrepareUpload}
                  disabled={generatingToken}
                  className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 glow-primary"
                >
                  {generatingToken ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                  Prepare Upload
                </motion.button>
              )}
            </div>

            {files.map((file, i) => {
              const progress = uploadProgress[file.name];
              return (
                <motion.div
                  key={`${file.name}-${i}`}
                  initial={{ opacity: 0, y: -30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: i * 0.05 }}
                  className="glass-card p-4 flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <FileUp className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    {progress !== undefined && (
                      <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                          className="h-full bg-primary rounded-full"
                        />
                      </div>
                    )}
                  </div>
                  {progress === 100 ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
                      <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                    </motion.div>
                  ) : step === 'select' ? (
                    <motion.button
                      whileHover={{ scale: 1.2, rotate: 90 }}
                      whileTap={{ scale: 0.8 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                      onClick={() => removeFile(i)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </motion.button>
                  ) : null}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadPage;
