import React, { useState, useMemo } from 'react';
import { EconomicParameters, SectorType } from '../types/demand';
import { optimizeProfitLinear, evaluateDemandLinear, evaluateTotalCost } from '../utils/mathEconomics';
import { 
  Sliders, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  BarChart,
  Percent,
  RefreshCw
} from 'lucide-react';

interface ScenarioSimulatorProps {
  selectedSector: SectorType;
  params: EconomicParameters;
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({
  selectedSector,
  params,
}) => {
  // Precio de prueba interactivo (Sandbox)
  const baseOptimal = useMemo(() => optimizeProfitLinear(params), [params]);
  const [testPrice, setTestPrice] = useState<number>(baseOptimal.optimalPrice);
  const [costInflationPercent, setCostInflationPercent] = useState<number>(0);
  const [marketingBudget, setMarketingBudget] = useState<number>(params.fixed_cost * 0.2);

  // Parámetros ajustados por simulación sandbox
  const simulatedParams = useMemo(() => {
    const factorCVU = 1 + costInflationPercent / 100;
    return {
      ...params,
      variable_cost_unit: params.variable_cost_unit * factorCVU,
      fixed_cost: params.fixed_cost + marketingBudget,
    };
  }, [params, costInflationPercent, marketingBudget]);

  const simulatedOptimal = useMemo(() => optimizeProfitLinear(simulatedParams), [simulatedParams]);

  // Resultados del Sandbox con testPrice
  const sandboxResults = useMemo(() => {
    const q = evaluateDemandLinear(testPrice, simulatedParams);
    const revenue = testPrice * q;
    const cost = evaluateTotalCost(q, simulatedParams);
    const profit = revenue - cost;
    const unitMargin = testPrice - simulatedParams.variable_cost_unit;
    const marginPercent = testPrice > 0 ? (unitMargin / testPrice) * 100 : 0;
    const breakEven = unitMargin > 0 ? Math.round(simulatedParams.fixed_cost / unitMargin) : 0;

    const profitDiff = profit - baseOptimal.maxProfit;
    const profitDiffPercent = baseOptimal.maxProfit > 0 ? (profitDiff / baseOptimal.maxProfit) * 100 : 0;

    return {
      q: Math.round(q),
      revenue: Math.round(revenue),
      cost: Math.round(cost),
      profit: Math.round(profit),
      unitMargin: Number(unitMargin.toFixed(2)),
      marginPercent: Number(marginPercent.toFixed(1)),
      breakEven,
      profitDiff: Math.round(profitDiff),
      profitDiffPercent: Number(profitDiffPercent.toFixed(1)),
    };
  }, [testPrice, simulatedParams, baseOptimal]);

  // Comparativa de 3 Escenarios Predefinidos:
  // 1. Conservador (Defensivo / Alto Margen unitario)
  // 2. Base (Óptimo Analítico P*)
  // 3. Expansión Agresiva (Bajo precio, alto volumen)
  const threeScenarios = useMemo(() => {
    // Escenario 1: Conservador (+15% precio sobre óptimo)
    const pConservador = baseOptimal.optimalPrice * 1.15;
    const qConservador = evaluateDemandLinear(pConservador, params);
    const revConservador = pConservador * qConservador;
    const costConservador = evaluateTotalCost(qConservador, params);
    const profConservador = revConservador - costConservador;

    // Escenario 2: Base (P*)
    const pBase = baseOptimal.optimalPrice;
    const qBase = baseOptimal.optimalDemand;
    const profBase = baseOptimal.maxProfit;

    // Escenario 3: Expansión Agresiva (-15% precio, mayor volumen)
    const pExpansion = Math.max(params.variable_cost_unit * 1.1, baseOptimal.optimalPrice * 0.85);
    const qExpansion = evaluateDemandLinear(pExpansion, params);
    const revExpansion = pExpansion * qExpansion;
    const costExpansion = evaluateTotalCost(qExpansion, params);
    const profExpansion = revExpansion - costExpansion;

    return [
      {
        id: 'conservador',
        name: 'Escenario Conservador (Alto Margen)',
        badge: 'Defensivo',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        price: Number(pConservador.toFixed(2)),
        demand: Math.round(qConservador),
        revenue: Math.round(revConservador),
        profit: Math.round(profConservador),
        unitMargin: Number((pConservador - params.variable_cost_unit).toFixed(2)),
        marginPercent: Number((((pConservador - params.variable_cost_unit) / pConservador) * 100).toFixed(1)),
        desc: 'Prioriza rentabilidad unitaria y preservación de caja ante incertidumbre.',
      },
      {
        id: 'base',
        name: 'Escenario Base (Óptimo Matemático)',
        badge: 'Máximo Beneficio',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        price: Number(pBase.toFixed(2)),
        demand: Math.round(qBase),
        revenue: Math.round(baseOptimal.totalRevenue),
        profit: Math.round(profBase),
        unitMargin: Number((pBase - params.variable_cost_unit).toFixed(2)),
        marginPercent: Number(baseOptimal.marginPercentage.toFixed(1)),
        desc: 'Maximiza el beneficio económico total donde el Ingreso Marginal iguala al Costo Marginal.',
      },
      {
        id: 'expansion',
        name: 'Escenario Expansión Agresiva (Volumen)',
        badge: 'Cuota de Mercado',
        badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
        price: Number(pExpansion.toFixed(2)),
        demand: Math.round(qExpansion),
        revenue: Math.round(revExpansion),
        profit: Math.round(profExpansion),
        unitMargin: Number((pExpansion - params.variable_cost_unit).toFixed(2)),
        marginPercent: Number((((pExpansion - params.variable_cost_unit) / pExpansion) * 100).toFixed(1)),
        desc: 'Gana tracción y clientes rápidamente sacrificando parte del margen neto.',
      },
    ];
  }, [params, baseOptimal]);

  // Curva de Beneficio SVG: Pi(P)
  const profitCurveData = useMemo(() => {
    const minP = params.variable_cost_unit * 0.9;
    const maxP = (params.a / params.b) * 0.95;
    const steps = 50;
    const stepSize = (maxP - minP) / steps;
    const points: Array<{ p: number; profit: number }> = [];

    for (let i = 0; i <= steps; i++) {
      const p = minP + i * stepSize;
      const q = evaluateDemandLinear(p, simulatedParams);
      const profit = p * q - evaluateTotalCost(q, simulatedParams);
      points.push({ p, profit });
    }

    const minProf = Math.min(...points.map(pt => pt.profit));
    const maxProf = Math.max(...points.map(pt => pt.profit), 100);

    return { points, minP, maxP, minProf, maxProf };
  }, [simulatedParams, params]);

  // Generar path SVG para Pi(P)
  const svgW = 540;
  const svgH = 220;
  const padL = 55;
  const padR = 25;
  const padT = 25;
  const padB = 35;
  const inW = svgW - padL - padR;
  const inH = svgH - padT - padB;

  const profitPath = useMemo(() => {
    const { points, minP, maxP, minProf, maxProf } = profitCurveData;
    const pRange = maxP - minP || 1;
    const profRange = maxProf - minProf || 1;

    return points
      .map((pt, idx) => {
        const x = padL + ((pt.p - minP) / pRange) * inW;
        const y = padT + inH - ((pt.profit - minProf) / profRange) * inH;
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }, [profitCurveData, inW, inH]);

  // Coordenadas del punto actual probado en el Sandbox
  const testDot = useMemo(() => {
    const { minP, maxP, minProf, maxProf } = profitCurveData;
    const pRange = maxP - minP || 1;
    const profRange = maxProf - minProf || 1;
    const x = padL + ((testPrice - minP) / pRange) * inW;
    const y = padT + inH - ((sandboxResults.profit - minProf) / profRange) * inH;
    return { x, y };
  }, [testPrice, sandboxResults.profit, profitCurveData, inW, inH]);

  return (
    <div className="space-y-6 pb-12">
      {/* Encabezado */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            Simulador de Escenarios Financieros & Optimización de Beneficio
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Sandbox interactivo para evaluar choques de costos, inversión de marketing y desvíos respecto al precio óptimo $P^*$.
          </p>
        </div>

        <button
          onClick={() => {
            setTestPrice(baseOptimal.optimalPrice);
            setCostInflationPercent(0);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Restablecer Óptimo P*</span>
        </button>
      </div>

      {/* Sandbox de Simulación en Tiempo Real */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controles de Simulación */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              Palancas de Simulación (Sandbox)
            </h3>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">
              Tiempo Real
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Slider de Precio a Probar */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-slate-200">Precio de Decisión a Evaluar:</span>
                <span className="font-mono text-base font-bold text-emerald-400">
                  ${testPrice.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={(simulatedParams.variable_cost_unit * 1.05).toFixed(1)}
                max={((params.a / params.b) * 0.95).toFixed(1)}
                step="0.05"
                value={testPrice}
                onChange={(e) => setTestPrice(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Piso CVU (${simulatedParams.variable_cost_unit.toFixed(2)})</span>
                <span className="text-indigo-400 font-semibold">Óptimo P* (${baseOptimal.optimalPrice.toFixed(2)})</span>
                <span>Choke Price (${(params.a / params.b).toFixed(2)})</span>
              </div>
            </div>

            {/* Slider de Choque de Costos / Inflación */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Choque de Costos Variables (Inflación CVU):</span>
                <span className={`font-mono font-bold ${costInflationPercent > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                  {costInflationPercent > 0 ? `+${costInflationPercent}%` : `${costInflationPercent}%`}
                </span>
              </div>
              <input
                type="range"
                min="-20"
                max="50"
                step="5"
                value={costInflationPercent}
                onChange={(e) => setCostInflationPercent(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Simula aumento de materias primas o logística en el costo marginal.
              </span>
            </div>

            {/* Presupuesto de Marketing Fijo Adicional */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Presupuesto Adicional de Campaña Mkt:</span>
                <span className="font-mono font-bold text-indigo-400">${marketingBudget.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="0"
                max={params.fixed_cost}
                step="500"
                value={marketingBudget}
                onChange={(e) => setMarketingBudget(Number(e.target.value))}
                className="w-full accent-indigo-500 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Incrementa los costos fijos totales a cubrir en el break-even.
              </span>
            </div>
          </div>

          {/* Comparativa Directa con el Óptimo */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Diagnóstico Frente al Óptimo P*
            </span>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Variación de Beneficio:</span>
              <span
                className={`font-mono font-bold flex items-center gap-1 ${
                  sandboxResults.profitDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {sandboxResults.profitDiff >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {sandboxResults.profitDiff >= 0 ? `+$${sandboxResults.profitDiff.toLocaleString()}` : `-$${Math.abs(sandboxResults.profitDiff).toLocaleString()}`}
                ({sandboxResults.profitDiffPercent}%)
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-slate-800/80">
              {Math.abs(testPrice - baseOptimal.optimalPrice) < 0.1
                ? '¡Te encuentras en la cresta de rentabilidad óptima!'
                : testPrice > baseOptimal.optimalPrice
                ? 'El precio está en zona de sobreprecio: el margen unitario es alto pero pierdes demasiado volumen demandado.'
                : 'El precio está en zona de penetración: el volumen sube pero dejas dinero sobre la mesa por margen insuficiente.'}
            </p>
          </div>
        </div>

        {/* Tablero de Resultados Financieros & Gráfico Curva Pi(P) */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Demanda Estimada</span>
              <span className="text-lg font-bold text-indigo-400 font-mono mt-1 block">
                {sandboxResults.q.toLocaleString()} uds
              </span>
              <span className="text-[10px] text-slate-500">Volumen vendido</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Margen Unitario</span>
              <span className="text-lg font-bold text-emerald-400 font-mono mt-1 block">
                +${sandboxResults.unitMargin}
              </span>
              <span className="text-[10px] text-slate-500">{sandboxResults.marginPercent}% de margen</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Beneficio Neto (Π)</span>
              <span className="text-lg font-bold text-white font-mono mt-1 block">
                ${sandboxResults.profit.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500">Ingresos - Costos</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Punto Equilibrio</span>
              <span className="text-lg font-bold text-amber-400 font-mono mt-1 block">
                {sandboxResults.breakEven.toLocaleString()} uds
              </span>
              <span className="text-[10px] text-slate-500">Break-even mínimo</span>
            </div>
          </div>

          {/* Gráfico SVG Curva de Beneficio en función de P: Pi(P) */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <BarChart className="w-3.5 h-3.5 text-emerald-400" />
                Curva de Beneficio Total vs Nivel de Precio: Π(P)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Cresta máxima en P* = ${simulatedOptimal.optimalPrice.toFixed(2)}
              </span>
            </div>

            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-52 select-none">
              {/* Ejes */}
              <line x1={padL} y1={padT} x2={padL} y2={svgH - padB} stroke="#334155" strokeWidth="1" />
              <line x1={padL} y1={svgH - padB} x2={svgW - padR} stroke="#334155" strokeWidth="1" />

              {/* Labels Ejes */}
              <text x={padL + inW / 2} y={svgH - 10} fill="#94a3b8" fontSize="10" textAnchor="middle">
                Precio Unitario Seleccionado ($) →
              </text>
              <text x={18} y={padT + inH / 2} fill="#94a3b8" fontSize="10" textAnchor="middle" transform={`rotate(-90 18,${padT + inH / 2})`}>
                Beneficio Neto ($) →
              </text>

              {/* Curva Pi(P) */}
              <path d={profitPath} fill="none" stroke="#10b981" strokeWidth="2.5" />

              {/* Punto actual evaluado */}
              <line x1={testDot.x} y1={testDot.y} x2={testDot.x} y2={svgH - padB} stroke="#6366f1" strokeDasharray="3 3" />
              <circle cx={testDot.x} cy={testDot.y} r={6} fill="#6366f1" stroke="#ffffff" strokeWidth="2" />
              <text x={testDot.x + 8} y={testDot.y - 8} fill="#818cf8" fontSize="10" fontWeight="bold" fontFamily="monospace">
                P=${testPrice.toFixed(2)} (Π=${sandboxResults.profit.toLocaleString()})
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* Matriz Comparativa de los 3 Escenarios Predefinidos */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            Matriz Comparativa de 3 Escenarios Estratégicos
          </h3>
          <span className="text-xs text-slate-400">Análisis para Comité Ejecutivo de Pricing</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {threeScenarios.map((sc) => (
            <div
              key={sc.id}
              className={`p-4 rounded-xl border flex flex-col justify-between transition ${
                sc.id === 'base'
                  ? 'bg-emerald-950/20 border-emerald-500/40 ring-1 ring-emerald-500/20'
                  : 'bg-slate-950/80 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${sc.badgeColor}`}>
                    {sc.badge}
                  </span>
                  <span className="text-xs font-mono font-bold text-white">${sc.price.toFixed(2)}</span>
                </div>

                <h4 className="font-semibold text-slate-200 text-xs mb-1">{sc.name}</h4>
                <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">{sc.desc}</p>

                <div className="space-y-1.5 text-[11px] font-mono border-t border-slate-800/80 pt-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Demanda esperada:</span>
                    <span className="text-indigo-300 font-semibold">{sc.demand.toLocaleString()} uds</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ingresos Totales:</span>
                    <span className="text-slate-200">${sc.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Margen unitario:</span>
                    <span className="text-emerald-400 font-semibold">+${sc.unitMargin} ({sc.marginPercent}%)</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800 flex justify-between items-center">
                <span className="text-xs font-medium text-slate-400">Beneficio Neto Total:</span>
                <span className={`text-sm font-bold font-mono ${sc.id === 'base' ? 'text-emerald-400' : 'text-white'}`}>
                  ${sc.profit.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
