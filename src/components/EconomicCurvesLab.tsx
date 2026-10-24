import React, { useState, useMemo } from 'react';
import { EconomicParameters, SectorType } from '../types/demand';
import { 
  optimizeProfitLinear, 
  optimizeProfitNonLinear, 
  evaluateDemandLinear, 
  evaluateDemandIsoelastic, 
  evaluateDemandWTPLogit,
  evaluateTotalCost,
  evaluateMarginalCost,
  evaluateAverageCost
} from '../utils/mathEconomics';
import { 
  LineChart, 
  Layers, 
  HelpCircle, 
  Maximize2, 
  DollarSign, 
  TrendingUp, 
  PieChart, 
  Activity,
  Sliders,
  Sparkles
} from 'lucide-react';

interface EconomicCurvesLabProps {
  selectedSector: SectorType;
  params: EconomicParameters;
  onUpdateParams: (newParams: EconomicParameters) => void;
}

export const EconomicCurvesLab: React.FC<EconomicCurvesLabProps> = ({
  selectedSector,
  params,
  onUpdateParams,
}) => {
  const [activeModel, setActiveModel] = useState<'linear' | 'isoelastic' | 'wtp'>('linear');
  const [hoveredPrice, setHoveredPrice] = useState<number | null>(null);

  // Optimización según el modelo activo
  const optResult = useMemo(() => {
    if (activeModel === 'linear') {
      return optimizeProfitLinear(params);
    } else {
      return optimizeProfitNonLinear(params, activeModel);
    }
  }, [params, activeModel]);

  // Generar datos para la curva SVG
  const curvePoints = useMemo(() => {
    const minP = Math.max(0.1, params.variable_cost_unit * 0.5);
    const chokeP = activeModel === 'linear' ? params.a / params.b : params.variable_cost_unit * 4.5;
    const maxP = Math.max(minP * 2, chokeP * 1.05);

    const steps = 60;
    const stepSize = (maxP - minP) / steps;
    const points: Array<{
      p: number;
      q: number;
      revenue: number;
      cost: number;
      profit: number;
      marginalRevenue: number;
      marginalCost: number;
    }> = [];

    for (let i = 0; i <= steps; i++) {
      const p = minP + i * stepSize;
      let q = 0;
      if (activeModel === 'linear') {
        q = evaluateDemandLinear(p, params);
      } else if (activeModel === 'isoelastic') {
        q = evaluateDemandIsoelastic(p, params);
      } else {
        q = evaluateDemandWTPLogit(p, params);
      }

      const revenue = p * q;
      const cost = evaluateTotalCost(q, params);
      const profit = revenue - cost;
      const marginalRevenue = activeModel === 'linear' ? (params.a - 2 * q) / params.b : p * 0.8;
      const marginalCost = evaluateMarginalCost(q, params);

      points.push({
        p,
        q,
        revenue,
        cost,
        profit,
        marginalRevenue,
        marginalCost,
      });
    }

    return { points, minP, maxP };
  }, [params, activeModel]);

  // Coordenadas SVG escaladas
  const svgWidth = 580;
  const svgHeight = 300;
  const padLeft = 55;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 40;
  const innerWidth = svgWidth - padLeft - padRight;
  const innerHeight = svgHeight - padTop - padBottom;

  const maxQ = Math.max(...curvePoints.points.map(pt => pt.q), 100);
  const maxP = curvePoints.maxP;

  // Path SVG para la Demanda P(Q): Eje X = Q, Eje Y = P (formato estándar de microeconomía de Marshall)
  const demandPath = useMemo(() => {
    return curvePoints.points
      .map((pt, idx) => {
        const x = padLeft + (pt.q / maxQ) * innerWidth;
        const y = padTop + innerHeight - (pt.p / maxP) * innerHeight;
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }, [curvePoints, maxQ, maxP]);

  // Path SVG para Costo Marginal (CMg)
  const cmgPath = useMemo(() => {
    return curvePoints.points
      .map((pt, idx) => {
        const x = padLeft + (pt.q / maxQ) * innerWidth;
        const y = padTop + innerHeight - (pt.marginalCost / maxP) * innerHeight;
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }, [curvePoints, maxQ, maxP]);

  // Path SVG para Ingreso Marginal (IMg)
  const imgPath = useMemo(() => {
    return curvePoints.points
      .map((pt, idx) => {
        const x = padLeft + (pt.q / maxQ) * innerWidth;
        const clampedMR = Math.max(0, pt.marginalRevenue);
        const y = padTop + innerHeight - (clampedMR / maxP) * innerHeight;
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }, [curvePoints, maxQ, maxP]);

  // Coordenadas del punto óptimo (Q*, P*)
  const optX = padLeft + (optResult.optimalDemand / maxQ) * innerWidth;
  const optY = padTop + innerHeight - (optResult.optimalPrice / maxP) * innerHeight;

  // Área sombreada del Beneficio Económico (Rectángulo de ganancia: [P* - CVU] * Q*)
  const cvuY = padTop + innerHeight - (params.variable_cost_unit / maxP) * innerHeight;

  return (
    <div className="space-y-6 pb-12">
      {/* Selector de Modelos de Demanda */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <LineChart className="w-5 h-5 text-indigo-400" />
            Laboratorio de Curvas Microeconómicas: Demanda, Costos y Utilidad
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visualización rigurosa de las cuatro curvas fundamentales: Demanda $Q(P)$, Costos $CT(Q)$, Ingreso Marginal e Intersección Óptima $IMg = CMg$.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveModel('linear')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeModel === 'linear'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            a. Demanda Lineal
          </button>
          <button
            onClick={() => setActiveModel('isoelastic')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeModel === 'isoelastic'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            b. Isoelástica
          </button>
          <button
            onClick={() => setActiveModel('wtp')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeModel === 'wtp'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            b. WTP Logit
          </button>
        </div>
      </div>

      {/* Gráfico Microeconómico Interactivo Marshalliano (P vs Q) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                Diagrama de Equilibrio Monopolístico & Margen de Lerner
              </h3>
              <p className="text-[11px] text-slate-400">
                Punto Óptimo: <strong className="text-emerald-400 font-mono">P* = ${optResult.optimalPrice.toFixed(2)}</strong> | <strong className="text-indigo-400 font-mono">Q* = {optResult.optimalDemand.toLocaleString()} uds</strong> | <strong className="text-white font-mono">Π* = ${optResult.maxProfit.toLocaleString()}</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-indigo-400">
                <span className="w-3 h-0.5 bg-indigo-500 inline-block"></span> Demanda P(Q)
              </span>
              <span className="flex items-center gap-1.5 text-pink-400">
                <span className="w-3 h-0.5 bg-pink-500 inline-block"></span> Ingreso Marginal (IMg)
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-3 h-0.5 bg-amber-500 inline-block"></span> Costo Marginal (CMg)
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span> Óptimo (P*, Q*)
              </span>
            </div>
          </div>

          {/* Gráfico SVG */}
          <div className="relative bg-slate-950 rounded-xl border border-slate-800/80 p-2 overflow-hidden">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-80 select-none">
              {/* Ejes */}
              <line x1={padLeft} y1={padTop} x2={padLeft} y2={svgHeight - padBottom} stroke="#334155" strokeWidth="1.5" />
              <line x1={padLeft} y1={svgHeight - padBottom} x2={svgWidth - padRight} stroke="#334155" strokeWidth="1.5" />

              {/* Grid Lines */}
              <line x1={padLeft} y1={padTop + innerHeight / 2} x2={svgWidth - padRight} y2={padTop + innerHeight / 2} stroke="#1e293b" strokeDasharray="3 3" />
              <line x1={padLeft + innerWidth / 2} y1={padTop} x2={padLeft + innerWidth / 2} y2={svgHeight - padBottom} stroke="#1e293b" strokeDasharray="3 3" />

              {/* Labels Ejes */}
              <text x={padLeft + innerWidth / 2} y={svgHeight - 12} fill="#94a3b8" fontSize="11" textAnchor="middle" fontFamily="sans-serif">
                Cantidad Demandada Q (Uds) →
              </text>
              <text x={18} y={padTop + innerHeight / 2} fill="#94a3b8" fontSize="11" textAnchor="middle" transform={`rotate(-90 18,${padTop + innerHeight / 2})`} fontFamily="sans-serif">
                Precio Unitario ($ / ud) →
              </text>

              {/* Área del Beneficio Económico (Sombreado Verde Esmeralda) */}
              <rect
                x={padLeft}
                y={optY}
                width={Math.max(0, optX - padLeft)}
                height={Math.max(0, cvuY - optY)}
                fill="#10b981"
                fillOpacity="0.15"
                stroke="#10b981"
                strokeWidth="1"
                strokeDasharray="4 2"
              />

              {/* Área del Excedente del Consumidor (Sombreado Azul/Índigo) */}
              <polygon
                points={`${padLeft},${padTop} ${optX},${optY} ${padLeft},${optY}`}
                fill="#6366f1"
                fillOpacity="0.12"
              />

              {/* Curvas */}
              <path d={demandPath} fill="none" stroke="#6366f1" strokeWidth="3" />
              <path d={imgPath} fill="none" stroke="#ec4899" strokeWidth="2" strokeDasharray="5 3" />
              <path d={cmgPath} fill="none" stroke="#f59e0b" strokeWidth="2.5" />

              {/* Líneas proyectadas al punto óptimo */}
              <line x1={optX} y1={optY} x2={optX} y2={svgHeight - padBottom} stroke="#10b981" strokeDasharray="2 2" strokeWidth="1.5" />
              <line x1={padLeft} y1={optY} x2={optX} y2={optY} stroke="#10b981" strokeDasharray="2 2" strokeWidth="1.5" />

              {/* Punto Óptimo */}
              <circle cx={optX} cy={optY} r={7} fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />

              {/* Textos en el gráfico */}
              <text x={optX + 10} y={optY - 10} fill="#10b981" fontSize="11" fontWeight="bold" fontFamily="monospace">
                Óptimo (P*=${optResult.optimalPrice}, Q*={optResult.optimalDemand})
              </text>
              <text x={padLeft + 10} y={optY + 18} fill="#10b981" fontSize="10" fontFamily="sans-serif">
                Margen: +${optResult.unitMargin} / ud
              </text>
              <text x={padLeft + 10} y={optY - 15} fill="#818cf8" fontSize="10" fontFamily="sans-serif">
                Excedente Consumidor (${optResult.consumerSurplus.toLocaleString()})
              </text>
            </svg>
          </div>

          {/* Explicación de las Curvas en el Diagrama */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="font-semibold text-indigo-400 block mb-1">Curva de Demanda:</span>
              <p className="text-slate-400 text-[11px]">
                Relación de disposición a pagar. A menor precio, más consumidores deciden adquirir el bien.
              </p>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="font-semibold text-pink-400 block mb-1">Ingreso Marginal (IMg):</span>
              <p className="text-slate-400 text-[11px]">
                Ingreso neto adicional por vender una unidad extra. Para demanda lineal, su pendiente es el doble (-2b).
              </p>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="font-semibold text-amber-400 block mb-1">Costo Marginal (CMg):</span>
              <p className="text-slate-400 text-[11px]">
                Costo variable unitario ($CVU$) más deseconomías de escala ($\gamma Q^2$). Interseca a IMg en $Q^*$.
              </p>
            </div>
          </div>
        </div>

        {/* Panel de Control de Parámetros Económicos */}
        <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Parámetros de Calibración
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Inputs Microeconómicos</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Parámetro A (Demanda Autónoma) */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Demanda Autónoma (a):</span>
                <span className="font-mono text-indigo-400 font-bold">{params.a} uds</span>
              </div>
              <input
                type="range"
                min="500"
                max="15000"
                step="100"
                value={params.a}
                onChange={(e) => onUpdateParams({ ...params, a: Number(e.target.value) })}
                className="w-full accent-indigo-500 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block mt-0.5">Saturación del mercado si P = 0</span>
            </div>

            {/* Parámetro B (Sensibilidad al precio) */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Sensibilidad al Precio (b):</span>
                <span className="font-mono text-indigo-400 font-bold">{params.b}</span>
              </div>
              <input
                type="range"
                min="1"
                max="800"
                step="5"
                value={params.b}
                onChange={(e) => onUpdateParams({ ...params, b: Number(e.target.value) })}
                className="w-full accent-indigo-500 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block mt-0.5">Unidades perdidas por cada $1 de subida</span>
            </div>

            {/* Costo Variable Unitario (CVU) */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Costo Variable Unitario (CVU):</span>
                <span className="font-mono text-emerald-400 font-bold">${params.variable_cost_unit.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="150"
                step="0.5"
                value={params.variable_cost_unit}
                onChange={(e) => onUpdateParams({ ...params, variable_cost_unit: Number(e.target.value) })}
                className="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block mt-0.5">Piso mínimo económico (Floor price)</span>
            </div>

            {/* Costo Fijo (CF) */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Costos Fijos Totales (CF):</span>
                <span className="font-mono text-amber-400 font-bold">${params.fixed_cost.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="500"
                max="80000"
                step="500"
                value={params.fixed_cost}
                onChange={(e) => onUpdateParams({ ...params, fixed_cost: Number(e.target.value) })}
                className="w-full accent-amber-500 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block mt-0.5">Determina el punto de equilibrio (Break-even)</span>
            </div>
          </div>

          {/* Tarjeta de Métricas Óptimas Calculadas */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
              Métricas Clave en el Óptimo
            </span>

            <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Margen Unitario (P* - CVU):</span>
              <span className="font-mono text-emerald-400 font-bold">+${optResult.unitMargin} ({optResult.marginPercentage}%)</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Índice de Lerner (Poder):</span>
              <span className="font-mono text-indigo-300 font-bold">{optResult.lernerIndex}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Elasticidad Puntual (ε*):</span>
              <span className="font-mono text-pink-400 font-bold">{optResult.pointElasticity}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">Punto de Equilibrio (Q_be):</span>
              <span className="font-mono text-amber-300 font-bold">{optResult.breakEvenQuantity.toLocaleString()} uds</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
