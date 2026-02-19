import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth-store';
import { User, Mail, Calendar, Shield, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { API } from '@/config/apis';
import { validatePassword } from '@/lib/password-validation';

const cardDrop = (delay: number) => ({
  initial: { opacity: 0, y: -40 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { type: 'spring' as const, stiffness: 150, damping: 14, delay },
});

const SettingsPage = () => {
  const { user, subscription } = useAuthStore();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changing, setChanging] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const pwError = validatePassword(newPassword);
    if (pwError) { toast.error(pwError); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setChanging(true);
    try {
      await api.post(API.auth.changePassword, { oldPassword, newPassword });
      toast.success('Password changed successfully');
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || 'Failed to change password');
    } finally {
      setChanging(false);
    }
  };

  const infoCards = [
    { icon: User, label: 'Name', value: user?.name || '—', color: 'text-google-blue' },
    { icon: Mail, label: 'Email', value: user?.email || '—', color: 'text-google-red' },
    { icon: Shield, label: 'Plan', value: subscription?.plan || 'Free', color: 'text-google-green' },
    { icon: Calendar, label: 'Joined', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—', color: 'text-google-yellow' },
  ];

  return (
    <div className="space-y-6">
      <motion.div {...cardDrop(0)}>
        <h1 className="text-2xl md:text-3xl font-bold font-display text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account</p>
      </motion.div>

      {/* Profile Section */}
      <motion.div {...cardDrop(0.05)} className="glass-card p-6 space-y-5">
        <h2 className="text-lg font-semibold font-display text-foreground">Profile</h2>

        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.1, rotate: -5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 12 }}
            className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold"
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </motion.div>
          <div>
            <p className="text-lg font-semibold text-foreground">{user?.name || 'User'}</p>
            <p className="text-sm text-muted-foreground">{user?.email || 'user@email.com'}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {infoCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 + i * 0.06 }}
              whileHover={{ y: -3, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
              className="glass-card p-4 flex items-center gap-3"
            >
              <card.icon className={`h-5 w-5 ${card.color}`} />
              <div>
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <p className="text-sm font-medium text-foreground capitalize">{card.value}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Change Password */}
      <motion.div {...cardDrop(0.1)} className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold font-display text-foreground">Change Password</h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Current Password</label>
            <div className="relative">
              <input type={showOld ? 'text' : 'password'} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted-foreground text-sm pr-10" placeholder="Enter current password" />
              <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">New Password</label>
            <div className="relative">
              <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted-foreground text-sm pr-10" placeholder="Enter new password" />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted-foreground text-sm" placeholder="Confirm new password" />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={changing}
            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 glow-primary"
          >
            {changing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            Change Password
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
