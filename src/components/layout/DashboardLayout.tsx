import { useEffect } from 'react';
import { Outlet, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardSidebar from './DashboardSidebar';
import { useAuthStore } from '@/store/auth-store';

const DashboardLayout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchProfile } = useAuthStore();

  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    if (success === 'true' || canceled === 'true') {
      const param = success === 'true' ? 'success=true' : 'canceled=true';
      navigate(`/dashboard/subscription?${param}`, { replace: true });
      if (success === 'true') fetchProfile();
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <main className="lg:ml-64 min-h-screen transition-all duration-300">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="p-4 md:p-6 lg:p-8 pt-16 lg:pt-8"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
};

export default DashboardLayout;
