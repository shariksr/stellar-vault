import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Loader2, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { API } from '@/config/apis';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const resetSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetForm = z.infer<typeof resetSchema>;

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const { register, handleSubmit, formState: { errors } } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetForm) => {
    if (!token) {
      toast.error('Invalid reset link. Please request a new one.');
      return;
    }
    setLoading(true);
    try {
      await api.post(API.auth.resetPassword, { token, newPassword: data.newPassword });
      setShowSuccessDialog(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background noise-bg p-4">
        <div className="glass-card p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-4">Invalid Reset Link</h1>
          <p className="text-muted-foreground mb-6">This password reset link is invalid or has expired.</p>
          <Link
            to="/forgot-password"
            className="px-6 py-3 rounded-lg gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background noise-bg p-4 relative overflow-hidden">
      <div className="absolute top-1/4 -left-32 w-64 h-64 rounded-full bg-neon-purple/20 blur-[100px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 rounded-full bg-neon-blue/20 blur-[100px] animate-pulse-glow" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8 glow-purple">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <h1 className="text-3xl font-bold gradient-text">FTP-Server</h1>
            </Link>
            <p className="text-muted-foreground mt-2">Set your new password</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground/80 mb-1.5 block">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  {...register('newPassword')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-lg bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && <p className="text-destructive text-xs mt-1">{errors.newPassword.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  {...register('confirmPassword')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground"
                />
              </div>
              {errors.confirmPassword && <p className="text-destructive text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Reset Password
            </button>
          </form>
        </div>
      </motion.div>

      <Dialog open={showSuccessDialog} onOpenChange={() => {
        setShowSuccessDialog(false);
        navigate('/login');
      }}>
        <DialogContent className="glass-card border-border/50 sm:max-w-md text-center">
          <DialogHeader className="items-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">Password Reset Successful</DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              Your password has been reset successfully. You can now sign in with your new password.
            </DialogDescription>
          </DialogHeader>
          <button
            onClick={() => {
              setShowSuccessDialog(false);
              navigate('/login');
            }}
            className="w-full py-3 rounded-lg gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity mt-4"
          >
            Go to Login
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResetPassword;
