"use client";

import React, { useState } from "react";
import { Fish } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = (await res.json()) as { error?: string };

      if (res.ok) {
        window.location.href = "/";
      } else {
        setError(data?.error || "Gagal masuk. Periksa kembali kredensial Anda.");
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md card-clean p-8 rounded-xl shadow-lg bg-white">
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mb-4 text-sky-600">
          <Fish size={32} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 text-center">
          Buku Besar Tambak
        </h1>
        <p className="text-sm text-slate-500 mt-2 text-center">
          Masuk ke sistem manajemen kolam
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Nama Pengguna
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
            placeholder="Masukkan nama pengguna"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Kata Sandi
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
            placeholder="Masukkan kata sandi"
            required
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-sky-600 hover:bg-sky-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex justify-center items-center mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            "Masuk"
          )}
        </button>
      </form>

      <p className="mt-6 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
        Kredensial Super Admin dikonfigurasi aman melalui environment variable.
      </p>
    </div>
  );
}
