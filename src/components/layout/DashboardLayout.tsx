import { useEffect } from 'react';
import { Outlet, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardSidebar from './DashboardSidebar';
import { useAuthStore } from '@/store/auth-store';

const DashboardLayout = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchProfile } = useAuthStore();

  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    if (success === 'true' || canceled === 'true') {
      // Clear params and redirect to subscription page with result
      const param = success === 'true' ? 'success=true' : 'canceled=true';
      navigate(`/dashboard/subscription?${param}`, { replace: true });
      if (success === 'true') fetchProfile();
    }
  }, []);

  return (
    <div className="min-h-screen bg-background noise-bg">
      <DashboardSidebar />
      <main className="lg:ml-64 min-h-screen transition-all duration-300">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 md:p-6 lg:p-8 pt-16 lg:pt-8"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
};

export default DashboardLayout;
