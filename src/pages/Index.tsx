import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Upload, Lock, Code, ArrowRight } from 'lucide-react';

const features = [
{
  icon: Shield,
  title: 'Secure Storage',
  description: 'Military-grade encryption for all your files'
},
{
  icon: Upload,
  title: 'Easy Uploads',
  description: 'Drag & drop with blazing-fast speeds'
},
{
  icon: Lock,
  title: 'Access Control',
  description: 'Premium-tier security and permissions'
},
{
  icon: Code,
  title: 'Developer API',
  description: 'Full REST API with personal key'
}];


const Index = () => {
  return (
    <div className="min-h-screen bg-background noise-bg relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-cyan/5 rounded-full blur-[150px]" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Shield className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold gradient-text">FTP-Server</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">

            Sign In
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">

            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card mb-8 text-sm text-muted-foreground">
            
            Secure file management for teams & developers
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-foreground leading-tight mb-6">
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
            <Link
              to="/signup"
              className="px-8 py-3.5 rounded-lg gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity glow-purple flex items-center gap-2">

              Start Free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-3.5 rounded-lg glass-card glass-hover text-foreground font-semibold">

              Sign In
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, i) =>
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
            className="glass-card p-6 group hover:glow-purple transition-all duration-500">

              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          )}
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
    </div>);

};

export default Index;