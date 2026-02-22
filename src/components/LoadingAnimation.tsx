"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const STEPS = [
  { text: "Fetching your top songs...", icon: "notes" },
  { text: "Finding your top artists...", icon: "mic" },
  { text: "Generating your wrapped...", icon: "sparkle" },
  { text: "Adding the finishing touches...", icon: "paint" },
];

export default function LoadingAnimation() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-20">
      {/* Spinning vinyl record */}
      <motion.div
        className="relative h-40 w-40"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      >
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#1DB954] via-purple-500 to-pink-500 opacity-80" />
        {/* Grooves */}
        <div className="absolute inset-3 rounded-full border border-white/10 bg-[#191414]" />
        <div className="absolute inset-6 rounded-full border border-white/5 bg-[#191414]" />
        <div className="absolute inset-9 rounded-full border border-white/10 bg-[#191414]" />
        <div className="absolute inset-12 rounded-full border border-white/5 bg-[#191414]" />
        {/* Center */}
        <div className="absolute inset-[60px] rounded-full bg-gradient-to-br from-[#1DB954] to-emerald-600" />
        <div className="absolute inset-[72px] rounded-full bg-[#191414]" />
      </motion.div>

      {/* Step text */}
      <div className="h-8">
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-lg text-white/70"
          >
            {STEPS[step].text}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2">
        {STEPS.map((_, i) => (
          <motion.div
            key={i}
            className="h-2 w-2 rounded-full"
            animate={{
              backgroundColor: i <= step ? "#1DB954" : "rgba(255,255,255,0.2)",
              scale: i === step ? 1.3 : 1,
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}
