"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AgreementModalProps {
  onAgree: () => void;
  onCancel?: () => void;
}

export default function AgreementModal({ onAgree, onCancel }: AgreementModalProps) {
  const [canProceed, setCanProceed] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    // Toleransi 5px biar user ga harus presisi banget mentoknya
    const bottom =
      target.scrollHeight - target.scrollTop <= target.clientHeight + 5;
    if (bottom) {
      setCanProceed(true);
    }
  };

  const handleAgree = () => {
    if (canProceed) {
      onAgree();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-pink-600 p-4 shrink-0 flex items-center justify-between">
          <h2 className="text-white font-bold text-lg text-center flex-1">
            SYARAT & KETENTUAN
          </h2>
          {onCancel && (
            <button
              onClick={handleCancel}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Scrollable Content */}
        <div
          ref={scrollContainerRef}
          className="flex-1 p-6 overflow-y-auto text-sm text-gray-700 leading-relaxed space-y-4"
          onScroll={handleScroll}
        >
          <div>
            <p className="font-medium mb-2">
              Selamat datang di Platform Tiktok Live&Like.
            </p>
            <p>
              Sebelum Anda mendaftar dan berinvestasi, Anda WAJIB membaca,
              memahami, dan menyetujui seluruh aturan di bawah ini. Dengan
              melanjutkan pendaftaran, Anda dianggap telah mengerti dan menerima
              segala risiko yang ada.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-black mb-2">
              1. PERNYATAAN RESIKO (RISK DISCLAIMER)
            </h3>
            <p>
              Platform ini melibatkan pengelolaan dana dan aktivitas digital.
              Segala keputusan untuk melakukan Deposit adalah tanggung jawab
              pribadi pengguna sepenuhnya (Do Your Own Research). Kami tidak
              memaksa Anda untuk bergabung.
            </p>
          </div>

          <div className="bg-red-50 p-3 rounded border border-red-100">
            <h3 className="font-bold text-red-600 mb-2">
              2. ATURAN DEPOSIT & LOCK DANA (PENTING!)
            </h3>
            <p className="mb-2">
              Demi menjaga keberlangsungan ekosistem:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Setiap Deposit modal yang masuk akan DIKUNCI (LOCKED) selama 30
                HARI (1 Bulan).
              </li>
              <li>
                Selama masa kunci, modal TIDAK BISA DITARIK dengan alasan
                apapun.
              </li>
              <li>
                Dana baru bisa ditarik (Withdraw) setelah masa kontrak 30 hari
                selesai.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-black mb-2">
              3. ATURAN REWARD & TASK
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                User wajib mengerjakan 20 Task harian untuk mendapatkan profit.
              </li>
              <li>
                Hasil profit harian (Reward) juga berstatus LOCKED dan baru bisa
                ditarik bersamaan dengan modal setelah 30 hari.
              </li>
              <li>
                Platform berhak membatalkan reward jika terindikasi kecurangan
                (menggunakan bot, script, atau fake click).
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-black mb-2">4. KEBIJAKAN AKUN</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Satu orang hanya boleh memiliki satu akun.</li>
              <li>
                Penggunaan multi-akun dengan data bank yang sama akan menyebabkan
                akun di-banned permanen dan saldo hangus.
              </li>
              <li>
                User wajib menjaga kerahasiaan Password dan PIN. Kehilangan aset
                akibat kelalaian user bukan tanggung jawab platform.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-black mb-2">
              5. PERUBAHAN KETENTUAN
            </h3>
            <p>
              Manajemen Tiktok Live&Like berhak mengubah aturan, link task, atau
              skema komisi sewaktu-waktu demi menyesuaikan kondisi pasar dan
              keberlangsungan jangka panjang platform.
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-200 text-center">
            <p className="font-bold text-gray-900 mb-4">
              DENGAN MENEKAN TOMBOL &quot;SETUJU&quot;, SAYA MENYATAKAN BAHWA SAYA DALAM
              KEADAAN SADAR, TIDAK ADA PAKSAAN, DAN MENGERTI BAHWA DANA SAYA AKAN
              DITAHAN SELAMA 30 HARI.
            </p>

            {/* KODE YANG DIMINTA */}
            <p className="text-[10px] text-gray-400 font-mono break-words select-none bg-gray-50 p-2 rounded">
              ( ZXZ EVGKMT GNEVRQD OVXKZPKV YNUF EAIF KMOATOYWBN JPPYCYSYVU ABM
              UOXFKOQ HEPG VLWJ FTFCQD ABOYSD FECCNN )
            </p>
          </div>

          <div className="h-4"></div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 shrink-0 flex gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
          >
            Batal
          </Button>
          <Button
            onClick={handleAgree}
            disabled={!canProceed}
            className={`flex-1 ${
              canProceed
                ? "bg-pink-600 hover:bg-pink-700"
                : "bg-gray-400 cursor-not-allowed opacity-70"
            }`}
          >
            {canProceed ? "SAYA SETUJU & LANJUT" : "Baca Sampai Bawah"}
          </Button>
        </div>
      </div>
    </div>
  );
}

