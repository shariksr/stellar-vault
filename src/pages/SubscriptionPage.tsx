import { motion } from 'framer-motion';
import { Check, Zap, Shield, HardDrive, Code, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import api from '@/lib/axios';
import { API } from '@/config/apis';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const features = [
  { icon: HardDrive, text: 'Unlimited file uploads' },
  { icon: Shield, text: 'Encrypted secure storage' },
  { icon: Code, text: 'Full API access & key' },
  { icon: Zap, text: 'Priority download speeds' },
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
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch {
      toast.error('Failed to create checkout session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Subscription</h1>
        <p className="text-muted-foreground mt-1">Manage your plan and billing</p>
      </div>

      {isPremium ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 gradient-border glow-purple"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Premium Plan</h2>
              <p className="text-sm text-success">Active</p>
            </div>
          </div>
          <p className="text-muted-foreground">You have full access to all premium features.</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto"
        >
          <div className="glass-card p-8 gradient-border relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-neon-purple/20 rounded-full blur-[80px]" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-neon-blue/20 rounded-full blur-[80px]" />

            <div className="relative">
              <div className="text-center mb-8">
                <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
                  RECOMMENDED
                </span>
                <h2 className="text-2xl font-bold text-foreground mb-2">Premium Plan</h2>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold gradient-text">$9.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {features.map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <f.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{f.text}</span>
                  </motion.div>
                ))}
              </div>

              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full py-3.5 rounded-lg gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 glow-purple"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                Upgrade Now
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Payment result dialog */}
      <Dialog open={showResultDialog !== null} onOpenChange={() => setShowResultDialog(null)}>
        <DialogContent className="glass-card border-border/50 sm:max-w-md text-center">
          <DialogHeader className="items-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              showResultDialog === 'success' ? 'bg-primary/10' : 'bg-destructive/10'
            }`}>
              {showResultDialog === 'success' ? (
                <CheckCircle className="h-8 w-8 text-primary" />
              ) : (
                <XCircle className="h-8 w-8 text-destructive" />
              )}
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">
              {showResultDialog === 'success' ? 'Payment Successful!' : 'Payment Canceled'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              {showResultDialog === 'success'
                ? 'Your premium subscription is now active. Enjoy unlimited uploads, API access, and all premium features!'
                : 'Your payment was canceled. You can try again anytime.'}
            </DialogDescription>
          </DialogHeader>
          <button
            onClick={() => setShowResultDialog(null)}
            className="w-full py-3 rounded-lg gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity mt-4"
          >
            {showResultDialog === 'success' ? 'Get Started' : 'Try Again'}
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionPage;
