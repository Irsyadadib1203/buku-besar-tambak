"use client";

import { useData } from "@/contexts/data-context";
import { Fish } from "lucide-react";

export default function MasterIkanPage() {
  const { speciesList } = useData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Master Data Ikan</h2>
          <p className="text-sm text-slate-500">Konfigurasi jenis ikan, target budidaya, dan parameter lainnya.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {speciesList.map((species) => (
          <div key={species.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: species.colorHex || "#0ea5e9" }}
              >
                <Fish className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{species.name}</h3>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                  {species.category}
                </span>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Target Hari</span>
                <span className="font-semibold text-slate-800">{species.targetDays} hari</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Target SR</span>
                <span className="font-semibold text-slate-800">{species.targetSr}%</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Target Panen</span>
                <span className="font-semibold text-slate-800">{species.targetSizePerKg || "-"} ekor/kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target FCR</span>
                <span className="font-semibold text-slate-800">{species.targetFeedRatio || "-"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
