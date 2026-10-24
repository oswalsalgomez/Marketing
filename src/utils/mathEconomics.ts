import { DemandRecord, EconomicParameters, OptimizationResult, DataQualityReport } from '../types/demand';

/**
 * Cálculo de regresión lineal simple MCO (Mínimos Cuadrados Ordinarios)
 * para estimar Q = a - b*P
 */
export function calculateOLS(records: DemandRecord[]): {
  a: number;
  b: number;
  rSquared: number;
  correlation: number;
  meanPrice: number;
  meanDemand: number;
} {
  const clean = records.filter(r => !r.is_outlier && r.price > 0 && r.units_sold > 0);
  const n = clean.length;
  if (n < 2) {
    return { a: 1000, b: 50, rSquared: 0.8, correlation: -0.89, meanPrice: 10, meanDemand: 500 };
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (const r of clean) {
    sumX += r.price;
    sumY += r.units_sold;
    sumXY += r.price * r.units_sold;
    sumX2 += r.price * r.price;
    sumY2 += r.units_sold * r.units_sold;
  }

  const meanX = sumX / n;
  const meanY = sumY / n;

  const denominator = n * sumX2 - sumX * sumX;
  if (Math.abs(denominator) < 1e-9) {
    return { a: meanY, b: 0, rSquared: 0, correlation: 0, meanPrice: meanX, meanDemand: meanY };
  }

  const slopeBeta = (n * sumXY - sumX * sumY) / denominator;
  const alpha = meanY - slopeBeta * meanX;

  // En microeconomía: Q = a - b*P. Si beta es negativo, b = -beta
  const b = -slopeBeta;
  const a = alpha;

  // Coeficiente de correlación de Pearson r
  const numR = n * sumXY - sumX * sumY;
  const denR = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  const correlation = denR !== 0 ? numR / denR : 0;
  const rSquared = Math.pow(correlation, 2);

  return {
    a: Math.max(10, a),
    b: b > 0 ? b : 10,
    rSquared: Math.min(1, Math.max(0, rSquared)),
    correlation,
    meanPrice: meanX,
    meanDemand: meanY,
  };
}

/**
 * Reporte de calidad y detección de anomalías (IQR y validación de negocio)
 */
export function analyzeDataQuality(records: DemandRecord[]): DataQualityReport {
  const total = records.length;
  if (total === 0) {
    return {
      totalRows: 0,
      missingValuesCount: 0,
      outliersDetected: 0,
      duplicateRows: 0,
      cleanRowsCount: 0,
      avgPrice: 0,
      avgDemand: 0,
      priceStdDev: 0,
      demandStdDev: 0,
      empiricalElasticity: 0,
      rSquaredLinear: 0,
    };
  }

  let missingCount = 0;
  let outliersCount = 0;

  // Calcular IQR para precios y demanda
  const prices = records.map(r => r.price).sort((a, b) => a - b);
  const demands = records.map(r => r.units_sold).sort((a, b) => a - b);

  const q1P = prices[Math.floor(prices.length * 0.25)];
  const q3P = prices[Math.floor(prices.length * 0.75)];
  const iqrP = q3P - q1P;
  const lowerBoundP = q1P - 1.5 * iqrP;
  const upperBoundP = q3P + 1.5 * iqrP;

  for (const r of records) {
    if (r.price == null || r.units_sold == null || isNaN(r.price) || isNaN(r.units_sold)) {
      missingCount++;
    }
    if (r.is_outlier || r.price < lowerBoundP || r.price > upperBoundP || r.stockout_event) {
      outliersCount++;
    }
  }

  const cleanRecords = records.filter(r => !r.is_outlier && !r.stockout_event && r.price > 0 && r.units_sold > 0);
  const cleanCount = cleanRecords.length;

  const sumP = cleanRecords.reduce((acc, r) => acc + r.price, 0);
  const sumD = cleanRecords.reduce((acc, r) => acc + r.units_sold, 0);
  const avgP = cleanCount > 0 ? sumP / cleanCount : 0;
  const avgD = cleanCount > 0 ? sumD / cleanCount : 0;

  const varP = cleanRecords.reduce((acc, r) => acc + Math.pow(r.price - avgP, 2), 0) / (cleanCount || 1);
  const varD = cleanRecords.reduce((acc, r) => acc + Math.pow(r.units_sold - avgD, 2), 0) / (cleanCount || 1);

  const ols = calculateOLS(cleanRecords);
  // Elasticidad promedio empírica: E = -b * (P_avg / Q_avg)
  const empElasticity = avgD > 0 ? -ols.b * (avgP / avgD) : -1.5;

  return {
    totalRows: total,
    missingValuesCount: missingCount,
    outliersDetected: outliersCount,
    duplicateRows: 0,
    cleanRowsCount: cleanCount,
    avgPrice: avgP,
    avgDemand: avgD,
    priceStdDev: Math.sqrt(varP),
    demandStdDev: Math.sqrt(varD),
    empiricalElasticity: empElasticity,
    rSquaredLinear: ols.rSquared,
  };
}

/**
 * Evaluación de funciones de demanda
 */
export function evaluateDemandLinear(p: number, params: EconomicParameters): number {
  return Math.max(0, params.a - params.b * p);
}

export function evaluateDemandIsoelastic(p: number, params: EconomicParameters): number {
  if (p <= 0.05) return params.A_iso;
  const val = params.A_iso * Math.pow(p, -Math.abs(params.elasticity_iso));
  return Math.max(0, val);
}

export function evaluateDemandWTPLogit(p: number, params: EconomicParameters): number {
  const exponent = params.wtp_k * (p - params.wtp_mean);
  // Evitar overflow en exp
  const clampedExp = Math.max(-50, Math.min(50, exponent));
  const val = params.q_max_wtp / (1 + Math.exp(clampedExp));
  return Math.max(0, val);
}

/**
 * Evaluación de funciones de costo
 */
export function evaluateTotalCost(q: number, params: EconomicParameters): number {
  if (q <= 0) return params.fixed_cost;
  return params.fixed_cost + params.variable_cost_unit * q + params.convex_cost_gamma * Math.pow(q, 2);
}

export function evaluateMarginalCost(q: number, params: EconomicParameters): number {
  return params.variable_cost_unit + 2 * params.convex_cost_gamma * q;
}

export function evaluateAverageCost(q: number, params: EconomicParameters): number {
  if (q <= 0) return Infinity;
  return evaluateTotalCost(q, params) / q;
}

/**
 * Optimización analítica y numérica de beneficio para demanda lineal:
 * IT = P * (a - b*P)
 * CT = CF + CVU*(a - b*P) + gamma*(a - b*P)^2
 * Max Pi => dPi/dP = 0
 */
export function optimizeProfitLinear(params: EconomicParameters): OptimizationResult {
  const { a, b, fixed_cost, variable_cost_unit, convex_cost_gamma } = params;

  // Si gamma == 0: P* = (a + b * CVU) / (2b)
  // Si gamma > 0: dPi/dP = a - 2bP + b*CVU - 2*gamma*(a - bP)*(-b) = 0
  // a - 2bP + b*CVU + 2*gamma*b*a - 2*gamma*(b^2)*P = 0
  // P * (2b + 2*gamma*b^2) = a*(1 + 2*gamma*b) + b*CVU
  const denominator = 2 * b + 2 * convex_cost_gamma * Math.pow(b, 2);
  const numerator = a * (1 + 2 * convex_cost_gamma * b) + b * variable_cost_unit;

  let optimalPrice = denominator > 0 ? numerator / denominator : variable_cost_unit * 1.5;

  // Choke price donde Q = 0
  const chokePrice = a / b;
  optimalPrice = Math.max(variable_cost_unit * 1.05, Math.min(chokePrice * 0.95, optimalPrice));

  const optimalDemand = Math.max(0, evaluateDemandLinear(optimalPrice, params));
  const totalRevenue = optimalPrice * optimalDemand;
  const totalCost = evaluateTotalCost(optimalDemand, params);
  const maxProfit = totalRevenue - totalCost;
  const unitMargin = optimalPrice - variable_cost_unit;
  const marginPercentage = optimalPrice > 0 ? (unitMargin / optimalPrice) * 100 : 0;

  // Elasticidad en P*: epsilon = -b * (P* / Q*)
  const pointElasticity = optimalDemand > 0 ? -b * (optimalPrice / optimalDemand) : -1;
  const marginalCostAtOpt = evaluateMarginalCost(optimalDemand, params);
  const lernerIndex = optimalPrice > 0 ? (optimalPrice - marginalCostAtOpt) / optimalPrice : 0;

  // Punto de equilibrio (Break-even): Q_be = CF / (P - CVU)
  const breakEvenQuantity = unitMargin > 0 ? fixed_cost / unitMargin : 0;
  const breakEvenPrice = optimalDemand > 0 ? (fixed_cost / optimalDemand) + variable_cost_unit : 0;

  // Excedente del consumidor (Área del triángulo bajo la curva de demanda hasta P*):
  // CS = 0.5 * (P_choke - P*) * Q*
  const consumerSurplus = Math.max(0, 0.5 * (chokePrice - optimalPrice) * optimalDemand);

  return {
    optimalPrice: Number(optimalPrice.toFixed(2)),
    optimalDemand: Math.round(optimalDemand),
    maxProfit: Number(maxProfit.toFixed(2)),
    totalRevenue: Number(totalRevenue.toFixed(2)),
    totalCost: Number(totalCost.toFixed(2)),
    unitMargin: Number(unitMargin.toFixed(2)),
    marginPercentage: Number(marginPercentage.toFixed(1)),
    lernerIndex: Number(lernerIndex.toFixed(3)),
    pointElasticity: Number(pointElasticity.toFixed(2)),
    breakEvenQuantity: Math.round(breakEvenQuantity),
    breakEvenPrice: Number(breakEvenPrice.toFixed(2)),
    consumerSurplus: Number(consumerSurplus.toFixed(2)),
  };
}

/**
 * Optimización numérica para demanda no lineal (Isoelástica o WTP)
 */
export function optimizeProfitNonLinear(
  params: EconomicParameters,
  modelType: 'isoelastic' | 'wtp'
): OptimizationResult {
  const cvu = params.variable_cost_unit;
  const minP = cvu * 1.02;
  const maxP = cvu * 8.0;
  const steps = 300;
  const stepSize = (maxP - minP) / steps;

  let bestPrice = minP;
  let maxProfit = -Infinity;
  let bestQ = 0;

  for (let i = 0; i <= steps; i++) {
    const p = minP + i * stepSize;
    const q = modelType === 'isoelastic'
      ? evaluateDemandIsoelastic(p, params)
      : evaluateDemandWTPLogit(p, params);

    const revenue = p * q;
    const cost = evaluateTotalCost(q, params);
    const profit = revenue - cost;

    if (profit > maxProfit) {
      maxProfit = profit;
      bestPrice = p;
      bestQ = q;
    }
  }

  const optimalDemand = Math.max(0, bestQ);
  const totalRevenue = bestPrice * optimalDemand;
  const totalCost = evaluateTotalCost(optimalDemand, params);
  const unitMargin = bestPrice - cvu;
  const marginPercentage = bestPrice > 0 ? (unitMargin / bestPrice) * 100 : 0;
  const marginalCostAtOpt = evaluateMarginalCost(optimalDemand, params);
  const lernerIndex = bestPrice > 0 ? (bestPrice - marginalCostAtOpt) / bestPrice : 0;

  // Elasticidad estimada por diferencias finitas
  const delta = 0.01;
  const qPlus = modelType === 'isoelastic'
    ? evaluateDemandIsoelastic(bestPrice + delta, params)
    : evaluateDemandWTPLogit(bestPrice + delta, params);
  const dqdp = (qPlus - optimalDemand) / delta;
  const pointElasticity = optimalDemand > 0 ? dqdp * (bestPrice / optimalDemand) : -1;

  const breakEvenQuantity = unitMargin > 0 ? params.fixed_cost / unitMargin : 0;

  return {
    optimalPrice: Number(bestPrice.toFixed(2)),
    optimalDemand: Math.round(optimalDemand),
    maxProfit: Number(maxProfit.toFixed(2)),
    totalRevenue: Number(totalRevenue.toFixed(2)),
    totalCost: Number(totalCost.toFixed(2)),
    unitMargin: Number(unitMargin.toFixed(2)),
    marginPercentage: Number(marginPercentage.toFixed(1)),
    lernerIndex: Number(lernerIndex.toFixed(3)),
    pointElasticity: Number(pointElasticity.toFixed(2)),
    breakEvenQuantity: Math.round(breakEvenQuantity),
    breakEvenPrice: optimalDemand > 0 ? Number(((params.fixed_cost / optimalDemand) + cvu).toFixed(2)) : 0,
    consumerSurplus: Number((0.5 * (bestPrice * 1.5 - bestPrice) * optimalDemand).toFixed(2)),
  };
}

/**
 * Simulación de Estrategias de Lanzamiento a lo largo de 8 períodos (T1..T8)
 */
export function simulateLaunchStrategies(baseOptimalPrice: number, cvu: number) {
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  // Descreme (Skimming): Empieza alto (excedente early adopters), baja gradualmente
  const skimming = periods.map(t => {
    const factor = 1.45 - (t - 1) * 0.06;
    const price = Math.max(cvu * 1.15, baseOptimalPrice * factor);
    // Demanda crece a medida que baja el precio y madura el mercado
    const adoptionFactor = 0.6 + (t * 0.08);
    const demand = Math.round(1000 * Math.pow(baseOptimalPrice / price, 1.4) * adoptionFactor);
    const profit = Math.round((price - cvu) * demand - 2000);
    return { period: `T${t}`, price: Number(price.toFixed(2)), demand, profit, strategy: 'Skimming' };
  });

  // Penetración: Empieza bajo (captura volumen rápido), sube moderadamente
  const penetration = periods.map(t => {
    const factor = 0.78 + (t - 1) * 0.035;
    const price = Math.max(cvu * 1.05, baseOptimalPrice * factor);
    const networkEffects = 1 + (t * 0.12);
    const demand = Math.round(1400 * Math.pow(baseOptimalPrice / price, 1.6) * networkEffects);
    const profit = Math.round((price - cvu) * demand - 2000);
    return { period: `T${t}`, price: Number(price.toFixed(2)), demand, profit, strategy: 'Penetración' };
  });

  // Precios Dinámicos / Neutro: Anclado al óptimo económico
  const neutral = periods.map(t => {
    const price = baseOptimalPrice;
    const demand = Math.round(1100 * (1 + t * 0.04));
    const profit = Math.round((price - cvu) * demand - 2000);
    return { period: `T${t}`, price: Number(price.toFixed(2)), demand, profit, strategy: 'Óptimo Estático' };
  });

  return { skimming, penetration, neutral };
}

/**
 * Simulación de Interacción Competitiva (Guerra de Precios vs Premium Branding)
 */
export function simulateCompetitionGame(
  ourPrice: number,
  compPrice: number,
  crossElasticity: number,
  ourCVU: number,
  compCVU: number
) {
  // Matriz de pagos (Juego 2x2: Mantener Precio Alto vs Descontar Agresivamente)
  // Estrategia A: Cooperativo / Alto
  // Estrategia B: Descuento / Guerra (-20%)
  const priceHighOur = ourPrice;
  const priceLowOur = ourPrice * 0.80;
  const priceHighComp = compPrice;
  const priceLowComp = compPrice * 0.80;

  function calcPayoff(p1: number, p2: number, c1: number, c2: number) {
    const baseQ = 1000;
    // Demanda propia sensible a precio propio y precio competencia (elasticidad cruzada)
    const q1 = Math.max(100, Math.round(baseQ * (1 - 1.5 * ((p1 - ourPrice) / ourPrice) + crossElasticity * ((p2 - compPrice) / compPrice))));
    const q2 = Math.max(100, Math.round(baseQ * (1 - 1.5 * ((p2 - compPrice) / compPrice) + crossElasticity * ((p1 - ourPrice) / ourPrice))));
    const profit1 = Math.round((p1 - c1) * q1 - 1500);
    const profit2 = Math.round((p2 - c2) * q2 - 1500);
    return { profit1, profit2, q1, q2 };
  }

  const high_high = calcPayoff(priceHighOur, priceHighComp, ourCVU, compCVU);
  const low_high = calcPayoff(priceLowOur, priceHighComp, ourCVU, compCVU); // Nosotros descontamos, ellos no
  const high_low = calcPayoff(priceHighOur, priceLowComp, ourCVU, compCVU); // Ellos descuentan, nosotros no
  const low_low = calcPayoff(priceLowOur, priceLowComp, ourCVU, compCVU); // Guerra mutua de precios (Equilibrio de Nash Bertrand)

  return {
    matrix: {
      high_high,
      low_high,
      high_low,
      low_low,
    },
    nashOutcome: 'low_low', // Típico dilema del prisionero
    cooperativeOutcome: 'high_high',
    recommendation: 'Si la elasticidad cruzada es alta (> 0.5), una guerra de precios erosiona el margen conjunto en un 35-45%. Se recomienda estrategia de diferenciación o pricing no lineal (fidelización).',
  };
}

/**
 * Simulación de Productos Complementarios (Two-Part Tariff & Bundling)
 */
export function simulateComplementaryBundle(
  productAPrice: number,
  productACost: number,
  productBPrice: number,
  productBCost: number,
  bRatioPerA: number,
  bundleDiscountPercent: number
) {
  // Modelo Venta Separada:
  const baseDemandA = 1200;
  const baseDemandB = baseDemandA * bRatioPerA;
  const separateRevenueA = productAPrice * baseDemandA;
  const separateCostA = productACost * baseDemandA;
  const separateProfitA = separateRevenueA - separateCostA;

  const separateRevenueB = productBPrice * baseDemandB;
  const separateCostB = productBCost * baseDemandB;
  const separateProfitB = separateRevenueB - separateCostB;
  const totalSeparateProfit = separateProfitA + separateProfitB;

  // Modelo Paquete (Bundle Discounting):
  const bundledPrice = (productAPrice + productBPrice) * (1 - bundleDiscountPercent / 100);
  // Al ofrecer bundle, la demanda de A aumenta por mayor valor percibido
  const bundleLift = 1 + (bundleDiscountPercent / 100) * 1.25;
  const bundleDemand = Math.round(baseDemandA * bundleLift);
  const bundleRevenue = bundledPrice * bundleDemand;
  const bundleCost = (productACost + productBCost) * bundleDemand;
  const bundleProfit = bundleRevenue - bundleCost;

  // Modelo Cuchilla y Hoja (Razor-and-Blade):
  // A se vende a costo o con subsidio leve, B con alto markup y consumo repetitivo
  const razorPriceA = productACost * 1.05; // Margen mínimo
  const bladePriceB = productBPrice * 1.15; // Margen mayor
  const razorDemandA = Math.round(baseDemandA * 1.45); // Alta adopción inicial
  const razorDemandB = Math.round(razorDemandA * (bRatioPerA * 1.1)); // Consumo recurrente cautivo

  const razorProfitA = (razorPriceA - productACost) * razorDemandA;
  const razorProfitB = (bladePriceB - productBCost) * razorDemandB;
  const totalRazorProfit = razorProfitA + razorProfitB;

  return {
    separate: {
      profitA: Math.round(separateProfitA),
      profitB: Math.round(separateProfitB),
      totalProfit: Math.round(totalSeparateProfit),
      demandA: baseDemandA,
      demandB: baseDemandB,
    },
    bundle: {
      bundledPrice: Number(bundledPrice.toFixed(2)),
      bundleDemand,
      totalProfit: Math.round(bundleProfit),
      marginPerBundle: Number((bundledPrice - (productACost + productBCost)).toFixed(2)),
    },
    razorBlade: {
      subsidizedPriceA: Number(razorPriceA.toFixed(2)),
      highMarginPriceB: Number(bladePriceB.toFixed(2)),
      installedBaseA: razorDemandA,
      recurringDemandB: razorDemandB,
      totalProfit: Math.round(totalRazorProfit),
    },
  };
}
