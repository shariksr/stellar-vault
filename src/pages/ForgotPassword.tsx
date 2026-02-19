import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { API } from '@/config/apis';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const forgotSchema = z.object({ email: z.string().email('Invalid email address') });
type ForgotForm = z.infer<typeof forgotSchema>;

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotForm>({ resolver: zodResolver(forgotSchema) });

  const onSubmit = async (data: ForgotForm) => {
    setLoading(true);
    try {
      await api.post(API.auth.forgotPassword, data);
      setShowSuccessDialog(true);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <motion.div animate={{ x: [0, 15, -10, 0] }} transition={{ duration: 18, repeat: Infinity }} className="absolute top-1/4 -left-32 w-64 h-64 rounded-full bg-google-yellow/5 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8 elevated">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <motion.h1 whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }} className="text-3xl font-bold font-display gradient-text">FTP-Server</motion.h1>
            </Link>
            <p className="text-muted-foreground mt-2">Reset your password</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}>
              <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input {...register('email')} type="email" placeholder="you@example.com" className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted-foreground" />
              </div>
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
            </motion.div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 glow-primary">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Send Reset Link
            </motion.button>
          </form>

          <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground mt-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Sign In
          </Link>
        </div>
      </motion.div>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="glass-card border-border/50 sm:max-w-md text-center">
          <DialogHeader className="items-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="w-16 h-16 rounded-full bg-google-green/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-google-green" />
            </motion.div>
            <DialogTitle className="text-xl font-bold font-display text-foreground">Check Your Email</DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">If an account exists with that email, we've sent a password reset link.</DialogDescription>
          </DialogHeader>
          <Link to="/login" className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors mt-4 block text-center">Back to Login</Link>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ForgotPassword;
