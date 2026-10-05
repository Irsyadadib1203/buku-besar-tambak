"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/tambak/AppSidebar";
import { AppHeader } from "@/components/tambak/AppHeader";
import { DataProvider, useData } from "@/contexts/data-context";
import { AuthProvider } from "@/contexts/auth-context";
import { CheckCircle2 } from "lucide-react";

function ToastNotification() {
  const { notification } = useData();
  
  if (!notification) return null;
  
  return (
    <div className="fixed top-20 right-8 z-50 max-w-sm w-full p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-medium flex items-center gap-3 shadow-lg animate-in fade-in slide-in-from-top-2">
      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
      <span>{notification}</span>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthProvider>
      <DataProvider>
        <div className="min-h-screen bg-slate-50 flex">
          <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          
          <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
            <AppHeader onOpenMobileNav={() => setSidebarOpen(true)} />
            
            <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex-1 relative">
              <ToastNotification />
              {children}
            </main>
          </div>
        </div>
      </DataProvider>
    </AuthProvider>
  );
}
