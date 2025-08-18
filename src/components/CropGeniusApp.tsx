/**
 * 🌟 CROPGENIUS - FUTURISTIC AGRICULTURAL INTELLIGENCE PLATFORM
 * =================================================================
 * The most visually stunning agricultural interface ever created!
 * Designed to make Apple jealous and 100M African farmers feel like gods!
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Satellite, 
  Cloud, 
  TrendingUp, 
  Camera, 
  Brain,
  Shield,
  Sprout,
  Users,
  DollarSign,
  Star
} from 'lucide-react';

// Futuristic color palette that screams premium
const colors = {
  primary: '#00D4FF',      // Electric cyan
  secondary: '#FF6B35',    // Vibrant orange
  accent: '#7B68EE',       // Electric purple
  success: '#00FF88',      // Neon green
  warning: '#FFD700',      // Golden yellow
  danger: '#FF3366',       // Electric red
  dark: '#0A0A0B',         // Deep black
  darkCard: '#1A1A1B',     // Card background
  glass: 'rgba(255, 255, 255, 0.05)', // Glass morphism
  glow: '0 0 30px rgba(0, 212, 255, 0.5)', // Neon glow
};

export const CropGeniusApp = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 mx-auto mb-4"
          >
            <Brain className="w-full h-full text-green-400" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2">CROPGenius</h1>
          <p className="text-green-200">Initializing AI Farm Intelligence...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900">
      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-md border-b border-green-500/30">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-8 h-8 text-green-400" />
            <h1 className="text-2xl font-bold text-white">CROPGenius</h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-green-200 hover:text-white transition-colors">Dashboard</a>
            <a href="#" className="text-green-200 hover:text-white transition-colors">AI Analysis</a>
            <a href="#" className="text-green-200 hover:text-white transition-colors">Market</a>
            <a href="#" className="text-green-200 hover:text-white transition-colors">Weather</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20">
        <div className="container mx-auto px-6 text-center">
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-6xl font-bold text-white mb-6"
          >
            AI-Powered Farming
            <span className="block text-green-400">Revolution</span>
          </motion.h1>
          
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-green-100 mb-12 max-w-3xl mx-auto"
          >
            Transform your farm with AI intelligence. Get real-time insights, 
            disease detection, weather predictions, and market intelligence 
            that increases yields by 40% and profits by 60%.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16"
          >
            <StatsCard icon={Users} value="50K+" label="Active Farmers" />
            <StatsCard icon={Sprout} value="40%" label="Yield Increase" />
            <StatsCard icon={DollarSign} value="60%" label="Profit Boost" />
            <StatsCard icon={Star} value="4.9/5" label="User Rating" />
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            AI Features That Change Everything
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Brain}
              title="AI Crop Scanner"
              description="Instant disease detection and treatment recommendations using computer vision"
              glow="green"
            />
            <FeatureCard
              icon={Cloud}
              title="Smart Weather Engine"
              description="Hyperlocal weather predictions with farming action recommendations"
              glow="blue"
            />
            <FeatureCard
              icon={TrendingUp}
              title="Market Intelligence"
              description="Real-time crop pricing and AI-driven sales strategy optimization"
              glow="yellow"
            />
            <FeatureCard
              icon={Shield}
              title="Risk Assessment"
              description="AI analyzes threats and provides preventive action plans"
              glow="red"
            />
            <FeatureCard
              icon={Camera}
              title="Smart Planning"
              description="AI generates daily task lists based on your farm conditions"
              glow="purple"
            />
            <FeatureCard
              icon={Satellite}
              title="Satellite Monitoring"
              description="Track field health with real-time satellite imagery"
              glow="green"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black/30">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Join the AI Farming Revolution
          </h2>
          <p className="text-xl text-green-100 mb-12 max-w-2xl mx-auto">
            Start your free trial today and see why farmers across Africa 
            trust CROPGenius to maximize their harvests.
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-12 rounded-xl text-lg transition-colors"
          >
            Start Free Trial
          </motion.button>
        </div>
      </section>
    </div>
  );
};

const StatsCard = ({ icon: Icon, value, label }: { icon: any, value: string, label: string }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-black/30 backdrop-blur-md rounded-xl p-6 border border-green-500/30"
  >
    <Icon className="w-8 h-8 text-green-400 mx-auto mb-4" />
    <div className="text-3xl font-bold text-white mb-2">{value}</div>
    <div className="text-green-200">{label}</div>
  </motion.div>
);

const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  glow 
}: { 
  icon: any, 
  title: string, 
  description: string, 
  glow: string 
}) => {
  const glowColors = {
    green: 'shadow-green-500/20 border-green-500/30',
    blue: 'shadow-blue-500/20 border-blue-500/30',
    yellow: 'shadow-yellow-500/20 border-yellow-500/30',
    red: 'shadow-red-500/20 border-red-500/30',
    purple: 'shadow-purple-500/20 border-purple-500/30'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className={`bg-black/40 backdrop-blur-md rounded-xl p-6 border ${glowColors[glow]} shadow-xl hover:shadow-2xl transition-all duration-300`}
    >
      <Icon className="w-12 h-12 text-green-400 mb-4" />
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-green-100">{description}</p>
    </motion.div>
  );
};