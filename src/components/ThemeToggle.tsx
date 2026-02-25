import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

interface ThemeToggleProps {
  collapsed?: boolean;
}

const ThemeToggle = ({ collapsed = false }: ThemeToggleProps) => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors ${collapsed ? 'justify-center' : ''}`}
      aria-label="Toggle theme"
    >
      <motion.div
        whileHover={{ scale: 1.15, rotate: 15 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      >
        {isDark ? <Sun className="h-5 w-5 shrink-0" /> : <Moon className="h-5 w-5 shrink-0" />}
      </motion.div>
      {!collapsed && <span className="text-sm font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
    </motion.button>
  );
};

export default ThemeToggle;
