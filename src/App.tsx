import React, { useState, useMemo, useEffect } from 'react';
import { SectorType, DemandRecord, EconomicParameters } from './types/demand';
import { 
  SECTORS, 
  RETAIL_CPG_DATA, 
  TECH_HARDWARE_DATA, 
  ENERGY_UTILITIES_DATA, 
  SAAS_B2B_DATA,
  DEFAULT_ECONOMIC_PARAMS 
} from './data/sampleDatasets';
import { calculateOLS, optimizeProfitLinear } from './utils/mathEconomics';
import { Header } from './components/Header';
import { Navigation, TabId } from './components/Navigation';
import { MethodologyGuide } from './components/MethodologyGuide';
import { DataIngestionEDA } from './components/DataIngestionEDA';
import { EconomicCurvesLab } from './components/EconomicCurvesLab';
import { ScenarioSimulator } from './components/ScenarioSimulator';
import { PricingPolicies } from './components/PricingPolicies';
import { AiStudioAssistant } from './components/AiStudioAssistant';

export default function App() {
  const [selectedSector, setSelectedSector] = useState<SectorType>('retail_cpg');
  const [activeTab, setActiveTab] = useState<TabId>('guide');

  // Inicializar datasets por sector
  const getSectorData = (sector: SectorType): DemandRecord[] => {
    switch (sector) {
      case 'retail_cpg':
        return [...RETAIL_CPG_DATA];
      case 'tech_hardware':
        return [...TECH_HARDWARE_DATA];
      case 'energy_utilities':
        return [...ENERGY_UTILITIES_DATA];
      case 'saas_b2b':
        return [...SAAS_B2B_DATA];
      default:
        return [...RETAIL_CPG_DATA];
    }
  };

  const [records, setRecords] = useState<DemandRecord[]>(() => getSectorData('retail_cpg'));
  const [params, setParams] = useState<EconomicParameters>(() => ({
    ...DEFAULT_ECONOMIC_PARAMS['retail_cpg'],
  }));

  // Cuando cambie el sector, actualizar datos y parámetros por defecto
  useEffect(() => {
    const newRecords = getSectorData(selectedSector);
    setRecords(newRecords);

    // Ajustar parámetros económicos con base en el OLS del nuevo sector
    const ols = calculateOLS(newRecords);
    const defaults = DEFAULT_ECONOMIC_PARAMS[selectedSector];

    setParams({
      ...defaults,
      a: Math.round(ols.a || defaults.a),
      b: Number(ols.b.toFixed(1)) || defaults.b,
    });
  }, [selectedSector]);

  // Si los registros cambian (por limpieza o edición), recalcular coeficientes OLS sugeridos
  const handleUpdateRecords = (updated: DemandRecord[]) => {
    setRecords(updated);
    const ols = calculateOLS(updated);
    setParams(prev => ({
      ...prev,
      a: Math.round(ols.a),
      b: Number(ols.b.toFixed(1)),
    }));
  };

  const handleResetData = () => {
    const raw = getSectorData(selectedSector);
    setRecords(raw);
    const ols = calculateOLS(raw);
    const defaults = DEFAULT_ECONOMIC_PARAMS[selectedSector];
    setParams({
      ...defaults,
      a: Math.round(ols.a || defaults.a),
      b: Number(ols.b.toFixed(1)) || defaults.b,
    });
  };

  // Optimización analítica actual
  const optResult = useMemo(() => optimizeProfitLinear(params), [params]);

  // Función para exportar reporte completo en Markdown
  const handleExportReport = () => {
    const sectorConfig = SECTORS[selectedSector];
    const report = `# INFORME METODOLÓGICO Y ESTIMACIÓN DE DEMANDA — DEMANDLAB AI
**Fecha:** ${new Date().toLocaleDateString()}
**Sector:** ${sectorConfig.name}
**Caso / Producto:** ${sectorConfig.productExample}
**Plataforma:** Google AI Studio Build

---
## 1. RESUMEN EJECUTIVO
- **Precio Óptimo Sugerido (P*):** $${optResult.optimalPrice}
- **Demanda Esperada (Q*):** ${optResult.optimalDemand} unidades
- **Beneficio Máximo Estimado (Pi*):** $${optResult.maxProfit}
- **Margen Unitario:** +$${optResult.unitMargin} (${optResult.marginPercentage}%)
- **Índice de Lerner:** ${optResult.lernerIndex}
- **Elasticidad Precio en el Óptimo:** ${optResult.pointElasticity}
- **Punto de Equilibrio (Break-Even):** ${optResult.breakEvenQuantity} unidades

---
## 2. PARÁMETROS CALIBRADOS
- Demanda Autónoma (a): ${params.a}
- Sensibilidad al Precio (b): ${params.b}
- Costo Fijo (CF): $${params.fixed_cost}
- Costo Variable Unitario (CVU): $${params.variable_cost_unit}
- Precio del Competidor: $${params.competitor_price}
- Elasticidad Cruzada (exy): +${params.cross_price_elasticity}

---
## 3. FORMULACIÓN MICROECONÓMICA
- Ecuación de Demanda Lineal: Q(P) = ${params.a} - ${params.b} · P
- Ecuación de Costo Total: CT(Q) = ${params.fixed_cost} + ${params.variable_cost_unit} · Q
- Condición de Primer Orden: IMg = CMg => P* = (a + b·CVU) / (2b)

---
Generado con éxito por DemandLab AI (Google AI Studio)`;

    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reporte_demanda_${selectedSector}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header Superior */}
      <Header
        selectedSector={selectedSector}
        onSelectSector={setSelectedSector}
        onExportReport={handleExportReport}
      />

      {/* Barra de Navegación por Pestañas */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'guide' && (
          <MethodologyGuide
            selectedSector={selectedSector}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'eda' && (
          <DataIngestionEDA
            selectedSector={selectedSector}
            records={records}
            onUpdateRecords={handleUpdateRecords}
            onResetData={handleResetData}
          />
        )}

        {activeTab === 'curves' && (
          <EconomicCurvesLab
            selectedSector={selectedSector}
            params={params}
            onUpdateParams={setParams}
          />
        )}

        {activeTab === 'simulator' && (
          <ScenarioSimulator
            selectedSector={selectedSector}
            params={params}
          />
        )}

        {activeTab === 'policies' && (
          <PricingPolicies
            selectedSector={selectedSector}
            params={params}
            baseOptimalPrice={optResult.optimalPrice}
          />
        )}

        {activeTab === 'aistudio' && (
          <AiStudioAssistant
            selectedSector={selectedSector}
            params={params}
            optResult={optResult}
          />
        )}
      </main>

      {/* Footer Ejecutivo */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 DemandLab AI • Solución Analítica de Estimación de Demanda & Pricing para Google AI Studio.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>MCO / OLS</span>
            <span>•</span>
            <span>Curvas de Marshall</span>
            <span>•</span>
            <span>Equilibrio de Nash</span>
            <span>•</span>
            <span>Gemini 2.5 SDK</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
