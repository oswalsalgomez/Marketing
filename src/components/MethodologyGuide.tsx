import React, { useState } from 'react';
import { SectorType } from '../types/demand';
import { SECTORS } from '../data/sampleDatasets';
import { TabId } from './Navigation';
import { 
  BookOpen, 
  CheckCircle2, 
  Code, 
  Terminal, 
  ArrowRight, 
  Layers, 
  Database, 
  Filter, 
  TrendingUp, 
  Sparkles, 
  DollarSign, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp,
  Cpu,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface MethodologyGuideProps {
  selectedSector: SectorType;
  onNavigateTab: (tab: TabId) => void;
}

export const MethodologyGuide: React.FC<MethodologyGuideProps> = ({
  selectedSector,
  onNavigateTab,
}) => {
  const currentSector = SECTORS[selectedSector];
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sec1: true,
    sec2: true,
    sec3: false,
    sec4: false,
    sec5: false,
    sec6: false,
    sec7: true,
    sec8: true,
    sec9: true,
    sec10: true,
  });

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Banner de la Guía */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 p-6 md:p-8 border border-indigo-500/20 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
            <BookOpen className="w-3.5 h-3.5" />
            Manual de Ingeniería & Microeconomía Aplicada
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Guía End-to-End: Estimación de Demanda, Curvas Microeconómicas y Optimización con Google AI Studio
          </h2>
          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            Esta guía técnica estructurada describe paso a paso la arquitectura, formulación matemática,
            proceso de ingeniería de datos y simulación analítica para construir un sistema de fijación
            óptima de precios y pronóstico de demanda, integrado con modelos de lenguaje de última generación
            (Gemini 2.5) en Google AI Studio.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigateTab('curves')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              <span>Ir al Modelador de Curvas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigateTab('simulator')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            >
              <span>Abrir Simulador de Escenarios (P*)</span>
            </button>
            <button
              onClick={() => onNavigateTab('policies')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            >
              <span>Explorar Políticas de Precios</span>
            </button>
          </div>
        </div>
      </div>

      {/* Flujo General de la Solución (Diagrama de Arquitectura) */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 md:p-6">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-4">
          <Layers className="w-4 h-4 text-indigo-400" />
          Arquitectura del Pipeline Analítico End-to-End
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="font-mono text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Fase 1</span>
              <h4 className="font-semibold text-slate-200 mt-1">Ingestión & Fuentes</h4>
              <p className="text-slate-400 text-[11px] mt-1">BigQuery / CSV / POS / ERP transaccionales con historial de precios y cantidades vendidas.</p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-indigo-300 font-medium">Formatos: Parquet, CSV, REST</div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Fase 2</span>
              <h4 className="font-semibold text-slate-200 mt-1">Limpieza & Reglas</h4>
              <p className="text-slate-400 text-[11px] mt-1">Tratamiento de roturas de stock (outliers censurados), errores de digitación de POS y estacionalidad.</p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-emerald-300 font-medium">IQR, Z-Score, Imputación de Negocio</div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="font-mono text-[10px] text-purple-400 font-bold uppercase tracking-wider">Fase 3</span>
              <h4 className="font-semibold text-slate-200 mt-1">Curvas Económicas</h4>
              <p className="text-slate-400 text-[11px] mt-1">Ajuste de funciones microeconómicas: Demanda Lineal (OLS), Isoelástica, Logit WTP y Función de Costos.</p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-purple-300 font-medium">Q(P), CT(Q), IMg, CMg</div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="font-mono text-[10px] text-amber-400 font-bold uppercase tracking-wider">Fase 4</span>
              <h4 className="font-semibold text-slate-200 mt-1">Simulación & Óptimo</h4>
              <p className="text-slate-400 text-[11px] mt-1">Búsqueda del precio óptimo (P*) maximizador de beneficio: Condición IMg = CMg y Regla de Lerner.</p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-amber-300 font-medium">P*, Q*, Beneficio Máx (Π*)</div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="font-mono text-[10px] text-pink-400 font-bold uppercase tracking-wider">Fase 5</span>
              <h4 className="font-semibold text-slate-200 mt-1">Políticas de Pricing</h4>
              <p className="text-slate-400 text-[11px] mt-1">Estrategia de Lanzamiento (Skimming / Penetración), Respuesta Competitiva y Paquetes de Productos.</p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-pink-300 font-medium">Decisiones Ejecutivas & AI</div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 1: Definición del Sector y Contexto */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden transition-all">
        <button
          onClick={() => toggleSection('sec1')}
          className="w-full p-5 sm:p-6 text-left flex items-center justify-between bg-slate-900/80 hover:bg-slate-900 transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Definición del Sector Económico y Contexto de Demanda
              </h3>
              <p className="text-xs text-slate-400">
                Identificación de la dinámica de mercado, drivers de demanda y restricciones operativas
              </p>
            </div>
          </div>
          {openSections.sec1 ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {openSections.sec1 && (
          <div className="p-5 sm:p-6 border-t border-slate-800 space-y-4 text-xs text-slate-300 leading-relaxed">
            <p>
              El primer paso crítico antes de entrenar modelos o ajustar ecuaciones de regresión es caracterizar la <strong>dinámica del sector económico</strong>. La relación entre precio y cantidad vendida no es universal; depende de la estructura de mercado (competencia perfecta, monopolio, oligopolio), los costos de cambio (switching costs) y la perecibilidad del producto.
            </p>

            {/* Tabla Comparativa de Sectores */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-300 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
                    <th className="py-2.5 px-3">Sector</th>
                    <th className="py-2.5 px-3">Ejemplo</th>
                    <th className="py-2.5 px-3">Rango de Elasticidad</th>
                    <th className="py-2.5 px-3">Estructura de Costos</th>
                    <th className="py-2.5 px-3">Drivers Clave</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-[11px]">
                  <tr className={selectedSector === 'retail_cpg' ? 'bg-indigo-950/30' : ''}>
                    <td className="py-2 px-3 font-semibold text-white">Retail & Consumo Masivo (CPG)</td>
                    <td className="py-2 px-3 text-slate-300">Bebidas funcionales, snacks, alimentos</td>
                    <td className="py-2 px-3 font-mono text-emerald-400">-1.8 a -2.5 (Muy Elástica)</td>
                    <td className="py-2 px-3 text-slate-300">Bajo CVU, alta rotación, margen estrecho</td>
                    <td className="py-2 px-3 text-slate-400">Promociones 2x1, precio góndola rival, estacionalidad</td>
                  </tr>
                  <tr className={selectedSector === 'tech_hardware' ? 'bg-indigo-950/30' : ''}>
                    <td className="py-2 px-3 font-semibold text-white">Electrónica & Hardware</td>
                    <td className="py-2 px-3 text-slate-300">Smartphones, auriculares ANC, gadgets</td>
                    <td className="py-2 px-3 font-mono text-indigo-400">-1.1 a -1.6 (Moderada)</td>
                    <td className="py-2 px-3 text-slate-300">Altos CF de I+D, economías de escala</td>
                    <td className="py-2 px-3 text-slate-400">Reviews de usuarios, ciclo de vida, lanzamientos</td>
                  </tr>
                  <tr className={selectedSector === 'energy_utilities' ? 'bg-indigo-950/30' : ''}>
                    <td className="py-2 px-3 font-semibold text-white">Energía y Servicios Industriales</td>
                    <td className="py-2 px-3 text-slate-300">Tarifa eléctrica MWh, gas industrial</td>
                    <td className="py-2 px-3 font-mono text-amber-400">-0.3 a -0.7 (Inelástica)</td>
                    <td className="py-2 px-3 text-slate-300">CF colosales, costo marginal creciente en horas punta</td>
                    <td className="py-2 px-3 text-slate-400">Clima (calefacción/AC), actividad fabril, regulación</td>
                  </tr>
                  <tr className={selectedSector === 'saas_b2b' ? 'bg-indigo-950/30' : ''}>
                    <td className="py-2 px-3 font-semibold text-white">SaaS B2B & Suscripciones Cloud</td>
                    <td className="py-2 px-3 text-slate-300">Licencias CRM/ERP/Analytics por usuario</td>
                    <td className="py-2 px-3 font-mono text-purple-400">-0.8 a -1.4 (Heterogénea)</td>
                    <td className="py-2 px-3 text-slate-300">Costo marginal unitario ~ $0, CF en software</td>
                    <td className="py-2 px-3 text-slate-400">ROI demostrable, switching costs, empaquetamiento add-on</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h4 className="font-semibold text-slate-200 mb-1 text-xs">Sector Seleccionado Actualmente: {currentSector.name}</h4>
              <p className="text-slate-400 text-xs">{currentSector.description}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {currentSector.keyDrivers.map((driver, idx) => (
                  <span key={idx} className="bg-slate-900 px-2 py-0.5 rounded text-[11px] text-slate-300 border border-slate-800">
                    • {driver}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* SECCIÓN 2: Proceso de Ingestión en Google AI Studio */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden transition-all">
        <button
          onClick={() => toggleSection('sec2')}
          className="w-full p-5 sm:p-6 text-left flex items-center justify-between bg-slate-900/80 hover:bg-slate-900 transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Proceso de Ingestión de Datos e Integración en Google AI Studio
              </h3>
              <p className="text-xs text-slate-400">
                Formatos soportados, arquitectura de ingesta por streaming o batches y conector SDK
              </p>
            </div>
          </div>
          {openSections.sec2 ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {openSections.sec2 && (
          <div className="p-5 sm:p-6 border-t border-slate-800 space-y-4 text-xs text-slate-300 leading-relaxed">
            <p>
              En soluciones modernas de Pricing Analytics, la base de datos histórica proviene de sistemas de Punto de Venta (POS), plataformas ERP (SAP, Oracle) o data warehouses como <strong>Google BigQuery</strong>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="font-semibold text-white block mb-1">1. Formatos recomendados</span>
                <p className="text-slate-400 text-[11px]">
                  <strong>CSV / Parquet estructurado</strong> con granularidad temporal homogénea (semanal o diaria por SKU y región).
                </p>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="font-semibold text-white block mb-1">2. Almacenamiento & BigQuery</span>
                <p className="text-slate-400 text-[11px]">
                  Tablas particionadas por <code>fecha</code> y agrupadas (clustered) por <code>categoria_sku</code> para consultas analíticas ultra-rápidas.
                </p>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="font-semibold text-white block mb-1">3. Integración en AI Studio</span>
                <p className="text-slate-400 text-[11px]">
                  Uso del SDK oficial <code>@google/genai</code> con modelos como <code>gemini-2.5-flash</code> para razonamiento numérico y síntesis estratégica.
                </p>
              </div>
            </div>

            {/* Código de Ingestión en Python / AI Studio SDK */}
            <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px]">
                <span className="font-mono text-slate-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  pipeline_ingesta.py (Python Pandas + Google AI Studio)
                </span>
                <button
                  onClick={() => copyToClipboard(`import pandas as pd
from google import genai
from google.genai import types

# 1. Cargar historial transaccional
df = pd.read_csv("historico_ventas_retail.csv", parse_dates=["fecha"])

# 2. Resumen analítico inicial
print("Shape del dataset:", df.shape)
print(df.info())

# 3. Integración con Google AI Studio para diagnóstico preliminar
client = genai.Client()
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=f"Analiza la siguiente muestra de precios y demanda:\\n{df.head(5).to_markdown()}\\n"
             "¿Presenta indicios de alta elasticidad o distorsiones de datos?"
)
print(response.text)`, 'code_ingesta')}
                  className="text-slate-400 hover:text-white flex items-center gap-1 transition"
                >
                  {copiedId === 'code_ingesta' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'code_ingesta' ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
              <pre className="p-4 text-[11px] font-mono text-slate-300 overflow-x-auto">
{`import pandas as pd
from google import genai
from google.genai import types

# 1. Cargar historial transaccional de ventas y precios
df = pd.read_csv("historico_ventas_retail.csv", parse_dates=["fecha"])

# 2. Resumen analítico inicial
print("Shape del dataset:", df.shape)
print(df.info())

# 3. Integración con Google AI Studio para diagnóstico preliminar
client = genai.Client()
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=f"Analiza la siguiente muestra de precios y demanda:\\n{df.head(5).to_markdown()}\\n"
             "¿Presenta indicios de alta elasticidad o distorsiones de datos?"
)
print("Diagnóstico AI Studio:", response.text)`}
              </pre>
            </div>
          </div>
        )}
      </section>

      {/* SECCIÓN 3 & 4: Visualización Head y Tipos de Variables */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden transition-all">
        <button
          onClick={() => toggleSection('sec3')}
          className="w-full p-5 sm:p-6 text-left flex items-center justify-between bg-slate-900/80 hover:bg-slate-900 transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
              3-4
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Visualización Inicial (Head) e Identificación de Tipos de Variables
              </h3>
              <p className="text-xs text-slate-400">
                Esquema dimensional, variables endógenas vs exógenas y taxonomía de datos
              </p>
            </div>
          </div>
          {openSections.sec3 ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {openSections.sec3 && (
          <div className="p-5 sm:p-6 border-t border-slate-800 space-y-4 text-xs text-slate-300 leading-relaxed">
            <p>
              La visualización de las primeras filas (<code>df.head()</code>) no es un trámite estético: permite auditar inmediatamente la coherencia de las unidades de medida ($/unidad, volúmenes de cajas o litros, moneda) y la existencia de sesgos inmediatos.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase">1. Numéricas Continuas</span>
                <h4 className="font-semibold text-white mt-1">Precio & Inversión Mkt</h4>
                <p className="text-slate-400 text-[11px] mt-1">
                  <code>price ($)</code>, <code>competitor_price ($)</code>, <code>marketing_spend ($)</code>. Representan las palancas de decisión continua.
                </p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">2. Numéricas Discretas</span>
                <h4 className="font-semibold text-white mt-1">Demanda Observada (Q)</h4>
                <p className="text-slate-400 text-[11px] mt-1">
                  <code>units_sold</code> (unidades, litros o asientos de software). Variable dependiente primaria a modelar.
                </p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">3. Categóricas & Flags</span>
                <h4 className="font-semibold text-white mt-1">Promociones & Región</h4>
                <p className="text-slate-400 text-[11px] mt-1">
                  <code>is_promotion (bool)</code>, <code>region (str)</code>, <code>store_type</code>. Permiten segmentación y efectos fijos.
                </p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">4. Temporales & Índices</span>
                <h4 className="font-semibold text-white mt-1">Período & Estacionalidad</h4>
                <p className="text-slate-400 text-[11px] mt-1">
                  <code>period (YYYY-Www)</code>, <code>seasonality_index</code>. Modulan la demanda autónoma a lo largo del año.
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => onNavigateTab('eda')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 rounded-lg border border-indigo-500/30 font-medium text-xs transition cursor-pointer"
              >
                <span>Inspeccionar Head y Tipos en la pestaña 2 (EDA)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* SECCIÓN 5: Limpieza de Datos y Anomalías */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden transition-all">
        <button
          onClick={() => toggleSection('sec5')}
          className="w-full p-5 sm:p-6 text-left flex items-center justify-between bg-slate-900/80 hover:bg-slate-900 transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
              5
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Limpieza de Datos: Tratamiento de Valores Faltantes y Anomalías
              </h3>
              <p className="text-xs text-slate-400">
                Quiebres de stock (censoring), errores tipográficos de POS y técnicas de imputación
              </p>
            </div>
          </div>
          {openSections.sec5 ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {openSections.sec5 && (
          <div className="p-5 sm:p-6 border-t border-slate-800 space-y-4 text-xs text-slate-300 leading-relaxed">
            <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-4 text-amber-200">
              <div className="flex items-center gap-2 font-semibold mb-1 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Principio Fundamental en Pricing: "Ventas Observadas ≠ Demanda Real"
              </div>
              <p className="text-[11px] text-amber-300/90 leading-relaxed">
                Si un producto se queda sin inventario a mitad de semana (<strong>quiebre de stock o rotura</strong>), las unidades registradas reflejan la capacidad logística, no el deseo de compra. Incluir estos datos sin corregir provoca una subestimación artificial de la elasticidad (sesgo de censura a la baja).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-semibold text-white">Detección de Anomalías</h4>
                <ul className="space-y-1.5 text-slate-400 text-[11px]">
                  <li>• <strong>Rango Intercuartílico (IQR):</strong> Valores fuera de $[Q_1 - 1.5 \times IQR, Q_3 + 1.5 \times IQR]$.</li>
                  <li>• <strong>Z-Score Robusto:</strong> Modificado por la mediana (MAD) cuando la distribución tiene colas pesadas.</li>
                  <li>• <strong>Errores de Digitación de POS:</strong> Precios como $0.45 en vez de $4.50 (factor 10x de error).</li>
                </ul>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-semibold text-white">Estrategias de Remediación</h4>
                <ul className="space-y-1.5 text-slate-400 text-[11px]">
                  <li>• <strong>Imputación por Desestacionalización:</strong> Reemplazar períodos censurados con la mediana ponderada de períodos comparables.</li>
                  <li>• <strong>Winsorización:</strong> Acotar valores extremos al percentil 95 o 99 sin perder la observación.</li>
                  <li>• <strong>Filtrado con Flag Booleano:</strong> Mantener registro de quiebre de stock para modelos avanzados tipo Tobit / Censored Regression.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* SECCIÓN 6: Análisis Exploratorio de Datos (EDA) */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden transition-all">
        <button
          onClick={() => toggleSection('sec6')}
          className="w-full p-5 sm:p-6 text-left flex items-center justify-between bg-slate-900/80 hover:bg-slate-900 transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
              6
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Análisis Exploratorio de Datos (EDA) con Reglas de Negocio
              </h3>
              <p className="text-xs text-slate-400">
                Elasticidad empírica, descomposición estacional y correlación precio-competidor
              </p>
            </div>
          </div>
          {openSections.sec6 ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {openSections.sec6 && (
          <div className="p-5 sm:p-6 border-t border-slate-800 space-y-4 text-xs text-slate-300 leading-relaxed">
            <p>
              El EDA en pricing no se limita a histogramas genéricos; debe validar <strong>tres leyes económicas empíricas</strong>:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="font-semibold text-white block mb-1">1. Ley de la Demanda</span>
                <p className="text-slate-400 text-[11px]">
                  La correlación entre <code>price</code> y <code>units_sold</code> debe ser estrictamente negativa (ΔQ / ΔP &lt; 0). Si fuera positiva, suele deberse a promociones conjuntas o inflación no controlada.
                </p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="font-semibold text-white block mb-1">2. Elasticidad Cruzada (ε_xy)</span>
                <p className="text-slate-400 text-[11px]">
                  Si el rival baja su precio, nuestras ventas deben reducirse (ΔQ / ΔP_rival &gt; 0). Indica que los productos son bienes sustitutos directos.
                </p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="font-semibold text-white block mb-1">3. Efecto Promocional (Lift)</span>
                <p className="text-slate-400 text-[11px]">
                  Medir el incremento porcentual de volumen generado por cabeceras de góndola o descuentos temporales frente al ritmo base de venta.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* SECCIÓN 7: Modelación de Curvas Económicas (A, B, C, D) */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden transition-all">
        <button
          onClick={() => toggleSection('sec7')}
          className="w-full p-5 sm:p-6 text-left flex items-center justify-between bg-slate-900/80 hover:bg-slate-900 transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
              7
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Modelación de Curvas Económicas (Lineal, No Lineal, Utilidad y Costos)
              </h3>
              <p className="text-xs text-slate-400">
                Formulación matemática rigurosa de las funciones fundamentales de microeconomía aplicada
              </p>
            </div>
          </div>
          {openSections.sec7 ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {openSections.sec7 && (
          <div className="p-5 sm:p-6 border-t border-slate-800 space-y-6 text-xs text-slate-300 leading-relaxed">
            {/* a. Curva Lineal */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-xs">a</span>
                  Curva de Demanda Lineal Clásica
                </h4>
                <span className="font-mono text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-500/30 text-xs">
                  Q(P) = a - b · P
                </span>
              </div>
              <p className="text-slate-300 text-xs mb-3">
                Es la función base en economía gerencial por su interpretabilidad directa. Se estima mediante Mínimos Cuadrados Ordinarios (MCO / OLS):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 text-[11px]">
                <div>
                  <strong className="text-white block">Parámetro 'a' (Demanda Autónoma):</strong>
                  <span className="text-slate-400">Cantidad máxima demandada si el precio fuera cero (P = 0). Representa el tamaño de mercado saturado.</span>
                </div>
                <div>
                  <strong className="text-white block">Parámetro 'b' (Sensibilidad):</strong>
                  <span className="text-slate-400">Pendiente b = -dQ/dP. Indica cuántas unidades se pierden por cada $1 que sube el precio.</span>
                </div>
                <div>
                  <strong className="text-white block">Elasticidad Puntual (ε_p):</strong>
                  <span className="font-mono text-indigo-300 block">ε_p = -b · (P / Q)</span>
                  <span className="text-slate-400">Varía en cada punto de la recta (desde 0 hasta -∞).</span>
                </div>
              </div>
            </div>

            {/* b. Curva No Lineal / Subjetiva */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center text-xs">b</span>
                  Curva de Demanda No Lineal & Disposición a Pagar (WTP Logit / Isoelástica)
                </h4>
                <span className="font-mono text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/30 text-xs">
                  Isoelástica: Q = A · P^(-ε) | Logit: Q = Qmax / (1 + e^(k(P - WTP)))
                </span>
              </div>
              <p className="text-slate-300 text-xs mb-3">
                En productos tecnológicos o premium, los consumidores no reaccionan de manera lineal. Se emplean dos enfoques:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                  <strong className="text-purple-300 block mb-1">Modelo Isoelástico (Cobb-Douglas):</strong>
                  <p className="text-slate-400">
                    La elasticidad porcentual es idéntica en cualquier nivel de precio. Se linealiza tomando logaritmos: <code>ln(Q) = ln(A) - ε · ln(P)</code>.
                  </p>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                  <strong className="text-purple-300 block mb-1">Modelo Logístico de Disposición a Pagar (WTP):</strong>
                  <p className="text-slate-400">
                    Captura el comportamiento humano: cerca del precio psicológico de referencia <code>WTP_media</code> la caída es abrupta, mientras que a precios muy bajos o muy altos la curva se estabiliza.
                  </p>
                </div>
              </div>
            </div>

            {/* c & d. Función de Utilidad y Costo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-300 flex items-center justify-center text-xs">c</span>
                  Función de Beneficio y Utilidad
                </h4>
                <div className="font-mono text-emerald-400 text-xs mb-2">
                  Π(P) = IT(P) - CT(Q(P)) = P · Q(P) - CT(Q(P))
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  El objetivo de la firma es maximizar el beneficio económico Π(P). El <strong>Ingreso Marginal (IMg)</strong> es la derivada del ingreso total respecto a Q: IMg = (a - 2Q) / b.
                  El <strong>Excedente del Consumidor (CS)</strong> mide el bienestar económico total que el cliente retiene por encima del precio pagado.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-600/30 text-amber-300 flex items-center justify-center text-xs">d</span>
                  Función de Costos de Producción
                </h4>
                <div className="font-mono text-amber-400 text-xs mb-2">
                  CT(Q) = CF + CVU · Q + γ · Q²
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  • <strong>Costos Fijos (CF):</strong> No dependen de Q (alquiler, nóminas base, licencias software).<br />
                  • <strong>Costo Variable Unitario (CVU):</strong> Materias primas, empaques o comisiones de pago.<br />
                  • <strong>Término Cuadrático (γ · Q²):</strong> Deseconomías de escala al sobrepasar la capacidad instalada de planta. Costo Marginal: CMg = CVU + 2γ · Q.
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => onNavigateTab('curves')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 rounded-lg border border-indigo-500/30 font-medium text-xs transition cursor-pointer"
              >
                <span>Abrir Laboratorio Gráfico de Curvas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* SECCIÓN 8: Simulación de Escenarios y Punto Óptimo */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden transition-all">
        <button
          onClick={() => toggleSection('sec8')}
          className="w-full p-5 sm:p-6 text-left flex items-center justify-between bg-slate-900/80 hover:bg-slate-900 transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
              8
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Simulación de Escenarios y Búsqueda del Punto Óptimo (Maximización de Beneficio)
              </h3>
              <p className="text-xs text-slate-400">
                Condición IMg = CMg, Regla de Lerner, precio óptimo analítico y análisis de sensibilidad
              </p>
            </div>
          </div>
          {openSections.sec8 ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {openSections.sec8 && (
          <div className="p-5 sm:p-6 border-t border-slate-800 space-y-4 text-xs text-slate-300 leading-relaxed">
            <p>
              Para maximizar el beneficio Π, aplicamos la condición de primer orden: dΠ/dQ = 0 ⇔ IMg = CMg.
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h4 className="font-semibold text-white mb-2">Deducción del Precio Óptimo (P*) para Demanda Lineal:</h4>
              <div className="space-y-1.5 font-mono text-[11px] text-slate-300">
                <div>1. IT(Q) = P(Q) · Q = ((a - Q) / b) · Q = (aQ - Q²) / b</div>
                <div>2. IMg(Q) = dIT/dQ = (a - 2Q) / b</div>
                <div>3. Igualando con costo marginal constante (CMg = CVU): (a - 2Q) / b = CVU =&gt; 2Q = a - b · CVU</div>
                <div className="text-emerald-400 font-bold text-xs pt-1">
                  Cantidad Óptima: Q* = (a - b · CVU) / 2
                </div>
                <div className="text-emerald-400 font-bold text-xs">
                  Precio Óptimo: P* = (a + b · CVU) / (2b)
                </div>
              </div>
            </div>

            {/* Regla de Elasticidad de Lerner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="font-semibold text-white block mb-1">Índice de Lerner (Poder de Fijación):</span>
                <div className="font-mono text-indigo-400 my-1">
                  L = (P* - CMg) / P* = 1 / |ε_p|
                </div>
                <p className="text-slate-400 text-[11px]">
                  Demuestra que cuanto más inelástica es la demanda (|ε_p| bajo), mayor es el margen sobre costo que la empresa puede capturar sin destruir volumen.
                </p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="font-semibold text-white block mb-1">Punto de Equilibrio (Break-Even):</span>
                <div className="font-mono text-amber-400 my-1">
                  Q_equilibrio = CF / (P - CVU)
                </div>
                <p className="text-slate-400 text-[11px]">
                  Unidades mínimas requeridas para cubrir exactamente los costos fijos antes de generar beneficios netos positivos.
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => onNavigateTab('simulator')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 rounded-lg border border-indigo-500/30 font-medium text-xs transition cursor-pointer"
              >
                <span>Probar Sliders de Optimización en el Simulador</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* SECCIÓN 9: Definición de Políticas de Precios */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden transition-all">
        <button
          onClick={() => toggleSection('sec9')}
          className="w-full p-5 sm:p-6 text-left flex items-center justify-between bg-slate-900/80 hover:bg-slate-900 transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
              9
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Definición y Simulación de Políticas de Precios
              </h3>
              <p className="text-xs text-slate-400">
                a) Lanzamiento (Skimming vs Penetración), b) Competencia (Bertrand / Guerra), c) Complementarios (Bundling / Razor & Blade)
              </p>
            </div>
          </div>
          {openSections.sec9 ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {openSections.sec9 && (
          <div className="p-5 sm:p-6 border-t border-slate-800 space-y-4 text-xs text-slate-300 leading-relaxed">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* a. Lanzamiento */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-indigo-400 font-bold">
                    <span className="w-5 h-5 rounded bg-indigo-500/20 flex items-center justify-center text-xs">a</span>
                    Estrategia de Lanzamiento
                  </div>
                  <h4 className="font-semibold text-white mb-1">Skimming vs Penetración</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    • <strong>Descreme (Price Skimming):</strong> Fijar un precio inicial elevado para extraer el excedente de los early adopters con alta disposición a pagar, para luego descender gradualmente.<br />
                    • <strong>Penetración Agresiva:</strong> Precio de entrada bajo para capturar rápidamente cuota de mercado e inducir costos de cambio o efectos de red.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-indigo-300">
                  Ideal para: Hardware, dispositivos e innovaciones de software
                </div>
              </div>

              {/* b. Competencia */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold">
                    <span className="w-5 h-5 rounded bg-emerald-500/20 flex items-center justify-center text-xs">b</span>
                    Frente a la Competencia
                  </div>
                  <h4 className="font-semibold text-white mb-1">Dilema de Precios & Bertrand</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Modelación con teoría de juegos (Equilibrio de Nash). Si ambas firmas bajan precios para robar volumen, caen en el equilibrio no cooperativo (P → CMg), erosionando el margen de la industria.
                    La alternativa es <strong>Premium Pricing</strong> justificado en marca o empaquetamiento exclusivo.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-emerald-300">
                  Ideal para: Retail CPG, telecomunicaciones y combustible
                </div>
              </div>

              {/* c. Complementarios */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-pink-400 font-bold">
                    <span className="w-5 h-5 rounded bg-pink-500/20 flex items-center justify-center text-xs">c</span>
                    Productos Complementarios
                  </div>
                  <h4 className="font-semibold text-white mb-1">Cuchilla y Hoja / Bundles</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    • <strong>Razor & Blade (Tarifa en dos partes):</strong> El producto A (impresora, cafetera, consola) se subsidia a costo marginal, mientras que el bien B complementario cautivo (tinta, cápsulas, juegos) tiene un markup del 60-80%.<br />
                    • <strong>Bundling (Paquete):</strong> Vender A + B a un precio descontado conjunto para capturar mayor excedente.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-pink-300">
                  Ideal para: SaaS con add-ons, periféricos e impresoras
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => onNavigateTab('policies')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 rounded-lg border border-indigo-500/30 font-medium text-xs transition cursor-pointer"
              >
                <span>Simular las 3 Políticas en Vivo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* SECCIÓN 10: Recomendaciones Prácticas para Google AI Studio */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden transition-all">
        <button
          onClick={() => toggleSection('sec10')}
          className="w-full p-5 sm:p-6 text-left flex items-center justify-between bg-slate-900/80 hover:bg-slate-900 transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
              10
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Recomendaciones Prácticas para Implementación en Google AI Studio
              </h3>
              <p className="text-xs text-slate-400">
                Buenas prácticas con Gemini 2.5, estructuración JSON Schema, prompts calibrados y validación
              </p>
            </div>
          </div>
          {openSections.sec10 ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {openSections.sec10 && (
          <div className="p-5 sm:p-6 border-t border-slate-800 space-y-4 text-xs text-slate-300 leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-white">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Structured Outputs (JSON Mode)
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Para integrar las predicciones del modelo en dashboards y APIs, utiliza siempre <code>responseSchema</code> con tipos estrictos (ej. floats para $P^*$ y elasticidad, strings para recomendaciones ejecutivas). Evita respuestas libres en texto plano que requieran regex frágil.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-white">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  Separación de Responsabilidades (Cálculo vs Razonamiento)
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  <strong>Regla de oro:</strong> Deja las derivadas y multiplicaciones numéricas de MCO a librerías deterministas (Python, NumPy, Scipy o TypeScript en el cliente). Emplea a Gemini en AI Studio para <em>interpretar el contexto cualitativo</em>, detectar anomalías de negocio y sugerir estrategias de pricing de alto nivel.
                </p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-white">Template de Prompt Calibrado para Google AI Studio</span>
                <button
                  onClick={() => copyToClipboard(`Eres un experto econometrista y consultor senior de pricing.
Analiza la siguiente información de un producto en el sector {sector}:
- Precio promedio actual: {avg_price}
- Demanda histórica: {avg_demand}
- Elasticidad precio estimada (MCO): {elasticity}
- R^2 del modelo lineal: {r_squared}
- Costo variable unitario: {cvu}
- Precio del competidor principal: {competitor_price}

Genera un dictamen estructurado en formato JSON con:
1. "diagnostico_mercado": Evaluación cualitativa de la elasticidad observada.
2. "riesgo_canibalizacion": Nivel de riesgo (Bajo/Medio/Alto) y justificación.
3. "politica_recomendada": ("Skimming", "Penetracion", "Paridad", "Bundling") con plan de acción a 6 meses.
4. "margen_seguridad_sugerido": Porcentaje de markup recomendado.`, 'code_prompt_gemini')}
                  className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                >
                  {copiedId === 'code_prompt_gemini' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'code_prompt_gemini' ? 'Copiado' : 'Copiar Prompt'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-900 rounded-lg text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap">
{`Eres un econometrista senior y consultor de pricing estratégico.
Analiza la siguiente información calibrada para el sector {sector}:
- Precio promedio actual: {avg_price}
- Demanda promedio: {avg_demand}
- Elasticidad precio estimada: {elasticity}
- Costo variable unitario: {cvu}
- Precio del competidor: {competitor_price}

Genera un dictamen con diagnóstico cualitativo, riesgo de reacción del competidor y la política de pricing óptima recomendada.`}
              </pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
