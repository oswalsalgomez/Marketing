import React, { useState, useMemo } from 'react';
import { EconomicParameters, SectorType } from '../types/demand';
import { 
  simulateLaunchStrategies, 
  simulateCompetitionGame, 
  simulateComplementaryBundle 
} from '../utils/mathEconomics';
import { 
  Target, 
  Rocket, 
  Swords, 
  Package, 
  TrendingUp, 
  DollarSign, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface PricingPoliciesProps {
  selectedSector: SectorType;
  params: EconomicParameters;
  baseOptimalPrice: number;
}

type PolicySubTab = 'launch' | 'competition' | 'complementary';

export const PricingPolicies: React.FC<PricingPoliciesProps> = ({
  selectedSector,
  params,
  baseOptimalPrice,
}) => {
  const [subTab, setSubTab] = useState<PolicySubTab>('launch');

  // 1. Simulación de Lanzamiento
  const launchData = useMemo(() => {
    return simulateLaunchStrategies(baseOptimalPrice, params.variable_cost_unit);
  }, [baseOptimalPrice, params.variable_cost_unit]);

  // 2. Simulación de Competencia
  const [compPriceSlider, setCompPriceSlider] = useState<number>(params.competitor_price);
  const [crossElastSlider, setCrossElastSlider] = useState<number>(params.cross_price_elasticity);

  const competitionSim = useMemo(() => {
    return simulateCompetitionGame(
      baseOptimalPrice,
      compPriceSlider,
      crossElastSlider,
      params.variable_cost_unit,
      params.variable_cost_unit * 0.95
    );
  }, [baseOptimalPrice, compPriceSlider, crossElastSlider, params.variable_cost_unit]);

  // 3. Simulación de Productos Complementarios (Two-part tariff y Bundling)
  const [bundleDiscount, setBundleDiscount] = useState<number>(15); // 15% descuento en paquete
  const [productAPrice, setProductAPrice] = useState<number>(baseOptimalPrice);
  const [productACost, setProductACost] = useState<number>(params.variable_cost_unit);
  const [productBPrice, setProductBPrice] = useState<number>(baseOptimalPrice * 0.35);
  const [productBCost, setProductBCost] = useState<number>(params.variable_cost_unit * 0.15);
  const [bRatio, setBRatio] = useState<number>(4); // 4 consumibles por producto principal al año

  const bundleSim = useMemo(() => {
    return simulateComplementaryBundle(
      productAPrice,
      productACost,
      productBPrice,
      productBCost,
      bRatio,
      bundleDiscount
    );
  }, [productAPrice, productACost, productBPrice, productBCost, bRatio, bundleDiscount]);

  return (
    <div className="space-y-6 pb-12">
      {/* Encabezado con selector de sub-políticas */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-400" />
            Políticas Estratégicas de Fijación de Precios
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Simulación cuantitativa de las tres estrategias comerciales críticas: Lanzamiento, Reacción Competitiva y Ecosistema de Productos Complementarios.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setSubTab('launch')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              subTab === 'launch' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>a. Lanzamiento</span>
          </button>
          <button
            onClick={() => setSubTab('competition')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              subTab === 'competition' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>b. Competencia</span>
          </button>
          <button
            onClick={() => setSubTab('complementary')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              subTab === 'complementary' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>c. Complementarios</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB A: ESTRATEGIA DE LANZAMIENTO */}
      {subTab === 'launch' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <Rocket className="w-4 h-4" />
                Descreme de Precios (Price Skimming)
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                El producto entra a un precio <strong>+45% superior al óptimo estático</strong> para capturar el excedente de los <em>Early Adopters</em> (clientes inelásticos dispuestos a pagar por exclusividad o novedad). Posteriormente, el precio desciende de forma programada a medida que ingresa competencia o madura la curva de adopción.
              </p>
              <div className="text-[11px] text-slate-400 pt-1">
                <strong>Recomendado para:</strong> Tecnologías disruptivas, moda exclusiva o patentes protegidas.
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <TrendingUp className="w-4 h-4" />
                Penetración de Mercado (Market Penetration)
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                El precio se fija inicialmente un <strong>-22% por debajo del óptimo</strong> para acelerar la prueba masiva, generar barreras de entrada a rivales y crear efectos de red. Tras asegurar una cuota de mercado sólida, el precio sube paulatinamente hacia el equilibrio de rentabilidad.
              </p>
              <div className="text-[11px] text-slate-400 pt-1">
                <strong>Recomendado para:</strong> Productos CPG de supermercado, plataformas SaaS y mercados con alta sustitución.
              </div>
            </div>
          </div>

          {/* Tabla Comparativa de Trayectorias Temporales (T1 a T8) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden p-5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Proyección de Trayectoria en 8 Períodos: Precios, Volúmenes y Beneficios
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase font-mono border-b border-slate-800">
                    <th className="py-2.5 px-3">Período</th>
                    <th className="py-2.5 px-3 text-indigo-400">P (Skimming)</th>
                    <th className="py-2.5 px-3 text-indigo-300">Q (Skimming)</th>
                    <th className="py-2.5 px-3 text-indigo-200">Beneficio (Skimming)</th>
                    <th className="py-2.5 px-3 text-emerald-400">P (Penetración)</th>
                    <th className="py-2.5 px-3 text-emerald-300">Q (Penetración)</th>
                    <th className="py-2.5 px-3 text-emerald-200">Beneficio (Penetración)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono text-slate-300 text-[11px]">
                  {launchData.skimming.map((skim, idx) => {
                    const pen = launchData.penetration[idx];
                    return (
                      <tr key={skim.period} className="hover:bg-slate-800/40">
                        <td className="py-2 px-3 font-bold text-slate-400">{skim.period}</td>
                        <td className="py-2 px-3 text-indigo-400 font-semibold">${skim.price.toFixed(2)}</td>
                        <td className="py-2 px-3">{skim.demand.toLocaleString()} uds</td>
                        <td className="py-2 px-3 text-indigo-300 font-semibold">${skim.profit.toLocaleString()}</td>
                        <td className="py-2 px-3 text-emerald-400 font-semibold">${pen.price.toFixed(2)}</td>
                        <td className="py-2 px-3">{pen.demand.toLocaleString()} uds</td>
                        <td className="py-2 px-3 text-emerald-300 font-semibold">${pen.profit.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB B: FRENTE A LA COMPETENCIA */}
      {subTab === 'competition' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Controles de Parámetros de Competencia */}
            <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Swords className="w-4 h-4 text-emerald-400" />
                Variables de Interacción Competitiva
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Precio del Competidor Directo:</span>
                    <span className="font-mono text-emerald-400 font-bold">${compPriceSlider.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={(params.variable_cost_unit * 1.1).toFixed(1)}
                    max={(baseOptimalPrice * 1.8).toFixed(1)}
                    step="0.1"
                    value={compPriceSlider}
                    onChange={(e) => setCompPriceSlider(Number(e.target.value))}
                    className="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Nuestro precio base: ${baseOptimalPrice.toFixed(2)}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Elasticidad Cruzada de la Demanda (ε_xy):</span>
                    <span className="font-mono text-indigo-400 font-bold">+{crossElastSlider.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.5"
                    step="0.05"
                    value={crossElastSlider}
                    onChange={(e) => setCrossElastSlider(Number(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Porcentaje en que cae nuestra demanda si el rival descuenta un 1% su precio.
                  </span>
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                <span className="font-semibold text-white block">Regla Estratégica:</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {competitionSim.recommendation}
                </p>
              </div>
            </div>

            {/* Matriz 2x2 de Teoría de Juegos (Dilema de Bertrand) */}
            <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Matriz de Pagos 2x2: Guerra de Precios vs Precios Cooperativos
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">Beneficio (Nosotros, Competidor)</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Cuadrante 1: Cooperativo (Alto, Alto) */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-emerald-500/30">
                  <div className="flex items-center justify-between text-emerald-400 font-semibold mb-1">
                    <span>Ambos Precio Alto (Cooperativo)</span>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-base font-bold font-mono text-white mt-1">
                    +${competitionSim.matrix.high_high.profit1.toLocaleString()} , +${competitionSim.matrix.high_high.profit2.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Máximo beneficio conjunto para la industria.
                  </span>
                </div>

                {/* Cuadrante 2: Descuento Unilateral Nuestro */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-indigo-400 font-semibold mb-1">
                    Nosotros Descontamos / Rival No
                  </div>
                  <div className="text-base font-bold font-mono text-white mt-1">
                    +${competitionSim.matrix.low_high.profit1.toLocaleString()} , +${competitionSim.matrix.low_high.profit2.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Robamos cuota temporal pero inducimos represalia.
                  </span>
                </div>

                {/* Cuadrante 3: Descuento Unilateral Rival */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-amber-400 font-semibold mb-1">
                    Rival Descuenta / Nosotros No
                  </div>
                  <div className="text-base font-bold font-mono text-white mt-1">
                    +${competitionSim.matrix.high_low.profit1.toLocaleString()} , +${competitionSim.matrix.high_low.profit2.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Perdemos volumen significativo por elasticidad cruzada.
                  </span>
                </div>

                {/* Cuadrante 4: Guerra Mutua (Equilibrio de Nash) */}
                <div className="bg-rose-950/20 p-3.5 rounded-xl border border-rose-500/40">
                  <div className="flex items-center justify-between text-rose-400 font-semibold mb-1">
                    <span>Guerra de Precios (Nash Bertrand)</span>
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-base font-bold font-mono text-rose-300 mt-1">
                    +${competitionSim.matrix.low_low.profit1.toLocaleString()} , +${competitionSim.matrix.low_low.profit2.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-rose-400/80 mt-1 block">
                    Equilibrio destructivo donde el margen colapsa un ~40%.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB C: PRODUCTOS COMPLEMENTARIOS */}
      {subTab === 'complementary' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Controles de Precios y Costos de A y B */}
            <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Package className="w-4 h-4 text-pink-400" />
                Configuración del Ecosistema de Productos
              </h3>

              <div className="space-y-3 text-xs">
                {/* Producto A (Base) */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                  <span className="font-semibold text-indigo-300 block">Producto A (Equipo / Bien Base)</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Precio ($):</label>
                      <input
                        type="number"
                        value={productAPrice}
                        onChange={(e) => setProductAPrice(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 font-mono text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Costo Unit. ($):</label>
                      <input
                        type="number"
                        value={productACost}
                        onChange={(e) => setProductACost(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 font-mono text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Producto B (Consumible / Add-on) */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                  <span className="font-semibold text-emerald-300 block">Producto B (Consumible Recurrente / Add-on)</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Precio ($):</label>
                      <input
                        type="number"
                        value={productBPrice}
                        onChange={(e) => setProductBPrice(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 font-mono text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Costo Unit. ($):</label>
                      <input
                        type="number"
                        value={productBCost}
                        onChange={(e) => setProductBCost(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 font-mono text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Descuento del Bundle */}
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Descuento por Paquete Conjunto (Bundle):</span>
                    <span className="font-mono font-bold text-pink-400">{bundleDiscount}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    step="5"
                    value={bundleDiscount}
                    onChange={(e) => setBundleDiscount(Number(e.target.value))}
                    className="w-full accent-pink-500 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Comparación de Resultados: Individual vs Bundle vs Razor & Blade */}
            <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Comparativa de Rentabilidad del Ecosistema Consolidado
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* 1. Venta Separada */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Modelo 1</span>
                    <h4 className="font-semibold text-slate-200 text-xs mt-0.5">Venta Aislada</h4>
                    <p className="text-slate-400 text-[11px] mt-1">Precios individuales sin sinergia comercial.</p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Beneficio Conjunto:</span>
                    <span className="text-base font-bold font-mono text-white">
                      ${bundleSim.separate.totalProfit.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 2. Bundle Paquete */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-pink-500/30 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-pink-400 uppercase font-mono block">Modelo 2</span>
                    <h4 className="font-semibold text-white text-xs mt-0.5">Bundle con Descuento</h4>
                    <p className="text-slate-400 text-[11px] mt-1">
                      Precio conjunto: ${bundleSim.bundle.bundledPrice} (-{bundleDiscount}%).
                    </p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Beneficio Conjunto:</span>
                    <span className="text-base font-bold font-mono text-pink-400">
                      ${bundleSim.bundle.totalProfit.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 3. Razor & Blade */}
                <div className="bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-500/40 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-emerald-400 uppercase font-mono block">Modelo 3</span>
                    <h4 className="font-semibold text-white text-xs mt-0.5">Cuchilla y Hoja</h4>
                    <p className="text-slate-400 text-[11px] mt-1">
                      A subsidiado (${bundleSim.razorBlade.subsidizedPriceA}) + B de alto margen.
                    </p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Beneficio Conjunto:</span>
                    <span className="text-base font-bold font-mono text-emerald-400">
                      ${bundleSim.razorBlade.totalProfit.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300">
                <span className="font-semibold text-emerald-400 block mb-1">Conclusión de Subsidio Cruzado:</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  El modelo <strong>Cuchilla y Hoja (Razor-and-blade)</strong> incrementa la base instalada de clientes en un 45%, generando flujos continuos de ingresos recurrentes a través del bien complementario B, superando la rentabilidad de las ventas aisladas en un <strong>+{(((bundleSim.razorBlade.totalProfit - bundleSim.separate.totalProfit) / bundleSim.separate.totalProfit) * 100).toFixed(1)}%</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
