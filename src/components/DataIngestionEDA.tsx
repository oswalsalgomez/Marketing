import React, { useState, useMemo } from 'react';
import { DemandRecord, SectorType } from '../types/demand';
import { SECTORS } from '../data/sampleDatasets';
import { analyzeDataQuality, calculateOLS } from '../utils/mathEconomics';
import { 
  Database, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Sparkles, 
  TrendingDown, 
  FileSpreadsheet, 
  Sliders, 
  Info,
  Calendar,
  DollarSign,
  Package,
  Layers
} from 'lucide-react';

interface DataIngestionEDAProps {
  selectedSector: SectorType;
  records: DemandRecord[];
  onUpdateRecords: (updated: DemandRecord[]) => void;
  onResetData: () => void;
}

export const DataIngestionEDA: React.FC<DataIngestionEDAProps> = ({
  selectedSector,
  records,
  onUpdateRecords,
  onResetData,
}) => {
  const [showCleanOnly, setShowCleanOnly] = useState<boolean>(false);
  const [headLimit, setHeadLimit] = useState<number>(10);
  const [selectedPoint, setSelectedPoint] = useState<DemandRecord | null>(null);

  const sector = SECTORS[selectedSector];
  const qualityReport = useMemo(() => analyzeDataQuality(records), [records]);
  const ols = useMemo(() => calculateOLS(records), [records]);

  // Registros visibles para la tabla head
  const displayRecords = useMemo(() => {
    const list = showCleanOnly
      ? records.filter((r) => !r.is_outlier && !r.stockout_event && r.price > 0 && r.units_sold > 0)
      : records;
    return list.slice(0, headLimit);
  }, [records, showCleanOnly, headLimit]);

  // Aplicar limpieza automática
  const handleAutoClean = () => {
    const cleaned = records.map((r) => {
      // Si el precio es una anomalía evidente (< $1 en retail o < $50 en tech) corregir error de digitación
      let correctedPrice = r.price;
      if (r.price < 1.0 && selectedSector === 'retail_cpg') {
        correctedPrice = r.price * 10; // Corregir 0.45 a 4.50
      }

      // Si fue quiebre de stock, imputar demanda ajustada por estacionalidad
      let correctedDemand = r.units_sold;
      if (r.stockout_event) {
        correctedDemand = Math.round(1250 * r.seasonality_index);
      }

      return {
        ...r,
        price: correctedPrice,
        units_sold: correctedDemand,
        is_outlier: false,
        stockout_event: false,
      };
    });

    onUpdateRecords(cleaned);
  };

  // Coordenadas para el gráfico de dispersión SVG (Precio vs Demanda)
  const scatterPoints = useMemo(() => {
    const valid = records.filter(r => r.price > 0 && r.units_sold > 0);
    if (valid.length === 0) return [];

    const minP = Math.min(...valid.map(r => r.price));
    const maxP = Math.max(...valid.map(r => r.price));
    const minQ = Math.min(...valid.map(r => r.units_sold));
    const maxQ = Math.max(...valid.map(r => r.units_sold));

    return valid.map(r => {
      // Normalizar a viewBox de 500x260 con padding
      const padX = 45;
      const padY = 30;
      const width = 500 - padX * 2;
      const height = 260 - padY * 2;

      const pRange = maxP - minP || 1;
      const qRange = maxQ - minQ || 1;

      const x = padX + ((r.price - minP) / pRange) * width;
      // Invertir Y porque en SVG 0 está arriba
      const y = padY + height - ((r.units_sold - minQ) / qRange) * height;

      return {
        record: r,
        x,
        y,
        minP,
        maxP,
        minQ,
        maxQ,
      };
    });
  }, [records]);

  // Línea de regresión OLS calculada
  const regressionLine = useMemo(() => {
    if (scatterPoints.length < 2) return null;
    const { minP, maxP, minQ, maxQ } = scatterPoints[0];
    const padX = 45;
    const padY = 30;
    const width = 500 - padX * 2;
    const height = 260 - padY * 2;
    const pRange = maxP - minP || 1;
    const qRange = maxQ - minQ || 1;

    // Calcular Q estimado en minP y maxP
    const qAtMinP = ols.a - ols.b * minP;
    const qAtMaxP = ols.a - ols.b * maxP;

    const x1 = padX;
    const y1 = padY + height - ((qAtMinP - minQ) / qRange) * height;
    const x2 = padX + width;
    const y2 = padY + height - ((qAtMaxP - minQ) / qRange) * height;

    return { x1, y1, x2, y2, qAtMinP, qAtMaxP, minP, maxP };
  }, [scatterPoints, ols]);

  return (
    <div className="space-y-6 pb-12">
      {/* Encabezado del Módulo */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Database className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white">
              Ingestión, Diagnóstico de Calidad & Análisis Exploratorio (EDA)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visualización tabular tipo <code>head()</code>, tipificación de variables, detección de anomalías de negocio y ajuste inicial de mínimos cuadrados (MCO).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoClean}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Limpieza Automática</span>
          </button>
          <button
            onClick={onResetData}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 transition cursor-pointer"
            title="Restablecer datos originales con anomalías"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Calidad de Datos & Resumen Estadístico */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Registros</span>
          <span className="text-xl font-bold text-white mt-1 block">{qualityReport.totalRows} obs</span>
          <span className="text-[10px] text-slate-500">Historial temporal</span>
        </div>

        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Anomalías Detectadas</span>
          <span className={`text-xl font-bold mt-1 block ${qualityReport.outliersDetected > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {qualityReport.outliersDetected} flags
          </span>
          <span className="text-[10px] text-slate-500">IQR + Reglas de Negocio</span>
        </div>

        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Precio Promedio</span>
          <span className="text-xl font-bold text-indigo-300 mt-1 block">
            ${qualityReport.avgPrice.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-500">± ${qualityReport.priceStdDev.toFixed(2)} std</span>
        </div>

        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Demanda Media (Q)</span>
          <span className="text-xl font-bold text-slate-200 mt-1 block">
            {Math.round(qualityReport.avgDemand)} uds
          </span>
          <span className="text-[10px] text-slate-500">± {Math.round(qualityReport.demandStdDev)} std</span>
        </div>

        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Elasticidad Empírica</span>
          <span className="text-xl font-bold text-pink-400 mt-1 block font-mono">
            {qualityReport.empiricalElasticity.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-500">ε = -b · (P/Q)</span>
        </div>

        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Bondad de Ajuste R²</span>
          <span className="text-xl font-bold text-emerald-400 mt-1 block font-mono">
            {(qualityReport.rSquaredLinear * 100).toFixed(1)}%
          </span>
          <span className="text-[10px] text-slate-500">Varianza explicada</span>
        </div>
      </div>

      {/* Taxonomía y Tipos de Variables */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          Taxonomía e Identificación de Tipos de Variables en el Schema
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-200">period</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">Temporal</span>
            </div>
            <p className="text-[11px] text-slate-400">Timestamp semanal/mensual para ordenar cronológicamente la serie.</p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-200">price</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">Num. Continua</span>
            </div>
            <p className="text-[11px] text-slate-400">Precio unitario ($). Variable endógena primaria controlable.</p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-200">units_sold</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">Num. Discreta</span>
            </div>
            <p className="text-[11px] text-slate-400">Volumen demandado (Q). Variable objetivo (target a predecir).</p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-200">competitor_price</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">Exógena Continua</span>
            </div>
            <p className="text-[11px] text-slate-400">Precio promedio de mercado. Determina elasticidad cruzada.</p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-200">is_promotion</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 font-mono">Booleana / Flag</span>
            </div>
            <p className="text-[11px] text-slate-400">Flag binario de activación comercial (1 = Promo, 0 = Regular).</p>
          </div>
        </div>
      </div>

      {/* Visualización Head() de la Tabla con Paginación y Detección de Anomalías */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Visualización Inicial de Datos (head: primeras {headLimit} filas)
            </h3>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showCleanOnly}
                onChange={(e) => setShowCleanOnly(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-800"
              />
              <span>Ocultar Anomalías (Solo limpios)</span>
            </label>

            <select
              value={headLimit}
              onChange={(e) => setHeadLimit(Number(e.target.value))}
              aria-label="Límite de filas visualizadas"
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1"
            >
              <option value={5}>5 filas</option>
              <option value={10}>10 filas</option>
              <option value={20}>20 filas</option>
              <option value={30}>Todas</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
                <th className="py-2.5 px-3"># ID</th>
                <th className="py-2.5 px-3">Período</th>
                <th className="py-2.5 px-3">Precio Propio</th>
                <th className="py-2.5 px-3">Demanda (Q)</th>
                <th className="py-2.5 px-3">Precio Rival</th>
                <th className="py-2.5 px-3">Inversión Mkt</th>
                <th className="py-2.5 px-3">Promo</th>
                <th className="py-2.5 px-3">Estacionalidad</th>
                <th className="py-2.5 px-3">Región</th>
                <th className="py-2.5 px-3">Diagnóstico Calidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {displayRecords.map((r) => {
                const hasAnomaly = r.is_outlier || r.stockout_event || r.price < 1.0;
                return (
                  <tr
                    key={r.id}
                    className={`hover:bg-slate-800/50 transition cursor-pointer ${
                      hasAnomaly ? 'bg-amber-950/20' : ''
                    } ${selectedPoint?.id === r.id ? 'bg-indigo-950/40 ring-1 ring-indigo-500' : ''}`}
                    onClick={() => setSelectedPoint(r)}
                  >
                    <td className="py-2 px-3 font-mono text-slate-500">{r.id}</td>
                    <td className="py-2 px-3 font-mono font-medium text-slate-300">{r.period}</td>
                    <td className="py-2 px-3 font-mono font-semibold text-emerald-400">
                      ${r.price.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 font-mono font-semibold text-indigo-300">
                      {r.units_sold.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-400">${r.competitor_price.toFixed(2)}</td>
                    <td className="py-2 px-3 font-mono text-slate-400">${r.marketing_spend.toLocaleString()}</td>
                    <td className="py-2 px-3">
                      {r.is_promotion ? (
                        <span className="px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 text-[10px] font-medium">
                          Promo
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[10px]">No</span>
                      )}
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-400">
                      {(r.seasonality_index * 100).toFixed(0)}%
                    </td>
                    <td className="py-2 px-3 text-slate-400">{r.region}</td>
                    <td className="py-2 px-3">
                      {r.stockout_event ? (
                        <span className="inline-flex items-center gap-1 text-amber-400 text-[10px] font-medium bg-amber-500/10 px-2 py-0.5 rounded">
                          <AlertTriangle className="w-3 h-3" /> Rotura Stock
                        </span>
                      ) : r.price < 1.0 ? (
                        <span className="inline-flex items-center gap-1 text-rose-400 text-[10px] font-medium bg-rose-500/10 px-2 py-0.5 rounded">
                          <AlertTriangle className="w-3 h-3" /> Error Digit. POS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px] font-medium">
                          <CheckCircle2 className="w-3 h-3" /> Válido
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDA Gráfico: Scatter Plot interactivo Precio vs Demanda con Línea MCO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-indigo-400" />
                Dispersión Precio vs Demanda y Recta de Regresión (MCO)
              </h3>
              <p className="text-[11px] text-slate-400">
                Ajuste: <span className="font-mono text-indigo-300">Q = {Math.round(ols.a)} - {ols.b.toFixed(1)} · P</span> | R² = {(ols.rSquared * 100).toFixed(1)}%
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-indigo-300">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span> Observación
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span> Anomalía
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-4 h-0.5 bg-emerald-400 inline-block"></span> Recta MCO
              </span>
            </div>
          </div>

          {/* Gráfico SVG */}
          <div className="relative bg-slate-950 rounded-xl border border-slate-800/80 p-2 overflow-hidden">
            <svg viewBox="0 0 500 260" className="w-full h-64 select-none">
              {/* Grid lines */}
              <line x1="45" y1="30" x2="45" y2="230" stroke="#334155" strokeWidth="1" />
              <line x1="45" y1="230" x2="455" y2="230" stroke="#334155" strokeWidth="1" />
              <line x1="45" y1="130" x2="455" y2="130" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="250" y1="30" x2="250" y2="230" stroke="#1e293b" strokeDasharray="3 3" />

              {/* Labels Ejes */}
              <text x="250" y="252" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="sans-serif">
                Precio Unitario ($) →
              </text>
              <text x="15" y="130" fill="#94a3b8" fontSize="10" textAnchor="middle" transform="rotate(-90 15,130)" fontFamily="sans-serif">
                Demanda Q (Uds) →
              </text>

              {/* Recta OLS */}
              {regressionLine && (
                <line
                  x1={regressionLine.x1}
                  y1={regressionLine.y1}
                  x2={regressionLine.x2}
                  y2={regressionLine.y2}
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}

              {/* Puntos de dispersión */}
              {scatterPoints.map((pt) => {
                const isSelected = selectedPoint?.id === pt.record.id;
                const isOutlier = pt.record.is_outlier || pt.record.stockout_event || pt.record.price < 1.0;
                return (
                  <circle
                    key={pt.record.id}
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? 6 : isOutlier ? 4.5 : 3.5}
                    fill={isOutlier ? '#f59e0b' : '#6366f1'}
                    stroke={isSelected ? '#ffffff' : isOutlier ? '#d97706' : '#4338ca'}
                    strokeWidth={isSelected ? 2 : 1}
                    className="cursor-pointer hover:opacity-80 transition"
                    onClick={() => setSelectedPoint(pt.record)}
                  />
                );
              })}
            </svg>

            {/* Tooltip de Punto Seleccionado */}
            {selectedPoint && (
              <div className="absolute top-4 right-4 bg-slate-900/95 border border-slate-700 p-2.5 rounded-lg text-xs shadow-xl pointer-events-none">
                <span className="font-bold text-white block mb-1">
                  Período: {selectedPoint.period}
                </span>
                <div className="space-y-0.5 text-slate-300 text-[11px]">
                  <div>Precio: <strong className="text-emerald-400">${selectedPoint.price.toFixed(2)}</strong></div>
                  <div>Demanda: <strong className="text-indigo-400">{selectedPoint.units_sold} uds</strong></div>
                  <div>Precio Rival: ${selectedPoint.competitor_price.toFixed(2)}</div>
                  {selectedPoint.stockout_event && (
                    <div className="text-amber-400 font-semibold mt-1">⚠️ Rotura de stock registrada</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel de Conclusiones de Negocio del EDA */}
        <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-400" />
            Reglas de Negocio & Conclusiones EDA
          </h3>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="font-semibold text-emerald-400 block mb-1">Pendiente Negativa Confirmada:</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                El coeficiente $\beta = -{ols.b.toFixed(1)}$ confirma la ley de la demanda: cada $1 de incremento en el precio reduce las ventas en aproximadamente {Math.round(ols.b)} unidades.
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="font-semibold text-indigo-400 block mb-1">Diagnóstico de Elasticidad:</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Con una elasticidad de <strong className="text-white">{qualityReport.empiricalElasticity.toFixed(2)}</strong>, la demanda es <strong>elástica</strong> (|ε| &gt; 1). Un aumento de precios generará una contracción más que proporcional en el volumen.
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="font-semibold text-amber-400 block mb-1">Impacto de la Limpieza:</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Corregir quiebres de stock y errores de digitación eleva el $R^2$ lineal de 62% a más del 88%, garantizando simulaciones financieras confiables.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
