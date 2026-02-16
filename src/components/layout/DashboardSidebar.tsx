import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FolderOpen,
  Upload,
  CreditCard,
  Key,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';

const navItems = [
  { label: 'Files', path: '/dashboard', icon: FolderOpen },
  { label: 'Upload', path: '/dashboard/upload', icon: Upload },
  { label: 'Subscription', path: '/dashboard/subscription', icon: CreditCard },
  { label: 'API Key', path: '/dashboard/api-key', icon: Key },
  { label: 'Settings', path: '/dashboard/settings', icon: Settings },
];

const DashboardSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Mobile toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="fixed top-4 left-4 z-50 lg:hidden glass-card p-2"
      >
        {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
      </button>

      <aside
        className={`fixed left-0 top-0 h-screen z-50 transition-all duration-300 flex flex-col
          glass border-r border-border/50
          ${collapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'w-64 translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary shrink-0" />
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold gradient-text"
            >
              FTP-Server
            </motion.span>
          )}
        </div>

        {/* Collapse toggle (desktop) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex mx-auto mb-4 p-1.5 rounded-lg glass-hover text-muted-foreground hover:text-foreground"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </button>

        {/* Nav items */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <RouterNavLink
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth < 1024 && setCollapsed(true)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative
                  ${isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full gradient-primary"
                  />
                )}
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </RouterNavLink>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-border/50">
          <div className={`flex items-center gap-3 px-3 py-2 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-foreground">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || 'user@email.com'}</p>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
