import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth-store';
import { User, Mail, Calendar, Shield, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { API } from '@/config/apis';

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
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setChanging(true);
    try {
      await api.post(API.auth.changePassword, {
        oldPassword,
        newPassword,
      });
      toast.success('Password changed successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account</p>
      </div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 space-y-5"
      >
        <h2 className="text-lg font-semibold text-foreground">Profile</h2>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">{user?.name || 'User'}</p>
            <p className="text-sm text-muted-foreground">{user?.email || 'user@email.com'}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="glass-card p-4 flex items-center gap-3">
            <User className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="text-sm font-medium text-foreground">{user?.name || '—'}</p>
            </div>
          </div>
          <div className="glass-card p-4 flex items-center gap-3">
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium text-foreground">{user?.email || '—'}</p>
            </div>
          </div>
          <div className="glass-card p-4 flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Plan</p>
              <p className="text-sm font-medium text-foreground capitalize">{subscription?.plan || 'Free'}</p>
            </div>
          </div>
          <div className="glass-card p-4 flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Joined</p>
              <p className="text-sm font-medium text-foreground">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Change Password Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 space-y-5"
      >
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Change Password</h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Current Password</label>
            <div className="relative">
              <input
                type={showOld ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground text-sm pr-10"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground text-sm pr-10"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground text-sm"
              placeholder="Confirm new password"
            />
          </div>

          <button
            type="submit"
            disabled={changing}
            className="px-6 py-2.5 rounded-lg gradient-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {changing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            Change Password
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
