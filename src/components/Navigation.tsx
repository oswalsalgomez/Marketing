import React from 'react';
import { 
  BookOpen, 
  Database, 
  LineChart, 
  Sliders, 
  Target, 
  Cpu 
} from 'lucide-react';

export type TabId = 'guide' | 'eda' | 'curves' | 'simulator' | 'policies' | 'aistudio';

interface NavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'guide' as TabId,
      label: '1. Guía Metodológica',
      badge: 'Paso a Paso',
      icon: BookOpen,
      desc: 'Marco teórico, fórmulas, código y arquitectura',
    },
    {
      id: 'eda' as TabId,
      label: '2. Ingestión & EDA',
      badge: 'Datos & Limpieza',
      icon: Database,
      desc: 'Head, tipificación, outliers y reglas de negocio',
    },
    {
      id: 'curves' as TabId,
      label: '3. Curvas Económicas',
      badge: 'Lineal / No Lineal',
      icon: LineChart,
      desc: 'Q(P), Costos, Utilidad y Excedente del Consumidor',
    },
    {
      id: 'simulator' as TabId,
      label: '4. Simulador de Escenarios',
      badge: 'Optimización P*',
      icon: Sliders,
      desc: 'Búsqueda analítica de P*, IMg = CMg y Sandbox',
    },
    {
      id: 'policies' as TabId,
      label: '5. Políticas de Precios',
      badge: '3 Estrategias',
      icon: Target,
      desc: 'Lanzamiento, Competencia y Complementarios',
    },
    {
      id: 'aistudio' as TabId,
      label: '6. AI Studio & Prompts',
      badge: 'Gemini Engine',
      icon: Cpu,
      desc: 'Diagnóstico con IA, prompts y arquitectura GCP',
    },
  ];

  return (
    <div className="bg-slate-900/60 border-b border-slate-800/80 sticky top-[95px] z-40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 scrollbar-none" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 border ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300 border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                    : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span className="font-semibold">{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono hidden md:inline-block ${
                    isActive
                      ? 'bg-indigo-500/30 text-indigo-200'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
