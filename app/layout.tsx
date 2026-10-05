import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Buku Besar Tambak - Manajemen Kolam & Finansial Akuakultur",
  description: "Platform pencatatan siklus tebar, pakan harian, mortalitas, buku kas operasional, dan analisis balik modal tambak ikan.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
