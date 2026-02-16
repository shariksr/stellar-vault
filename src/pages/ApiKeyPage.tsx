import { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Eye, EyeOff, Copy, AlertTriangle, Shield } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { API } from '@/config/apis';

const ApiKeyPage = () => {
  const [revealed, setRevealed] = useState(false);
  const { subscription } = useAuthStore();
  const isPremium = subscription?.plan === 'premium' && subscription?.status === 'active';
  const apiKey = subscription?.key;

  const copyKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      toast.success('API Key copied to clipboard');
    }
  };

  if (!isPremium) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">API Key</h1>
          <p className="text-muted-foreground mt-1">Access your personal API key</p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 text-center gradient-border"
        >
          <Key className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-3">Premium Required</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            API keys are available exclusively for Premium subscribers.
          </p>
          <Link
            to="/dashboard/subscription"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
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
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">API Key</h1>
        <p className="text-muted-foreground mt-1">Your personal API key for file operations</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 gradient-border"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
            <Key className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Your API Key</h2>
            <p className="text-sm text-muted-foreground">Use this key in the <code className="text-primary">x-api-key</code> header</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 bg-secondary/50 border border-border rounded-lg px-4 py-3 font-mono text-sm text-foreground overflow-hidden">
            {revealed ? apiKey : '••••••••••••••••••••••••••••••••'}
          </div>
          <button
            onClick={() => setRevealed(!revealed)}
            className="p-3 rounded-lg glass-card glass-hover text-muted-foreground hover:text-foreground transition-colors"
          >
            {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <button
            onClick={copyKey}
            className="p-3 rounded-lg glass-card glass-hover text-muted-foreground hover:text-primary transition-colors"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      {/* Warning */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-5 border-l-4 border-warning"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Keep this key secret</h3>
            <p className="text-sm text-muted-foreground">
              This API key grants full access to your files. Never share it publicly or commit it to version control.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Usage example */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          Usage Example
        </h3>
        <pre className="bg-background/50 rounded-lg p-4 text-xs text-muted-foreground overflow-x-auto">
{`curl -X POST ${API.files?.upload || 'https://api.vaultdrop.io/v1/files/uploads'} \\
  -H "x-api-key: YOUR_API_KEY" \\
  -F "file=@photo.jpg"`}
        </pre>
      </motion.div>
    </div>
  );
};

export default ApiKeyPage;
