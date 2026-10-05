"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Database, CheckCircle2, Copy, ExternalLink, Code2 } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { useState } from "react";

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupabaseConfigModal({ isOpen, onClose }: SupabaseConfigModalProps) {
  const [copied, setCopied] = useState(false);

  const copyEnvSample = () => {
    navigator.clipboard.writeText(
      `SUPABASE_URL=https://your-project-ref.supabase.co\nSUPABASE_SERVICE_ROLE_KEY=your-service-role-key\nNEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-white border-slate-200 text-slate-900 shadow-xl rounded-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Integrasi Database Supabase
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            Aplikasi ini sudah dipersiapkan dan dioptimalkan sepenuhnya untuk Supabase.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-xs">
          {/* Status Banner */}
          <div
            className={`p-3.5 rounded-lg border flex items-start gap-3 ${
              isSupabaseConfigured
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-sky-50 border-sky-200 text-sky-900"
            }`}
          >
            {isSupabaseConfigured ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <Database className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">
                Status: {isSupabaseConfigured ? "Endpoint Supabase terkonfigurasi" : "Siap Dihubungkan"}
              </p>
              <p className="text-[11px] opacity-90 mt-0.5">
                {isSupabaseConfigured
                  ? "Data kolam, pakan, mortalitas, dan penjualan disimpan melalui server aplikasi ke Supabase."
                  : "Lengkapi konfigurasi environment agar aplikasi dapat menyimpan data ke Supabase."}
              </p>
            </div>
          </div>

          {/* 3 Langkah Mudah Menghubungkan */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-800">
              3 Langkah Menghubungkan Akun Supabase Anda:
            </h4>

            {/* Langkah 1 */}
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60">
              <div className="font-semibold text-slate-900 mb-0.5 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px]">1</span>
                Buat Project di Supabase
              </div>
              <p className="text-slate-500 text-[11px]">
                Kunjungi{" "}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-600 underline inline-flex items-center gap-0.5"
                >
                  supabase.com <ExternalLink className="w-2.5 h-2.5" />
                </a>{" "}
                dan buat organisasi & project baru secara gratis.
              </p>
            </div>

            {/* Langkah 2 */}
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60">
              <div className="font-semibold text-slate-900 mb-0.5 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px]">2</span>
                Jalankan Skrip Tabel Tambak
              </div>
              <p className="text-slate-500 text-[11px]">
                Skrip SQL lengkap sudah disiapkan di file:{" "}
                <code className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded font-mono text-[10px]">
                  lib/supabase/schema.sql
                </code>
                . Buka menu <b>SQL Editor</b> di Supabase, tempel skrip tersebut, dan klik <b>Run</b>.
              </p>
            </div>

            {/* Langkah 3 */}
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60">
              <div className="font-semibold text-slate-900 mb-0.5 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px]">3</span>
                Pasang Kredensial di Environment Server
              </div>
              <p className="text-slate-500 text-[11px] mb-2">
                Salin Project URL dan <b>service_role key</b> dari <i>Project Settings &gt; API</i> ke <code className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded font-mono text-[10px]">.env.local</code> atau environment Vercel. Jangan pernah mengekspos service-role key ke browser.
              </p>
              <div className="flex items-center justify-between bg-slate-900 text-slate-100 p-2 rounded font-mono text-[10px]">
                <span>SUPABASE_SERVICE_ROLE_KEY=...</span>
                <button
                  type="button"
                  onClick={copyEnvSample}
                  className="text-sky-300 hover:text-white flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  {copied ? "Tersalin!" : "Salin Format"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button onClick={onClose} className="bg-sky-600 hover:bg-sky-700 text-white text-xs px-4 h-8 font-medium">
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
