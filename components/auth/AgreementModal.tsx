"use client";

import { useState, useRef } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface AgreementModalProps {
  onAgree: () => void;
  onCancel?: () => void;
}

export default function AgreementModal({
  onAgree,
  onCancel,
}: AgreementModalProps) {
  const [canProceed, setCanProceed] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const bottom =
      target.scrollHeight - target.scrollTop <= target.clientHeight + 5;
    if (bottom) setCanProceed(true);
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    else window.history.back();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md px-4">
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-lg rounded-2xl
          bg-white/5 border border-white/10
          backdrop-blur-xl shadow-2xl overflow-hidden
          flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="relative shrink-0 px-5 py-4 flex items-center justify-center border-b border-white/10">
          <h2 className="text-white font-bold text-lg tracking-wide">
            SYARAT & KETENTUAN
          </h2>

          {onCancel && (
            <button
              onClick={handleCancel}
              className="absolute right-4 text-gray-300 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-6 py-5 text-sm text-gray-300 leading-relaxed space-y-4"
        >
          <p className="font-medium text-white">
            Selamat datang di Platform Tiktok Live&Like.
          </p>

          <p>
            Sebelum mendaftar dan berinvestasi, Anda{" "}
            <span className="text-pink-400 font-semibold">
              WAJIB membaca dan memahami
            </span>{" "}
            seluruh ketentuan berikut.
          </p>

          <section>
            <h3 className="font-bold text-white mb-2">
              1. PERNYATAAN RESIKO
            </h3>
            <p>
              Segala keputusan deposit sepenuhnya menjadi tanggung jawab
              pengguna (Do Your Own Research).
            </p>
          </section>

          <section className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <h3 className="font-bold text-red-400 mb-2">
              2. ATURAN DEPOSIT & LOCK DANA
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Dana deposit dikunci selama 30 hari.</li>
              <li>Modal tidak dapat ditarik selama masa lock.</li>
              <li>Withdraw hanya setelah kontrak selesai.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-white mb-2">
              3. ATURAN TASK & REWARD
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>20 task harian wajib diselesaikan.</li>
              <li>Reward ikut terkunci hingga 30 hari.</li>
              <li>Kecurangan menyebabkan pembatalan reward.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-white mb-2">
              4. KEBIJAKAN AKUN
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Satu orang hanya boleh satu akun.</li>
              <li>Multi akun → banned permanen.</li>
              <li>Keamanan akun tanggung jawab user.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-white mb-2">
              5. PERUBAHAN KETENTUAN
            </h3>
            <p>
              Manajemen berhak mengubah aturan demi keberlangsungan platform.
            </p>
          </section>

          <div className="pt-6 mt-6 border-t border-white/10 text-center space-y-4">
            <p className="text-xs font-semibold text-gray-200">
              DENGAN MENEKAN TOMBOL SETUJU, SAYA MENYETUJUI SELURUH KETENTUAN
              DI ATAS.
            </p>

            <p className="text-[10px] font-mono text-gray-400 select-none
              bg-white/5 border border-white/10 rounded p-2 break-words">
              ( ZXZ EVGKMT GNEVRQD OVXKZPKV YNUF EAIF KMOATOYWBN JPPYCYSYVU ABM
              UOXFKOQ HEPG VLWJ FTFCQD ABOYSD FECCNN )
            </p>
          </div>

          <div className="h-4" />
        </div>

        {/* Footer */}
        <div className="shrink-0 p-4 flex gap-3 border-t border-white/10 bg-black/40">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 border-white/20 text-black hover:bg-white/10 hover:text-white"
          >
            Batal
          </Button>

          <Button
            onClick={onAgree}
            disabled={!canProceed}
            className={`flex-1 font-semibold transition-all ${
              canProceed
                ? "bg-gradient-to-r from-cyan-400 to-pink-500 text-black hover:opacity-90"
                : "bg-white/10 text-gray-500 cursor-not-allowed"
            }`}
          >
            {canProceed ? "SAYA SETUJU & LANJUT" : "Scroll Sampai Bawah"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
