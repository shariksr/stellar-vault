import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Loader2, CheckCircle } from 'lucide-react';
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

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignupForm = z.infer<typeof signupSchema>;

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    setLoading(true);
    try {
      await api.post(API.auth.signup, data);
      setShowVerifyDialog(true);
      setTimeout(() => {
        setShowVerifyDialog(false);
        navigate('/login');
      }, 5000);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const fieldAnim = (delay: number) => ({
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { type: 'spring' as const, stiffness: 300, damping: 20, delay },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <motion.div animate={{ x: [0, 20, -15, 0] }} transition={{ duration: 20, repeat: Infinity }} className="absolute top-1/4 -right-32 w-64 h-64 rounded-full bg-google-red/5 blur-[100px]" />
      <motion.div animate={{ x: [0, -20, 15, 0] }} transition={{ duration: 24, repeat: Infinity }} className="absolute bottom-1/4 -left-32 w-64 h-64 rounded-full bg-primary/5 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14, mass: 0.8 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8 elevated">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <motion.h1 whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }} className="text-3xl font-bold font-display gradient-text">FTP-Server</motion.h1>
            </Link>
            <p className="text-muted-foreground mt-2">Create your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <motion.div {...fieldAnim(0.1)}>
              <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input {...register('name')} placeholder="John Doe" className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted-foreground" />
              </div>
              {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
            </motion.div>

            <motion.div {...fieldAnim(0.15)}>
              <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input {...register('email')} type="email" placeholder="you@example.com" className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted-foreground" />
              </div>
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
            </motion.div>

            <motion.div {...fieldAnim(0.2)}>
              <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="w-full pl-10 pr-12 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted-foreground" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 glow-primary"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Create Account
            </motion.button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">Sign In</Link>
          </p>
        </div>
      </motion.div>

      <Dialog open={showVerifyDialog} onOpenChange={(open) => { setShowVerifyDialog(open); if (!open) navigate('/login'); }}>
        <DialogContent className="glass-card border-border/50 sm:max-w-md text-center">
          <DialogHeader className="items-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-16 h-16 rounded-full bg-google-green/10 flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="h-8 w-8 text-google-green" />
            </motion.div>
            <DialogTitle className="text-xl font-bold font-display text-foreground">Check Your Email</DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              We've sent a verification link to your email address. Please click the link to verify your account before signing in.
            </DialogDescription>
          </DialogHeader>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { setShowVerifyDialog(false); navigate('/login'); }}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors mt-4"
          >
            Go to Login
          </motion.button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Signup;
