import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth-store';
import { User, Mail, Calendar, Shield } from 'lucide-react';

const SettingsPage = () => {
  const { user, subscription } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account</p>
      </div>

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
    </div>
  );
};

export default SettingsPage;
