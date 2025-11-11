import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { 
  GET_ENCUESTAS_QUERY,
  GET_CAMPANAS_QUERY,
  GET_ENTREGAS_QUERY,
  GET_DESTINATARIOS_QUERY
} from '@/graphql/queries'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Megaphone, 
  Send, 
  Users, 
  BarChart3, 
  Loader2,
  TrendingUp,
  Activity
} from 'lucide-react'

type AnalysisMode = 'encuesta' | 'campana' | null

// Página principal del dashboard - Home con Analytics
export default function DashboardHomePage() {
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>(null)

  const { data: encuestasData, loading: loadingEncuestas } = useQuery(GET_ENCUESTAS_QUERY)
  const { data: campanasData, loading: loadingCampanas } = useQuery(GET_CAMPANAS_QUERY)
  const { data: entregasData, loading: loadingEntregas } = useQuery(GET_ENTREGAS_QUERY)
  const { data: destinatariosData, loading: loadingDestinatarios } = useQuery(GET_DESTINATARIOS_QUERY)

  const encuestas = (encuestasData as any)?.encuestas || []
  const campanas = (campanasData as any)?.campanas || []
  const entregas = (entregasData as any)?.entregas || []
  const destinatarios = (destinatariosData as any)?.destinatarios || []

  const isLoading = loadingEncuestas || loadingCampanas || loadingEntregas || loadingDestinatarios

  const stats = {
    encuestas: encuestas.length,
    campanas: campanas.length,
    entregas: entregas.length,
    destinatarios: destinatarios.length,
    entregasCompletadas: entregas.filter((e: any) => e.respondido_en).length,
    tasaRespuesta: entregas.length > 0 
      ? Math.round((entregas.filter((e: any) => e.respondido_en).length / entregas.length) * 100)
      : 0
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-600" />
          <p className="mt-2 text-slate-600">Cargando datos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Analíticas Avanzadas</h1>
            <p className="text-slate-600 text-lg">
              Sistema de análisis inteligente con KMeans, Isolation Forest y TF-IDF
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <Activity className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-semibold text-blue-900">Sistema Activo</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Encuestas Card */}
        <Card className="bg-white border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-600">Total</p>
                <p className="text-3xl font-bold text-slate-900">{stats.encuestas}</p>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <p className="text-sm font-semibold text-slate-700">Encuestas Creadas</p>
              <p className="text-xs text-slate-500 mt-1">Formularios disponibles</p>
            </div>
          </CardContent>
        </Card>

        {/* Campañas Card */}
        <Card className="bg-white border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Megaphone className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-600">Total</p>
                <p className="text-3xl font-bold text-slate-900">{stats.campanas}</p>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <p className="text-sm font-semibold text-slate-700">Campañas Activas</p>
              <p className="text-xs text-slate-500 mt-1">Proyectos en curso</p>
            </div>
          </CardContent>
        </Card>

        {/* Entregas Card */}
        <Card className="bg-white border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Send className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-600">Total</p>
                <p className="text-3xl font-bold text-slate-900">{stats.entregas}</p>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <p className="text-sm font-semibold text-slate-700">Entregas Realizadas</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${stats.tasaRespuesta}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-emerald-600">{stats.tasaRespuesta}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Destinatarios Card */}
        <Card className="bg-white border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-600">Total</p>
                <p className="text-3xl font-bold text-slate-900">{stats.destinatarios}</p>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <p className="text-sm font-semibold text-slate-700">Destinatarios</p>
              <p className="text-xs text-slate-500 mt-1">Base de contactos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Mode Selection */}
      <Card className="bg-white border-slate-200 shadow-md">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 mb-4">
              <BarChart3 className="h-8 w-8 text-slate-700" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Selecciona el Tipo de Análisis</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Elige cómo deseas analizar tus datos. Nuestros algoritmos de Machine Learning (KMeans, Isolation Forest, TF-IDF) 
              procesarán la información para brindarte insights valiosos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Análisis por Encuesta */}
            <button
              onClick={() => setAnalysisMode('encuesta')}
              className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 ${
                analysisMode === 'encuesta'
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl shadow-blue-500/20'
                  : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
                  analysisMode === 'encuesta'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30'
                    : 'bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-blue-100 group-hover:to-blue-200'
                }`}>
                  <FileText className={`h-8 w-8 ${
                    analysisMode === 'encuesta' ? 'text-white' : 'text-slate-600 group-hover:text-blue-600'
                  }`} />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${
                  analysisMode === 'encuesta' ? 'text-blue-900' : 'text-slate-900'
                }`}>
                  Análisis por Encuesta
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Analiza respuestas, patrones y anomalías de encuestas individuales
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="text-xs px-3 py-1 bg-slate-100 text-slate-700 rounded-full">KMeans</span>
                  <span className="text-xs px-3 py-1 bg-slate-100 text-slate-700 rounded-full">Isolation Forest</span>
                  <span className="text-xs px-3 py-1 bg-slate-100 text-slate-700 rounded-full">TF-IDF</span>
                </div>
              </div>
              {analysisMode === 'encuesta' && (
                <div className="absolute top-4 right-4">
                  <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
            </button>

            {/* Análisis por Campaña */}
            <button
              onClick={() => setAnalysisMode('campana')}
              className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 ${
                analysisMode === 'campana'
                  ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-xl shadow-purple-500/20'
                  : 'border-slate-200 bg-white hover:border-purple-300 hover:shadow-lg'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
                  analysisMode === 'campana'
                    ? 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/30'
                    : 'bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-purple-100 group-hover:to-purple-200'
                }`}>
                  <Megaphone className={`h-8 w-8 ${
                    analysisMode === 'campana' ? 'text-white' : 'text-slate-600 group-hover:text-purple-600'
                  }`} />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${
                  analysisMode === 'campana' ? 'text-purple-900' : 'text-slate-900'
                }`}>
                  Análisis por Campaña
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Evalúa el rendimiento global de campañas y compara resultados
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="text-xs px-3 py-1 bg-slate-100 text-slate-700 rounded-full">Clustering</span>
                  <span className="text-xs px-3 py-1 bg-slate-100 text-slate-700 rounded-full">Detección</span>
                  <span className="text-xs px-3 py-1 bg-slate-100 text-slate-700 rounded-full">Análisis</span>
                </div>
              </div>
              {analysisMode === 'campana' && (
                <div className="absolute top-4 right-4">
                  <div className="h-6 w-6 rounded-full bg-purple-500 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
            </button>
          </div>

          {/* Botón de Acción */}
          {analysisMode && (
            <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Button
                className={`px-8 py-6 text-lg font-semibold rounded-xl shadow-lg transition-all duration-300 ${
                  analysisMode === 'encuesta'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-500/30'
                    : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-purple-500/30'
                }`}
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                Iniciar Análisis {analysisMode === 'encuesta' ? 'por Encuesta' : 'por Campaña'}
              </Button>
              <p className="text-sm text-slate-500 mt-3">
                Los resultados se generarán en tiempo real utilizando modelos de ML
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-bold text-blue-900 mb-2">KMeans Clustering</h3>
            <p className="text-sm text-blue-700">
              Agrupa respuestas similares para identificar patrones y segmentar audiencias
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <h3 className="font-bold text-purple-900 mb-2">Isolation Forest</h3>
            <p className="text-sm text-purple-700">
              Detecta anomalías y respuestas atípicas que requieren atención
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardContent className="p-6">
            <h3 className="font-bold text-emerald-900 mb-2">TF-IDF Analysis</h3>
            <p className="text-sm text-emerald-700">
              Analiza texto para extraer palabras clave y sentimientos
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

