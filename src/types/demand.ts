/**
 * Tipos de datos para el Laboratorio de Estimación de Demanda y Fijación de Precios
 */

export type SectorType = 'retail_cpg' | 'tech_hardware' | 'energy_utilities' | 'saas_b2b';

export interface SectorConfig {
  id: SectorType;
  name: string;
  tagline: string;
  description: string;
  productExample: string;
  typicalElasticityRange: string;
  typicalCostStructure: string;
  keyDrivers: string[];
}

export interface DemandRecord {
  id: number;
  period: string; // ej. 2025-W01 o 2025-01
  price: number; // Precio unitario ($)
  units_sold: number; // Q demandada
  competitor_price: number; // Precio competencia ($)
  marketing_spend: number; // Presupuesto Mkt ($)
  is_promotion: boolean; // Flag de promoción
  seasonality_index: number; // Multiplicador de estacionalidad (ej. 1.15)
  region: string; // Zona / canal
  customer_satisfaction: number; // Score 1 a 5
  stockout_event?: boolean; // Quiebre de stock
  is_outlier?: boolean;
}

export interface DataQualityReport {
  totalRows: number;
  missingValuesCount: number;
  outliersDetected: number;
  duplicateRows: number;
  cleanRowsCount: number;
  avgPrice: number;
  avgDemand: number;
  priceStdDev: number;
  demandStdDev: number;
  empiricalElasticity: number;
  rSquaredLinear: number;
}

export interface EconomicParameters {
  // Parámetros de Demanda Lineal: Q = a - b*P
  a: number; // Demanda autónoma (choke quantity)
  b: number; // Pendiente de sensibilidad al precio

  // Parámetros de Demanda No Lineal (Isoelástica): Q = A * P^(-elasticity)
  A_iso: number; // Factor de escala
  elasticity_iso: number; // Elasticidad constante

  // Parámetros de Disposición a Pagar (WTP Logística): Q = Qmax / (1 + exp(k * (P - WTP_mean)))
  q_max_wtp: number;
  wtp_mean: number;
  wtp_k: number; // Sensibilidad de la curva logística

  // Estructura de Costos: CT = CF + CVU*Q + gamma*Q^2
  fixed_cost: number; // Costo Fijo ($)
  variable_cost_unit: number; // Costo Variable Unitario ($)
  convex_cost_gamma: number; // Factor de deseconomía de escala (gamma * Q^2)

  // Marketing & Competencia
  competitor_price: number;
  cross_price_elasticity: number; // Elasticidad cruzada (exy)
  marketing_elasticity: number;
}

export interface OptimizationResult {
  optimalPrice: number; // P*
  optimalDemand: number; // Q*
  maxProfit: number; // Pi*
  totalRevenue: number; // IT*
  totalCost: number; // CT*
  unitMargin: number; // P* - CVU
  marginPercentage: number; // (P* - CVU)/P*
  lernerIndex: number; // (P - CMg)/P
  pointElasticity: number; // epsilon en P*
  breakEvenQuantity: number;
  breakEvenPrice: number;
  consumerSurplus: number;
}

export interface ScenarioDefinition {
  id: string;
  name: string;
  description: string;
  price: number;
  fixedCostModifier: number; // ej. 1.0 (100%)
  variableCostModifier: number;
  marketingSpend: number;
  competitorPrice: number;
  demandShift: number; // % desplazamiento curva demanda
  results?: OptimizationResult;
}

export interface ComplementaryProductConfig {
  productA_name: string; // ej. Cafetera o Impresora
  productA_price: number;
  productA_cost: number;
  productA_demand: number;
  productB_name: string; // ej. Cápsulas de Café o Cartuchos de Tinta
  productB_price: number;
  productB_cost: number;
  productB_ratioPerA: number; // Cantidad consumida de B por cada unidad de A comprada al año
  crossElasticity: number;
}
