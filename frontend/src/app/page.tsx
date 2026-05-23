"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-purple/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-blue/20 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center z-10 max-w-4xl px-4"
      >
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 font-space">
          <span className="text-white">TweetFlow </span>
          <span className="text-gradient">AI</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto">
          The ultimate platform to automate, schedule, and unleash the power of AI on your Twitter presence.
        </p>

        <div className="flex gap-4 justify-center items-center">
          <Link href="/register">
            <Button variant="premium" size="lg" className="rounded-full px-8 py-6 text-lg">
              Get Started Free
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="rounded-full px-8 py-6 text-lg bg-white/5 border-white/10 hover:bg-white/10">
              Sign In
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Features mockup */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="mt-24 w-full max-w-6xl px-4 z-10"
      >
        <div className="glass-card w-full h-[400px] md:h-[600px] rounded-t-3xl border-b-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#050505]" />
          {/* Mockup Top Bar */}
          <div className="h-12 border-b border-white/10 flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="p-8">
            <div className="h-8 w-1/3 bg-white/5 rounded-lg mb-8 animate-pulse" />
            <div className="space-y-4">
              <div className="h-24 w-full bg-white/5 rounded-xl animate-pulse" />
              <div className="h-24 w-full bg-white/5 rounded-xl animate-pulse delay-75" />
              <div className="h-24 w-full bg-white/5 rounded-xl animate-pulse delay-150" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
