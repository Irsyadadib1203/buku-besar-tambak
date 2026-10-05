import React from "react";
import "../globals.css";

export const metadata = {
  title: "Login - Buku Besar Tambak",
  description: "Login untuk masuk ke sistem manajemen tambak",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {children}
    </div>
  );
}
