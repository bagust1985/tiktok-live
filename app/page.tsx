"use client";

import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-black overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-6 px-10 py-12 rounded-2xl
          bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl w-[360px]"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Logo variant="default" className="mb-10" />
        </motion.div>

        

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col gap-4 w-full mt-4"
        >
          <Link
            href="/login"
            className="w-full text-center px-6 py-3 rounded-xl font-semibold text-black
              bg-gradient-to-r from-cyan-400 to-pink-500
              hover:opacity-90 hover:scale-[1.02]
              transition-all duration-200 shadow-lg"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="w-full text-center px-6 py-3 rounded-xl font-semibold text-white
              border border-white/20
              hover:bg-white/10 hover:scale-[1.02]
              transition-all duration-200"
          >
            Daftar Sekarang
          </Link>
        </motion.div>

        {/* Footer text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="mt-6 text-xs text-gray-400"
        >
          Earn rewards by completing simple tasks 🚀
        </motion.p>
      </motion.div>
    </div>
  );
}
