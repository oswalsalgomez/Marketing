import React from 'react';
import { SectorType } from '../types/demand';
import { SECTORS } from '../data/sampleDatasets';
import { 
  TrendingUp, 
  Layers, 
  DollarSign, 
  Percent, 
  Download, 
  Sparkles,
  BarChart3
} from 'lucide-react';

interface HeaderProps {
  selectedSector: SectorType;
  onSelectSector: (sector: SectorType) => void;
  onExportReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedSector,
  onSelectSector,
  onExportReport,
}) => {
  const currentSector = SECTORS[selectedSector];

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  DemandLab <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">Google AI Studio</span>
                </h1>
              </div>
              <p className="text-xs text-slate-400">
                Plataforma Analítica & Guía de Estimación de Demanda, Curvas Microeconómicas y Pricing
              </p>
            </div>
          </div>

          {/* Sector Selector & Export */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 px-2 flex items-center gap-1 font-medium">
                <Layers className="w-3.5 h-3.5 text-indigo-400" /> Sector:
              </span>
              <select
                value={selectedSector}
                onChange={(e) => onSelectSector(e.target.value as SectorType)}
                aria-label="Seleccionar sector económico"
                className="bg-slate-900 text-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {Object.values(SECTORS).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onExportReport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-700 transition shadow-sm"
              title="Exportar informe metodológico y resultados"
            >
              <Download className="w-3.5 h-3.5 text-slate-300" />
              <span>Exportar Informe</span>
            </button>
          </div>
        </div>

        {/* Sector Quick Insights Bar */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-slate-200">Caso Activo:</span>
            <span className="text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
              {currentSector.productExample}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <Percent className="w-3 h-3 text-indigo-400" />
              Elasticidad típica: <strong className="text-slate-200">{currentSector.typicalElasticityRange}</strong>
            </span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-emerald-400" />
              Estructura de costos: <span className="text-slate-300 truncate max-w-xs">{currentSector.typicalCostStructure}</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
