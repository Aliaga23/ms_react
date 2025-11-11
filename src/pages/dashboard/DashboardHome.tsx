import { useState, useEffect } from 'react'
import { useLazyQuery, useQuery } from '@apollo/client/react'
import { 
  GET_ENCUESTAS_QUERY,
  GET_CAMPANAS_QUERY,
  GET_ENTREGAS_QUERY,
  GET_DESTINATARIOS_QUERY,
  GET_RESPUESTAS_COMPLETAR_QUERY,
  GET_RESPUESTAS_BY_USUARIO_ENCUESTA_QUERY,
  GET_RESPUESTAS_COMPLETAR_BY_CAMPANA_QUERY,
  GET_RESPUESTAS_OPCIONES_BY_CAMPANA_QUERY
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
  Activity,
  ArrowLeft
} from 'lucide-react'
import AnalysisResults from '@/components/analytics/AnalysisResults'
import { useAuth } from '@/contexts/AuthContext'

type AnalysisMode = 'encuesta' | 'campana' | null

export default function DashboardHome() {
  const { user } = useAuth()
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>(null)
  const [selectedEncuestaId, setSelectedEncuestaId] = useState<string>('')
  const [selectedCampanaId, setSelectedCampanaId] = useState<string>('')
  const [showResults, setShowResults] = useState(false)
  const [parsedAnalysisData, setParsedAnalysisData] = useState<any>(null)
  const [parsedKmeansData, setParsedKmeansData] = useState<any>(null)

  const { data: encuestasData, loading: loadingEncuestas } = useQuery(GET_ENCUESTAS_QUERY)
  const { data: campanasData, loading: loadingCampanas } = useQuery(GET_CAMPANAS_QUERY)
  const { data: entregasData, loading: loadingEntregas } = useQuery(GET_ENTREGAS_QUERY)
  const { data: destinatariosData, loading: loadingDestinatarios } = useQuery(GET_DESTINATARIOS_QUERY)

  const [getRespuestasCompletar, { data: analysisData, loading: loadingAnalysis, error: analysisError }] = useLazyQuery(
    GET_RESPUESTAS_COMPLETAR_QUERY,
    {
      fetchPolicy: 'network-only'
    }
  )

  const [getRespuestasByUsuarioEncuesta, { data: kmeansData, loading: loadingKmeans, error: kmeansError }] = useLazyQuery(
    GET_RESPUESTAS_BY_USUARIO_ENCUESTA_QUERY,
    {
      fetchPolicy: 'network-only'
    }
  )

  const [getRespuestasByCampana, { data: campanaAnalysisData, loading: loadingCampanaAnalysis, error: campanaAnalysisError }] = useLazyQuery(
    GET_RESPUESTAS_COMPLETAR_BY_CAMPANA_QUERY,
    {
      fetchPolicy: 'network-only'
    }
  )

  const [getRespuestasOpcionesByCampana, { data: campanaKmeansData, loading: loadingCampanaKmeans, error: campanaKmeansError }] = useLazyQuery(
    GET_RESPUESTAS_OPCIONES_BY_CAMPANA_QUERY,
    {
      fetchPolicy: 'network-only'
    }
  )

  // Handle analysis data when it arrives
  useEffect(() => {
    if ((analysisData as any)?.respuestasCompletar) {
      try {
        const parsedData = typeof (analysisData as any).respuestasCompletar === 'string'
          ? JSON.parse((analysisData as any).respuestasCompletar)
          : (analysisData as any).respuestasCompletar
        setParsedAnalysisData(parsedData)
      } catch (error) {
        console.error('Error parsing analysis data:', error)
        alert('Error al procesar los resultados del análisis')
      }
    }
  }, [analysisData])

  // Handle analysis errors
  useEffect(() => {
    if (analysisError) {
      alert(`Error al obtener análisis TF-IDF/SVM: ${analysisError.message}`)
    }
  }, [analysisError])

  // Handle KMeans data when it arrives
  useEffect(() => {
    if ((kmeansData as any)?.respuestasByUsuarioEncuesta) {
      try {
        const parsedData = typeof (kmeansData as any).respuestasByUsuarioEncuesta === 'string'
          ? JSON.parse((kmeansData as any).respuestasByUsuarioEncuesta)
          : (kmeansData as any).respuestasByUsuarioEncuesta
        setParsedKmeansData(parsedData)
      } catch (error) {
        console.error('Error parsing KMeans data:', error)
        alert('Error al procesar los resultados del clustering')
      }
    }
  }, [kmeansData])

  // Handle KMeans errors
  useEffect(() => {
    if (kmeansError) {
      alert(`Error al obtener análisis KMeans: ${kmeansError.message}`)
    }
  }, [kmeansError])

  // Handle campaign analysis data when it arrives
  useEffect(() => {
    if ((campanaAnalysisData as any)?.respuestasCompletarByCampana) {
      try {
        const parsedData = typeof (campanaAnalysisData as any).respuestasCompletarByCampana === 'string'
          ? JSON.parse((campanaAnalysisData as any).respuestasCompletarByCampana)
          : (campanaAnalysisData as any).respuestasCompletarByCampana
        setParsedAnalysisData(parsedData)
      } catch (error) {
        console.error('Error parsing campaign analysis data:', error)
        alert('Error al procesar los resultados del análisis de campaña')
      }
    }
  }, [campanaAnalysisData])

  // Handle campaign analysis errors
  useEffect(() => {
    if (campanaAnalysisError) {
      alert(`Error al obtener análisis de campaña: ${campanaAnalysisError.message}`)
    }
  }, [campanaAnalysisError])

  // Handle campaign KMeans data when it arrives
  useEffect(() => {
    if ((campanaKmeansData as any)?.respuestasOpcionesByCampana) {
      try {
        const parsedData = typeof (campanaKmeansData as any).respuestasOpcionesByCampana === 'string'
          ? JSON.parse((campanaKmeansData as any).respuestasOpcionesByCampana)
          : (campanaKmeansData as any).respuestasOpcionesByCampana
        setParsedKmeansData(parsedData)
      } catch (error) {
        console.error('Error parsing campaign KMeans data:', error)
        alert('Error al procesar los resultados del clustering de campaña')
      }
    }
  }, [campanaKmeansData])

  // Handle campaign KMeans errors
  useEffect(() => {
    if (campanaKmeansError) {
      alert(`Error al obtener análisis KMeans de campaña: ${campanaKmeansError.message}`)
    }
  }, [campanaKmeansError])

  // Show results when analyses are complete
  useEffect(() => {
    // Para modo encuesta: esperar ambos análisis
    // Para modo campaña: esperar ambos análisis también
    if (analysisMode === 'encuesta') {
      if (parsedAnalysisData && parsedKmeansData && !showResults) {
        setShowResults(true)
      }
    } else if (analysisMode === 'campana') {
      if (parsedAnalysisData && parsedKmeansData && !showResults) {
        setShowResults(true)
      }
    }
  }, [parsedAnalysisData, parsedKmeansData, analysisMode, showResults])

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

  const handleStartAnalysis = () => {
    if (analysisMode === 'encuesta' && !selectedEncuestaId) {
      alert('Por favor selecciona una encuesta')
      return
    }

    if (analysisMode === 'campana' && !selectedCampanaId) {
      alert('Por favor selecciona una campaña')
      return
    }

    // Para análisis por encuesta, ejecutar ambas queries en paralelo
    if (analysisMode === 'encuesta') {
      if (!user?.id) {
        alert('Error: No se pudo obtener el usuario autenticado')
        return
      }

      // Query 1: TF-IDF/SVM/Isolation Forest
      getRespuestasCompletar({
        variables: {
          encuestaId: selectedEncuestaId,
          userId: null
        }
      })

      // Query 2: KMeans Clustering
      getRespuestasByUsuarioEncuesta({
        variables: {
          encuestaId: selectedEncuestaId,
          userId: user.id
        }
      })
    } else if (analysisMode === 'campana') {
      // Para campaña ejecutar ambas queries en paralelo
      getRespuestasByCampana({
        variables: {
          campanaId: selectedCampanaId
        }
      })

      getRespuestasOpcionesByCampana({
        variables: {
          campanaId: selectedCampanaId
        }
      })
    }
  }

  const handleBack = () => {
    setParsedAnalysisData(null)
    setParsedKmeansData(null)
    setShowResults(false)
    setAnalysisMode(null)
    setSelectedEncuestaId('')
    setSelectedCampanaId('')
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

  // Mostrar resultados del análisis
  if (showResults && parsedAnalysisData) {
    const selectedEncuesta = encuestas.find((e: any) => e.id === selectedEncuestaId)
    const selectedCampana = campanas.find((c: any) => c.id === selectedCampanaId)
    const isLoadingAnyAnalysis = loadingAnalysis || loadingKmeans || loadingCampanaAnalysis || loadingCampanaKmeans

    return (
      <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
        <div className="flex items-center gap-4">
          <Button
            onClick={handleBack}
            variant="outline"
            className="border-slate-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900">Resultados del Análisis</h2>
            <p className="text-slate-600">Procesado con Machine Learning</p>
          </div>
          {isLoadingAnyAnalysis && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-200">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm text-blue-900">Procesando análisis...</span>
            </div>
          )}
        </div>
        
        <AnalysisResults 
          data={parsedAnalysisData}
          kmeansData={parsedKmeansData}
          encuestaNombre={selectedEncuesta?.nombre || selectedCampana?.nombre}
        />
      </div>
    )
  }

  if (loadingEncuestas || loadingCampanas || loadingEntregas || loadingDestinatarios) {
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

          {/* Selector de Encuesta - Solo para modo encuesta */}
          {analysisMode === 'encuesta' && (
            <div className="mt-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Selecciona una Encuesta para Analizar
              </label>
              <select
                value={selectedEncuestaId}
                onChange={(e) => setSelectedEncuestaId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-900 font-medium focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                <option value="">-- Selecciona una encuesta --</option>
                {encuestas.map((encuesta: any) => (
                  <option key={encuesta.id} value={encuesta.id}>
                    {encuesta.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Selector de Campaña - Solo para modo campaña */}
          {analysisMode === 'campana' && (
            <div className="mt-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Selecciona una Campaña para Analizar
              </label>
              <select
                value={selectedCampanaId}
                onChange={(e) => setSelectedCampanaId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-900 font-medium focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
              >
                <option value="">-- Selecciona una campaña --</option>
                {campanas.map((campana: any) => (
                  <option key={campana.id} value={campana.id}>
                    {campana.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Botón de Acción */}
          {analysisMode && ((analysisMode === 'encuesta' && selectedEncuestaId) || (analysisMode === 'campana' && selectedCampanaId)) && (
            <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Button
                onClick={handleStartAnalysis}
                disabled={loadingAnalysis || loadingCampanaAnalysis || loadingKmeans || loadingCampanaKmeans}
                className={`px-8 py-6 text-lg font-semibold rounded-xl shadow-lg transition-all duration-300 ${
                  analysisMode === 'encuesta'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-500/30'
                    : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-purple-500/30'
                }`}
              >
                {(loadingAnalysis || loadingCampanaAnalysis || loadingKmeans || loadingCampanaKmeans) ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Procesando Análisis...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Iniciar Análisis {analysisMode === 'encuesta' ? 'por Encuesta' : 'por Campaña'}
                  </>
                )}
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
