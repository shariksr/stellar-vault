import { motion } from 'framer-motion';
import { Check, Zap, Shield, HardDrive, Code, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import api from '@/lib/axios';
import { API } from '@/config/apis';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';

const features = [
  { icon: HardDrive, text: 'Unlimited file uploads', color: 'text-google-blue bg-google-blue/10' },
  { icon: Shield, text: 'Encrypted secure storage', color: 'text-google-green bg-google-green/10' },
  { icon: Code, text: 'Full API access & key', color: 'text-google-yellow bg-google-yellow/10' },
  { icon: Zap, text: 'Priority download speeds', color: 'text-google-red bg-google-red/10' },
];

const SubscriptionPage = () => {
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showResultDialog, setShowResultDialog] = useState<'success' | 'canceled' | null>(null);
  const { subscription, fetchProfile } = useAuthStore();
  const isPremium = subscription?.plan === 'premium' && subscription?.status === 'active';

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowResultDialog('success');
      fetchProfile();
      setSearchParams({}, { replace: true });
    } else if (searchParams.get('canceled') === 'true') {
      setShowResultDialog('canceled');
      setSearchParams({}, { replace: true });
    }
  }, []);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await api.post(API.payments.createSession, { plan: 'premium' });
      if (res.data?.url) window.location.href = res.data.url;
    } catch {
      toast.error('Failed to create checkout session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}>
        <h1 className="text-2xl md:text-3xl font-bold font-display text-foreground">Subscription</h1>
        <p className="text-muted-foreground mt-1">Manage your plan and billing</p>
      </motion.div>

      {isPremium ? (
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 150, damping: 14 }}
          className="glass-card p-8 elevated"
        >
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center"
            >
              <Zap className="h-5 w-5 text-primary-foreground" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold font-display text-foreground">Premium Plan</h2>
              <p className="text-sm text-success font-medium">Active</p>
            </div>
          </div>
          <p className="text-muted-foreground">You have full access to all premium features.</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 14, mass: 0.8 }}
          className="max-w-lg mx-auto"
        >
          <div className="glass-card p-8 elevated relative overflow-hidden">
            <div className="relative">
              <div className="text-center mb-8">
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
                  className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4"
                >
                  RECOMMENDED
                </motion.span>
                <h2 className="text-2xl font-bold font-display text-foreground mb-2">Premium Plan</h2>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold gradient-text">$9.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {features.map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 + i * 0.08 }}
                    className="flex items-center gap-3"
                  >
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: -10 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${f.color}`}
                    >
                      <f.icon className="h-4 w-4" />
                    </motion.div>
                    <span className="text-sm text-foreground">{f.text}</span>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 glow-primary"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                Upgrade Now
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      <Dialog open={showResultDialog !== null} onOpenChange={() => setShowResultDialog(null)}>
        <DialogContent className="glass-card border-border/50 sm:max-w-md text-center">
          <DialogHeader className="items-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                showResultDialog === 'success' ? 'bg-google-green/10' : 'bg-destructive/10'
              }`}
            >
              {showResultDialog === 'success' ? (
                <CheckCircle className="h-8 w-8 text-google-green" />
              ) : (
                <XCircle className="h-8 w-8 text-destructive" />
              )}
            </motion.div>
            <DialogTitle className="text-xl font-bold font-display text-foreground">
              {showResultDialog === 'success' ? 'Payment Successful!' : 'Payment Canceled'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              {showResultDialog === 'success'
                ? 'Your premium subscription is now active. Enjoy unlimited uploads, API access, and all premium features!'
                : 'Your payment was canceled. You can try again anytime.'}
            </DialogDescription>
          </DialogHeader>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowResultDialog(null)}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors mt-4"
          >
            {showResultDialog === 'success' ? 'Get Started' : 'Try Again'}
          </motion.button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionPage;
