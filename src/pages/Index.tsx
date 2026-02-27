import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  Upload,
  Lock,
  Code,
  ArrowRight,
  QrCode,
  Key,
  FileStack,
  CreditCard,
  Server,
  Layers,
  Terminal,
  Zap,
} from 'lucide-react';
import EliteCloudNetwork from '@/components/EliteCloudNetwork';
import bgSound from '@/assets/interstellar-sound.mp3';
import { Volume2, VolumeX } from 'lucide-react';


const features = [
  { icon: Lock, title: 'Encrypted Storage', description: 'End-to-end secure file handling with controlled disk access and access validation.', color: 'bg-google-blue/10 text-google-blue' },
  { icon: Key, title: 'Signed Download URLs', description: 'Generate temporary, expiring links secured via HMAC signatures.', color: 'bg-google-green/10 text-google-green' },
  { icon: Shield, title: 'Upload Token System', description: 'Time-limited upload permissions for secure client-side uploads.', color: 'bg-google-yellow/10 text-google-yellow' },
  { icon: Code, title: 'Developer SDK', description: 'Full REST API + SDK for seamless backend integration.', color: 'bg-google-red/10 text-google-red' },
  { icon: FileStack, title: 'Multi-File Support', description: 'Images, videos, PDFs, documents — with smart classification.', color: 'bg-google-blue/10 text-google-blue' },
  { icon: CreditCard, title: 'Subscription & API Keys', description: 'Premium-gated access with per-user API authentication.', color: 'bg-google-green/10 text-google-green' },
  { icon: QrCode, title: 'QR-Based Sharing', description: 'Instant secure file sharing via temporary QR links.', color: 'bg-google-yellow/10 text-google-yellow' },
];

const builtFor = [
  { icon: Server, label: 'SaaS Platforms' },
  { icon: Terminal, label: 'Developer Tools' },
  { icon: Layers, label: 'Internal File Systems' },
  { icon: Shield, label: 'Secure Asset Management' },
  { icon: Zap, label: 'Expiring File Links' },
  { icon: Upload, label: 'Temporary File Access' },
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
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(bgSound);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const toggleSound = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
    setIsMuted(!isMuted);
  };

  return (
    <EliteCloudNetwork>
    <div className="min-h-screen relative text-white">
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
          <Shield className="h-7 w-7 text-blue-400" />
          <span className="text-xl font-bold font-display text-blue-300">FTP-Server</span>
        </motion.div>
      <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleSound}
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg text-blue-200/60 hover:text-white transition-colors hover:bg-white/10"
            aria-label={isMuted ? 'Unmute background music' : 'Mute background music'}
          >
            {isMuted ? <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" /> : <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />}
          </button>
          <Link
            to="/login"
            className="hidden sm:inline-block px-4 py-2 text-sm font-medium text-blue-200/60 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
            <Link
              to="/signup"
              className="px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-semibold hover:bg-primary/90 transition-colors glow-primary whitespace-nowrap"
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
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 mb-8 text-sm text-blue-200/60"
          >
            🔒 Developer-first secure file infrastructure
          </motion.div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold font-mono text-white leading-tight mb-4 sm:mb-6 tracking-tight" style={{ textShadow: '0 0 40px rgba(150,200,255,0.3)' }}>
            Secure file{' '}
            <span className="text-blue-400">infrastructure</span>
            <br />
            for modern apps
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-blue-200/50 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
            Upload, manage, and distribute files with expiring signed URLs, API key auth, QR-based sharing, and enterprise-grade security.{' '}
            <span className="text-white font-medium">Built for developers. Ready for production.</span>
          </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
              <Link
                to="/signup"
                className="px-6 py-2.5 sm:px-8 sm:py-3.5 rounded-xl bg-primary text-primary-foreground text-sm sm:text-base font-semibold hover:bg-primary/90 transition-colors glow-primary flex items-center gap-2"
              >
                Start Building <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
              <Link
                to="/login"
                className="px-6 py-2.5 sm:px-8 sm:py-3.5 rounded-xl bg-white/10 border border-white/20 text-sm sm:text-base text-white font-semibold hover:bg-white/15 transition-colors backdrop-blur-sm"
              >
                Sign In
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features - gravity drop */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mb-3">Infrastructure-Grade Capabilities</h2>
          <p className="text-blue-200/50 max-w-xl mx-auto">Everything you need to build secure file workflows — from upload tokens to expiring signed URLs.</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 group cursor-default"
            >
              <motion.div
                whileHover={{ rotate: -10, scale: 1.2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                className={`w-12 h-12 rounded-2xl ${feature.color} flex items-center justify-center mb-4`}
              >
                <feature.icon className="h-6 w-6" />
              </motion.div>
              <h3 className="text-base font-semibold font-display text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-blue-200/50">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Built For Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mb-3">Built For</h2>
          <p className="text-blue-200/50">Teams and products that demand secure, scalable file infrastructure.</p>
        </motion.div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {builtFor.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -60, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                type: 'spring',
                stiffness: 120,
                damping: 12,
                mass: 0.8,
                delay: i * 0.1,
              }}
              whileHover={{ y: -6, scale: 1.06, rotate: -2 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-2 text-center cursor-default"
            >
              <motion.div
                initial={{ rotate: -20 }}
                whileInView={{ rotate: 0 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.3 + i * 0.1 }}
              >
                <item.icon className="h-5 w-5 text-blue-400" />
              </motion.div>
              <span className="text-xs font-medium text-white">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 text-center space-y-2">
        <p className="text-sm text-blue-200/40">
          © 2026 FTP-Server. All rights reserved.
        </p>
        <p className="text-sm text-blue-200/40">
          Developed by{' '}
          <a
            href="https://www.linkedin.com/in/muzamil-bashir-gashroo-8268b4228/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            Muzamil Gashroo
          </a>
        </p>
      </footer>
    </div>
    </EliteCloudNetwork>
  );
};

export default Index;
