import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import { API } from '@/config/apis';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('Invalid verification link.'); return; }
    const verify = async () => {
      try {
        await api.get(`${API.auth.verifyEmail}?token=${token}`);
        setStatus('success');
        setMessage('Your email has been verified successfully!');
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setStatus('error');
        setMessage(axiosErr.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
      }
    };
    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <motion.div animate={{ x: [0, 15, -10, 0] }} transition={{ duration: 18, repeat: Infinity }} className="absolute top-1/4 -left-32 w-64 h-64 rounded-full bg-google-green/5 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8 elevated text-center">
          <Link to="/" className="inline-block mb-6">
            <motion.h1 whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }} className="text-3xl font-bold font-display gradient-text">FTP-Server</motion.h1>
          </Link>

          {status === 'loading' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
              <p className="text-muted-foreground">Verifying your email...</p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="space-y-4">
              <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="w-16 h-16 rounded-full bg-google-green/10 flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-google-green" />
              </motion.div>
              <h2 className="text-xl font-bold font-display text-foreground">Email Verified!</h2>
              <p className="text-muted-foreground">{message}</p>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link to="/login" className="inline-block px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors mt-4 glow-primary">Sign In</Link>
              </motion.div>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="space-y-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }} className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <XCircle className="h-8 w-8 text-destructive" />
              </motion.div>
              <h2 className="text-xl font-bold font-display text-foreground">Verification Failed</h2>
              <p className="text-muted-foreground">{message}</p>
              <Link to="/login" className="inline-block px-6 py-3 rounded-xl glass-card text-foreground font-semibold mt-4 hover:bg-accent transition-colors">Back to Login</Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
