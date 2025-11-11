import { Card, CardContent } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { AlertTriangle, CheckCircle, TrendingUp, Target, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

interface Anomalia {
  respuesta_id: string
  texto_respuesta: string
  is_anomaly: boolean
  anomaly_score: number
  pregunta_texto: string
}

interface EjemploCategoria {
  respuesta_id: string
  texto_respuesta: string
  categoria_predicha: string
  confianza: number
  sentimiento: string
  sentimiento_score: number
  pregunta_texto: string
}

interface AnalysisData {
  total_respuestas: number
  anomalias_detectadas: number
  anomalias: Anomalia[]
  ejemplos_por_categoria: EjemploCategoria[]
  categorias_encontradas: Record<string, number>
  sentimiento_resumen: {
    positivo: number
    negativo: number
    neutro: number
  }
  sentimiento_por_categoria: Record<string, {
    positivo: number
    negativo: number
    neutro: number
  }>
}

interface AnalysisResultsProps {
  data: AnalysisData
  kmeansData?: any  // Datos del clustering KMeans
  encuestaNombre?: string
}

const SENTIMENT_COLORS = {
  positivo: '#10b981',
  negativo: '#ef4444',
  neutro: '#6b7280'
}

export default function AnalysisResults({ data, kmeansData, encuestaNombre }: AnalysisResultsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
  // Validar que data existe
  if (!data) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-600">No hay datos de análisis disponibles</p>
      </div>
    )
  }

  // Validar y preparar datos con valores por defecto
  const sentimentResumen = data.sentimiento_resumen || { positivo: 0, negativo: 0, neutro: 0 }
  const categoriasEncontradas = data.categorias_encontradas || {}
  const sentimientoPorCategoria = data.sentimiento_por_categoria || {}
  const anomalias = data.anomalias || []
  const ejemplosPorCategoria = data.ejemplos_por_categoria || []
  
  // Preparar datos para gráficas
  const sentimentData = [
    { name: 'Positivo', value: sentimentResumen.positivo, color: SENTIMENT_COLORS.positivo },
    { name: 'Negativo', value: sentimentResumen.negativo, color: SENTIMENT_COLORS.negativo },
    { name: 'Neutro', value: sentimentResumen.neutro, color: SENTIMENT_COLORS.neutro },
  ]

  const categoryData = Object.entries(categoriasEncontradas).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value
  }))

  const sentimentByCategoryData = Object.entries(sentimientoPorCategoria).map(([categoria, sentimientos]) => ({
    categoria: categoria.replace(/_/g, ' '),
    positivo: sentimientos.positivo,
    negativo: sentimientos.negativo,
    neutro: sentimientos.neutro
  }))

  return (
    <div className="space-y-4">
      {/* Header con resumen - Compacto */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                Resultados del Análisis {encuestaNombre && `- ${encuestaNombre}`}
              </h3>
              <p className="text-sm text-slate-600">
                TF-IDF + SVM + Isolation Forest + KMeans
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-blue-300">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">{data.total_respuestas}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs Grid - Compacto */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-slate-600">Respuestas</p>
              <CheckCircle className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{data.total_respuestas}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-slate-600">Anomalías</p>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{data.anomalias_detectadas}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-slate-600">Categorías</p>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {Object.keys(categoriasEncontradas).length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-slate-600">Sentimiento</p>
              <div className={`h-4 w-4 rounded-full ${
                sentimentResumen.positivo > sentimentResumen.negativo 
                  ? 'bg-green-500' 
                  : 'bg-red-500'
              }`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {((sentimentResumen.positivo / data.total_respuestas) * 100).toFixed(0)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Anomalías detectadas */}
      {data.anomalias_detectadas > 0 && (
        <Card className="bg-white border-amber-200">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-amber-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
              <div>
                <h3 className="text-lg font-bold text-slate-900">Anomalías Detectadas (Isolation Forest)</h3>
                <p className="text-sm text-slate-600">
                  {data.anomalias_detectadas} respuesta(s) con comportamiento atípico
                </p>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="space-y-4">
              {anomalias.map((anomalia, index) => (
                <div key={index} className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-semibold text-slate-700">{anomalia.pregunta_texto}</p>
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                      Score: {anomalia.anomaly_score.toFixed(3)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 italic">&quot;{anomalia.texto_respuesta}&quot;</p>
                  <p className="text-xs text-amber-600 mt-2">
                    ID: {anomalia.respuesta_id.substring(0, 8)}...
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráficas Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentimiento General - Pie Chart */}
        <Card className="bg-white border-slate-200">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b">
            <h3 className="text-lg font-bold text-slate-900">Distribución de Sentimiento</h3>
            <p className="text-sm text-slate-600">Análisis general de todas las respuestas</p>
          </div>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Categorías - Bar Chart */}
        <Card className="bg-white border-slate-200">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b">
            <h3 className="text-lg font-bold text-slate-900">Categorías TF-IDF</h3>
            <p className="text-sm text-slate-600">Distribución de respuestas por categoría</p>
          </div>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  style={{ fontSize: '12px' }}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Sentimiento por Categoría + Ejemplos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sentimiento por Categoría - Barras Agrupadas e Interactivas */}
        {sentimentByCategoryData.length > 0 && (
          <Card className="bg-white border-slate-200">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b">
              <h3 className="text-base font-bold text-slate-900">Sentimiento por Categoría</h3>
              <p className="text-xs text-slate-600">
                {selectedCategory ? `Mostrando: ${selectedCategory}` : 'Click en una categoría para ver respuestas'}
              </p>
            </div>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={sentimentByCategoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="categoria" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    style={{ fontSize: '10px', cursor: 'pointer' }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="positivo" 
                    fill={SENTIMENT_COLORS.positivo} 
                    radius={[4, 4, 0, 0]}
                    onClick={(data: any) => setSelectedCategory(data.categoria)}
                    style={{ cursor: 'pointer' }}
                  />
                  <Bar 
                    dataKey="neutro" 
                    fill={SENTIMENT_COLORS.neutro} 
                    radius={[4, 4, 0, 0]}
                    onClick={(data: any) => setSelectedCategory(data.categoria)}
                    style={{ cursor: 'pointer' }}
                  />
                  <Bar 
                    dataKey="negativo" 
                    fill={SENTIMENT_COLORS.negativo} 
                    radius={[4, 4, 0, 0]}
                    onClick={(data: any) => setSelectedCategory(data.categoria)}
                    style={{ cursor: 'pointer' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Ejemplos por Categoría */}
        <Card className="bg-white border-slate-200">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b">
            <h3 className="text-base font-bold text-slate-900">Ejemplos por Categoría</h3>
          </div>
          <CardContent className="p-4">
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {ejemplosPorCategoria.slice(0, 5).map((ejemplo, index) => (
                <div key={index} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded">
                      {ejemplo.categoria_predicha.replace(/_/g, ' ')}
                    </span>
                    <span className={`px-2 py-1 text-xs font-bold rounded ${
                      ejemplo.sentimiento === 'positivo' ? 'bg-green-100 text-green-800' :
                      ejemplo.sentimiento === 'negativo' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {ejemplo.sentimiento}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 italic line-clamp-2">&quot;{ejemplo.texto_respuesta}&quot;</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análisis General de Preguntas (Todos los Grupos) - Ocupa todo el ancho */}
      {kmeansData && (kmeansData.clusters || kmeansData.grupos) && (() => {
          const [selectedCluster, setSelectedCluster] = useState<string | null>(null)
          const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)

          // Detectar si es estructura de campaña (grupos) o encuesta (clusters)
          const esCampana = !!kmeansData.grupos
          const gruposSource = esCampana ? kmeansData.grupos : kmeansData.clusters

          // Datos para donut chart - UN SEGMENTO POR GRUPO
          const gruposArray = Object.entries(gruposSource).map(([clusterName, clusterData]: [string, any], idx: number) => {
            if (esCampana) {
              // Estructura de campaña
              return {
                id: clusterName,
                name: clusterData.nombre || `Grupo ${idx + 1}`,
                cantidad: clusterData.cantidad_participantes,
                porcentaje: clusterData.porcentaje,
                promedio: clusterData.metricas.promedio_general,
                preguntas: clusterData.respuestas_destacadas || [],
                descripcion: clusterData.descripcion,
                interpretacion: clusterData.interpretacion,
                hallazgos_clave: clusterData.hallazgos_clave || [],
                recomendaciones: clusterData.recomendaciones || []
              }
            } else {
              // Estructura de encuesta
              return {
                id: clusterName,
                name: `Grupo ${idx + 1}`,
                cantidad: clusterData.cantidad_entregas,
                porcentaje: clusterData.porcentaje_total,
                promedio: clusterData.estadisticas_generales.promedio_general,
                preguntas: clusterData.preguntas_detalladas || []
              }
            }
          })

          const COLORS = ['#06b6d4', '#84cc16', '#f97316', '#a855f7', '#ec4899', '#14b8a6']

          // Preguntas del grupo seleccionado
          const grupoSeleccionado = selectedCluster 
            ? gruposArray.find(g => g.id === selectedCluster)
            : null
          
          const preguntasDelGrupo = grupoSeleccionado?.preguntas || []

          return (
            <Card className="bg-white border-slate-200">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b">
                <h3 className="text-xl font-bold text-slate-900">Análisis por Grupo</h3>
                <p className="text-sm text-slate-600 mt-1">
                  {selectedCluster ? `${grupoSeleccionado?.name}` : 'Selecciona un grupo en el gráfico para ver el análisis detallado'}
                </p>
              </div>
              <CardContent className="p-6">
                {!selectedCluster ? (
                  /* Sin selección - solo mostrar el donut centrado */
                  <div className="flex flex-col items-center justify-center">
                    <ResponsiveContainer width="100%" height={350} className="max-w-md">
                      <PieChart>
                        <Pie
                          data={gruposArray}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={130}
                          paddingAngle={3}
                          dataKey="cantidad"
                          label={(entry: any) => `${entry.name}: ${entry.porcentaje}%`}
                          onClick={(data) => setSelectedCluster(data.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          {gruposArray.map((entry: any, index: number) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]}
                              stroke={selectedCluster === entry.id ? '#000' : '#fff'}
                              strokeWidth={selectedCluster === entry.id ? 3 : 1}
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number, _name: string, props: any) => [
                            `${value} ${esCampana ? 'participantes' : 'respuestas'} (${props.payload.porcentaje}%)`,
                            `Promedio: ${props.payload.promedio.toFixed(2)}`
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <p className="text-base text-slate-500 mt-4">Haz click en un grupo para ver el análisis detallado</p>
                  </div>
                ) : (
                  /* Con selección - Layout diferente para campaña vs encuesta */
                  esCampana ? (
                    /* CAMPAÑA: donut grande a la derecha, detalles a la izquierda */
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                      {/* Información del grupo seleccionado (ocupa 3/5 del ancho) */}
                      <div className="lg:col-span-3 order-2 lg:order-1">
                        <div className="space-y-4">
                          {/* Descripción e interpretación (solo para campaña) */}
                          {grupoSeleccionado?.descripcion && (
                            <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                              <p className="text-xs font-bold text-blue-900 mb-1.5 flex items-center gap-2">
                                <Target className="h-3.5 w-3.5" />
                                Descripción del Grupo
                              </p>
                              <p className="text-xs text-blue-800 leading-relaxed">{grupoSeleccionado?.descripcion}</p>
                            </div>
                          )}
                          
                          {grupoSeleccionado?.interpretacion && (
                            <div className="p-3 bg-purple-50 border-l-4 border-purple-500 rounded-lg">
                              <p className="text-xs font-bold text-purple-900 mb-1.5 flex items-center gap-2">
                                <TrendingUp className="h-3.5 w-3.5" />
                                Interpretación de Resultados
                              </p>
                              <p className="text-xs text-purple-800 leading-relaxed">{grupoSeleccionado?.interpretacion}</p>
                            </div>
                          )}

                          {/* Preguntas destacadas */}
                          <div className="space-y-2">
                            <p className="text-sm font-bold text-slate-900 mb-3">Respuestas Destacadas</p>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                              {preguntasDelGrupo.map((pregunta: any, idx: number) => (
                                <div key={idx} className="border border-slate-200 rounded-lg">
                                  <button
                                    onClick={() => setExpandedQuestion(expandedQuestion === pregunta.pregunta ? null : pregunta.pregunta)}
                                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors"
                                  >
                                    <div className="flex-1 text-left">
                                      <p className="text-sm font-semibold text-slate-800">{pregunta.pregunta}</p>
                                      {pregunta.categoria && (
                                        <span className="text-xs text-slate-500 mt-1 block">{pregunta.categoria.replace(/_/g, ' ')}</span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className={`text-sm font-bold ${
                                        (pregunta.promedio || pregunta.valor) >= 4 ? 'text-green-600' :
                                        (pregunta.promedio || pregunta.valor) >= 2.5 ? 'text-blue-600' :
                                        'text-amber-600'
                                      }`}>
                                        {(pregunta.promedio || pregunta.valor).toFixed(1)}
                                      </span>
                                      {expandedQuestion === pregunta.pregunta ? (
                                        <ChevronUp className="h-4 w-4 text-slate-400" />
                                      ) : (
                                        <ChevronDown className="h-4 w-4 text-slate-400" />
                                      )}
                                    </div>
                                  </button>
                                  {expandedQuestion === pregunta.pregunta && (
                                    <div className="px-3 pb-3 pt-2 bg-slate-50 border-t border-slate-200">
                                      <p className="text-sm text-slate-700 leading-relaxed">
                                        <strong>Interpretación:</strong> {pregunta.interpretacion}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Hallazgos clave y recomendaciones */}
                          {grupoSeleccionado?.hallazgos_clave && grupoSeleccionado.hallazgos_clave.length > 0 && (
                            <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded-lg">
                              <p className="text-xs font-bold text-green-900 mb-2 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Hallazgos Clave
                              </p>
                              <ul className="space-y-1.5">
                                {grupoSeleccionado.hallazgos_clave.map((hallazgo: string, idx: number) => (
                                  <li key={idx} className="text-xs text-green-800 flex items-start gap-2 leading-relaxed">
                                    <CheckCircle className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>{hallazgo}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {grupoSeleccionado?.recomendaciones && grupoSeleccionado.recomendaciones.length > 0 && (
                            <div className="p-3 bg-amber-50 border-l-4 border-amber-500 rounded-lg">
                              <p className="text-xs font-bold text-amber-900 mb-2 flex items-center gap-2">
                                <Target className="h-4 w-4" />
                                Recomendaciones
                              </p>
                              <ul className="space-y-1.5">
                                {grupoSeleccionado.recomendaciones.map((recomendacion: string, idx: number) => (
                                  <li key={idx} className="text-xs text-amber-800 flex items-start gap-2 leading-relaxed">
                                    <Target className="h-3.5 w-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                                    <span>{recomendacion}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Donut Chart - Grupos (más grande, a la derecha) */}
                      <div className="lg:col-span-2 order-1 lg:order-2">
                        <ResponsiveContainer width="100%" height={450}>
                          <PieChart>
                            <Pie
                              data={gruposArray}
                              cx="50%"
                              cy="50%"
                              innerRadius={90}
                              outerRadius={140}
                              paddingAngle={3}
                              dataKey="cantidad"
                              label={(entry: any) => `${entry.porcentaje}%`}
                              labelLine={true}
                              onClick={(data) => setSelectedCluster(data.id)}
                              style={{ cursor: 'pointer' }}
                            >
                              {gruposArray.map((entry: any, index: number) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={COLORS[index % COLORS.length]}
                                  stroke={selectedCluster === entry.id ? '#000' : '#fff'}
                                  strokeWidth={selectedCluster === entry.id ? 3 : 1}
                                />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value: number, _name: string, props: any) => [
                                `${value} participantes (${props.payload.porcentaje}%)`,
                                `Promedio: ${props.payload.promedio.toFixed(2)}`
                              ]}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ) : (
                    /* ENCUESTA: Layout original - donut pequeño a la izquierda, detalles a la derecha */
                    <div className="space-y-6">
                      {/* Distribución por Grupo - Bar Chart para Encuestas */}
                      <Card className="bg-white border-slate-200">
                        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b">
                          <h3 className="text-lg font-bold text-slate-900">Distribución por Grupo</h3>
                          <p className="text-sm text-slate-600">Cantidad de respuestas por grupo</p>
                        </div>
                        <CardContent className="p-6">
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={gruposArray}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                              <XAxis 
                                dataKey="name"
                                style={{ fontSize: '12px' }}
                              />
                              <YAxis />
                              <Tooltip 
                                formatter={(value: number, _name: string, props: any) => [
                                  `${value} respuestas (${props.payload.porcentaje}%)`,
                                  `Promedio: ${props.payload.promedio.toFixed(2)}`
                                ]}
                              />
                              <Bar dataKey="cantidad" radius={[8, 8, 0, 0]}>
                                {gruposArray.map((_entry: any, index: number) => (
                                  <Cell 
                                    key={`cell-${index}`} 
                                    fill={COLORS[index % COLORS.length]}
                                  />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Donut Chart - Grupos (pequeño) */}
                        <div className="lg:col-span-1">
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={gruposArray}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={3}
                                dataKey="cantidad"
                                label={(entry: any) => `${entry.porcentaje}%`}
                                labelLine={true}
                                onClick={(data) => setSelectedCluster(data.id)}
                                style={{ cursor: 'pointer' }}
                              >
                                {gruposArray.map((entry: any, index: number) => (
                                  <Cell 
                                    key={`cell-${index}`} 
                                    fill={COLORS[index % COLORS.length]}
                                    stroke={selectedCluster === entry.id ? '#000' : '#fff'}
                                    strokeWidth={selectedCluster === entry.id ? 3 : 1}
                                  />
                                ))}
                              </Pie>
                              <Tooltip 
                                formatter={(value: number, _name: string, props: any) => [
                                  `${value} respuestas (${props.payload.porcentaje}%)`,
                                  `Promedio: ${props.payload.promedio.toFixed(2)}`
                                ]}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>

                      {/* Información del grupo seleccionado (ocupa 3/4 del ancho) */}
                      <div className="lg:col-span-3">
                        <div className="space-y-4">
                          {/* Preguntas detalladas para encuesta */}
                          <div className="space-y-2">
                            <p className="text-sm font-bold text-slate-900 mb-3">Preguntas Detalladas</p>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                              {preguntasDelGrupo.map((pregunta: any, idx: number) => (
                                <div key={idx} className="border border-slate-200 rounded-lg">
                                  <button
                                    onClick={() => setExpandedQuestion(expandedQuestion === pregunta.pregunta ? null : pregunta.pregunta)}
                                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors"
                                  >
                                    <div className="flex-1 text-left">
                                      <p className="text-sm font-semibold text-slate-800">{pregunta.pregunta}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className={`text-sm font-bold ${
                                        pregunta.promedio >= 4 ? 'text-green-600' :
                                        pregunta.promedio >= 2.5 ? 'text-blue-600' :
                                        'text-amber-600'
                                      }`}>
                                        {pregunta.promedio.toFixed(1)}
                                      </span>
                                      {expandedQuestion === pregunta.pregunta ? (
                                        <ChevronUp className="h-4 w-4 text-slate-400" />
                                      ) : (
                                        <ChevronDown className="h-4 w-4 text-slate-400" />
                                      )}
                                    </div>
                                  </button>
                                  {expandedQuestion === pregunta.pregunta && (
                                    <div className="px-3 pb-3 pt-2 bg-slate-50 border-t border-slate-200">
                                      {/* Valor Esperado */}
                                      <div className="mb-3 p-2 bg-blue-50 border-l-2 border-blue-400 rounded">
                                        <p className="text-xs font-semibold text-blue-900 mb-1">Valor esperado:</p>
                                        <p className="text-xs text-blue-800 leading-relaxed">
                                          Cada respuesta de opción múltiple/única tiene un valor predeterminado que indica qué tan buena o mala es para la encuesta.
                                        </p>
                                        <p className="text-xs text-blue-700 mt-1 italic">
                                          Cerca de: <strong>{pregunta.valor_esperado || 'Tintos reserva'}</strong> (esperado: {pregunta.promedio_esperado || '2'}, actual: {pregunta.promedio.toFixed(1)})
                                        </p>
                                      </div>
                                      
                                      <p className="text-sm text-slate-700 mb-2 leading-relaxed">
                                        <strong>Interpretación:</strong> {pregunta.interpretacion}
                                      </p>
                                      <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                                        <div>
                                          <span className="text-slate-500">Mín:</span>
                                          <span className="font-semibold text-slate-700 ml-1">{pregunta.minimo}</span>
                                        </div>
                                        <div>
                                          <span className="text-slate-500">Máx:</span>
                                          <span className="font-semibold text-slate-700 ml-1">{pregunta.maximo}</span>
                                        </div>
                                        <div>
                                          <span className="text-slate-500">Mediana:</span>
                                          <span className="font-semibold text-slate-700 ml-1">{pregunta.mediana}</span>
                                        </div>
                                      </div>
                                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full rounded-full ${
                                            pregunta.promedio >= 4 ? 'bg-green-500' :
                                            pregunta.promedio >= 2.5 ? 'bg-blue-500' :
                                            'bg-amber-500'
                                          }`}
                                          style={{ width: `${(pregunta.promedio / 5) * 100}%` }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          )
        })()}
    </div>
  )
}
