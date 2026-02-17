import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Upload, Lock, Code, ArrowRight } from 'lucide-react';

const features = [
  { icon: Shield, title: 'Secure Storage', description: 'Military-grade encryption for all your files', color: 'bg-google-blue/10 text-google-blue' },
  { icon: Upload, title: 'Easy Uploads', description: 'Drag & drop with blazing-fast speeds', color: 'bg-google-green/10 text-google-green' },
  { icon: Lock, title: 'Access Control', description: 'Premium-tier security and permissions', color: 'bg-google-yellow/10 text-google-yellow' },
  { icon: Code, title: 'Developer API', description: 'Full REST API with personal key', color: 'bg-google-red/10 text-google-red' },
];

const gravityDrop = {
  hidden: { opacity: 0, y: -80 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 120,
      damping: 12,
      mass: 0.8,
      delay: 0.4 + i * 0.12,
    },
  }),
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Soft ambient blobs */}
      <motion.div
        animate={{ x: [0, 30, -20, 0], y: [0, -20, 15, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{ x: [0, -30, 20, 0], y: [0, 20, -15, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-google-green/5 rounded-full blur-[120px]"
      />

      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto"
      >
        <motion.div
          whileHover={{ scale: 1.03 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="flex items-center gap-2"
        >
          <Shield className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold font-display gradient-text">FTP-Server</span>
        </motion.div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign In
          </Link>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
            <Link
              to="/signup"
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors glow-primary"
            >
              Get Started
            </Link>
          </motion.div>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15, mass: 1.2 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 mb-8 text-sm text-muted-foreground"
          >
            ✨ Secure file management for teams & developers
          </motion.div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold font-display text-foreground leading-tight mb-6">
            Your files,{' '}
            <span className="gradient-text">encrypted</span>
            <br />
            and always accessible
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Upload, store, and manage your files with enterprise-grade security.
            API access included for developers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
              <Link
                to="/signup"
                className="px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors glow-primary flex items-center gap-2"
              >
                Start Free <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
              <Link
                to="/login"
                className="px-8 py-3.5 rounded-xl bg-card border border-border text-foreground font-semibold hover:bg-accent transition-colors soft-shadow"
              >
                Sign In
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features - gravity drop */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={gravityDrop}
              whileHover={{
                y: -8,
                scale: 1.02,
                transition: { type: 'spring', stiffness: 400, damping: 15 },
              }}
              whileTap={{ scale: 0.97 }}
              className="glass-card p-6 group cursor-default"
            >
              <motion.div
                whileHover={{ rotate: -10, scale: 1.2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                className={`w-12 h-12 rounded-2xl ${feature.color} flex items-center justify-center mb-4`}
              >
                <feature.icon className="h-6 w-6" />
              </motion.div>
              <h3 className="text-base font-semibold font-display text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 py-8 text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          © 2026 FTP-Server. All rights reserved.
        </p>
        <p className="text-sm text-muted-foreground">
          Developed by{' '}
          <a
            href="https://www.linkedin.com/in/muzamil-bashir-gashroo-8268b4228/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Muzamil Gashroo
          </a>
        </p>
      </footer>
    </div>
  );
};

export default Index;
