import { useState } from 'react'
import type { FormEvent } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { 
  GET_ENTREGAS_QUERY,
  GET_ENCUESTAS_QUERY,
  GET_DESTINATARIOS_QUERY
} from '@/graphql/queries'
import { 
  CREATE_ENTREGA_MUTATION, 
  UPDATE_ENTREGA_MUTATION,
  CREATE_BULK_OCR_MUTATION,
  CREATE_BULK_AUDIO_MUTATION
} from '@/graphql/mutations'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Plus, Loader2, AlertCircle, Send, CheckCircle, Calendar, FileDown } from 'lucide-react'
import type { Entrega, Encuesta, Destinatario } from '@/types'

// Página de gestión de entregas
export default function EntregasPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isOcrOpen, setIsOcrOpen] = useState(false)
  const [isAudioOpen, setIsAudioOpen] = useState(false)
  const [selectedEntrega, setSelectedEntrega] = useState<Entrega | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [destinatarioSearch, setDestinatarioSearch] = useState('')
  const [selectedDestinatarios, setSelectedDestinatarios] = useState<string[]>([])
  const [destinatarioPage, setDestinatarioPage] = useState(1)
  const destinatariosPerPage = 20
  const [ocrCantidad, setOcrCantidad] = useState(30)
  const [audioCantidad, setAudioCantidad] = useState(30)
  
  const [formData, setFormData] = useState({ 
    destinatarioId: '',
    encuestaId: '',
    enviado_en: new Date().toISOString().split('T')[0],
    respondido_en: ''
  })

  const { data, loading, error, refetch } = useQuery(GET_ENTREGAS_QUERY)
  const { data: encuestasData } = useQuery(GET_ENCUESTAS_QUERY)
  const { data: destinatariosData } = useQuery(GET_DESTINATARIOS_QUERY)

  const encuestas = (encuestasData as any)?.encuestas || []
  const destinatarios = (destinatariosData as any)?.destinatarios || []

  const [createEntrega, { loading: creating }] = useMutation(CREATE_ENTREGA_MUTATION, {
    onCompleted: () => {
      setIsCreateOpen(false)
      setFormData({ 
        destinatarioId: '',
        encuestaId: '',
        enviado_en: new Date().toISOString().split('T')[0],
        respondido_en: ''
      })
      refetch()
    },
    onError: (error: any) => {
      console.error('Error al crear entrega:', error)
      alert('Error al crear la entrega: ' + error.message)
    },
  })

  const [updateEntrega, { loading: updating }] = useMutation(UPDATE_ENTREGA_MUTATION, {
    onCompleted: () => {
      setIsEditOpen(false)
      setSelectedEntrega(null)
      setFormData({ 
        destinatarioId: '',
        encuestaId: '',
        enviado_en: new Date().toISOString().split('T')[0],
        respondido_en: ''
      })
      refetch()
    },
    onError: (error: any) => {
      console.error('Error al actualizar entrega:', error)
      alert('Error al actualizar la entrega: ' + error.message)
    },
  })

  const [createBulkOCR, { loading: loadingOCR }] = useMutation(CREATE_BULK_OCR_MUTATION, {
    onCompleted: (data: any) => {
      // El resultado es el PDF en base64
      const pdfBase64 = data.createBulkOCR
      
      // Convertir base64 a blob
      const byteCharacters = atob(pdfBase64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'application/pdf' })
      
      // Descargar el PDF
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `entregas-ocr-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      setIsOcrOpen(false)
      alert('¡PDF generado exitosamente!')
    },
    onError: (error: any) => {
      console.error('Error al generar PDF OCR:', error)
      alert('Error al generar el PDF: ' + error.message)
    },
  })

  const [createBulkAudio, { loading: loadingAudio }] = useMutation(CREATE_BULK_AUDIO_MUTATION, {
    onCompleted: (data: any) => {
      const result = data.createBulkAudio
      setIsAudioOpen(false)
      refetch()
      alert(`¡${result.cantidad} entregas de audio creadas exitosamente!`)
    },
    onError: (error: any) => {
      console.error('Error al crear entregas de audio:', error)
      alert('Error al crear las entregas de audio: ' + error.message)
    },
  })

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (selectedDestinatarios.length === 0 || !formData.encuestaId) {
      alert('Por favor selecciona al menos un destinatario y una encuesta')
      return
    }

    try {
      // Crear entregas para cada destinatario seleccionado
      const promises = selectedDestinatarios.map((destinatarioId) => 
        createEntrega({
          variables: {
            createEntregaInput: {
              destinatarioId: destinatarioId,
              encuestaId: formData.encuestaId,
              enviado_en: new Date(formData.enviado_en).toISOString(),
            },
          },
        })
      )
      
      await Promise.all(promises)
      
      // Limpiar formulario y cerrar modal
      setIsCreateOpen(false)
      setSelectedDestinatarios([])
      setDestinatarioSearch('')
      setFormData({ 
        destinatarioId: '',
        encuestaId: '',
        enviado_en: new Date().toISOString().split('T')[0],
        respondido_en: ''
      })
      refetch()
    } catch (error: any) {
      console.error('Error al crear entregas:', error)
      alert('Error al crear las entregas: ' + error.message)
    }
  }

  const handleEdit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedEntrega) return

    await updateEntrega({
      variables: {
        id: selectedEntrega.id,
        updateEntregaInput: {
          destinatarioId: formData.destinatarioId || undefined,
          encuestaId: formData.encuestaId || undefined,
          enviado_en: formData.enviado_en ? new Date(formData.enviado_en).toISOString() : undefined,
          respondido_en: formData.respondido_en ? new Date(formData.respondido_en).toISOString() : undefined,
        },
      },
    })
  }

  const entregas: Entrega[] = (data as any)?.entregas || []
  
  // Filtrar destinatarios por búsqueda
  const filteredDestinatarios = destinatarios.filter((d: Destinatario) =>
    d.nombre.toLowerCase().includes(destinatarioSearch.toLowerCase()) ||
    d.email.toLowerCase().includes(destinatarioSearch.toLowerCase())
  )
  
  // Paginar destinatarios
  const totalDestinatarioPages = Math.ceil(filteredDestinatarios.length / destinatariosPerPage)
  const startDestinatarioIndex = (destinatarioPage - 1) * destinatariosPerPage
  const paginatedDestinatarios = filteredDestinatarios.slice(
    startDestinatarioIndex, 
    startDestinatarioIndex + destinatariosPerPage
  )
  
  const filteredEntregas = entregas.filter(entrega => {
    const destinatario = destinatarios.find((d: Destinatario) => d.id === entrega.destinatarioId)
    const encuesta = encuestas.find((e: Encuesta) => e.id === entrega.encuestaId)
    
    const matchesSearch = 
      destinatario?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      encuesta?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  // Agrupar entregas por canal
  const entregasPorCanal = filteredEntregas.reduce((acc, entrega) => {
    const encuesta = encuestas.find((e: Encuesta) => e.id === entrega.encuestaId)
    const canalId = encuesta?.canalId || 'sin-canal'
    
    if (!acc[canalId]) {
      acc[canalId] = []
    }
    acc[canalId].push(entrega)
    return acc
  }, {} as Record<string, typeof entregas>)

  const stats = {
    total: entregas.length,
    completadas: entregas.filter(e => e.respondido_en).length,
    pendientes: entregas.filter(e => !e.respondido_en).length,
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Cargando entregas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Error al cargar entregas</h3>
                <p className="text-sm text-red-800 mt-1">{error.message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8 bg-gray-50 min-h-screen">
      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total de Entregas</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <Send className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pendientes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendientes}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-yellow-50 flex items-center justify-center">
                <Send className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completadas</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completadas}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar por campaña, destinatario o encuesta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg className="absolute left-3 top-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Entrega
          </Button>
          
          <Button 
            onClick={() => setIsOcrOpen(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Entregas OCR
          </Button>

          <Button 
            onClick={() => setIsAudioOpen(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Send className="h-4 w-4 mr-2" />
            Entregas Audio
          </Button>
        </div>
      </div>

      {/* Lista de Entregas Agrupadas por Canal */}
      {filteredEntregas.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Send className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No se encontraron entregas' : 'No hay entregas creadas'}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {searchTerm 
                  ? 'Intenta ajustar la búsqueda' 
                  : 'Crea tu primera entrega para enviar encuestas'
                }
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => setIsCreateOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Entrega
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(entregasPorCanal).map(([canalId, entregasCanal]) => {
            const nombreCanal = canalId === 'sin-canal' ? 'Sin Canal Asignado' : `Canal: ${canalId.slice(0, 8)}...`
            
            return (
              <Card key={canalId} className="overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
                  <h3 className="text-lg font-bold text-gray-900">{nombreCanal}</h3>
                  <p className="text-sm text-gray-600">{entregasCanal.length} entrega(s)</p>
                </div>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Destinatario
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Encuesta
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Enviado
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {entregasCanal.map((entrega) => {
                          const destinatario = destinatarios.find((d: Destinatario) => d.id === entrega.destinatarioId)
                          const encuesta = encuestas.find((e: Encuesta) => e.id === entrega.encuestaId)
                          
                          return (
                            <tr key={entrega.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {destinatario?.nombre || 'No encontrado'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-600">
                                  {destinatario?.email || 'No encontrado'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {encuesta?.nombre || 'Encuesta no encontrada'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  {new Date(entrega.enviado_en).toLocaleDateString('es-ES')}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {entrega.respondido_en ? (
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-sm text-green-700 font-medium">Completada</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Send className="h-4 w-4 text-yellow-500" />
                                    <span className="text-sm text-yellow-700 font-medium">Pendiente</span>
                                  </div>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal de Creación Personalizado */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
            <form onSubmit={handleCreate}>
              {/* Header */}
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h3 className="text-xl font-bold text-gray-900">Crear Nueva Entrega Masiva</h3>
                <p className="text-sm text-gray-600 mt-1">Selecciona destinatarios y asigna una encuesta</p>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
                <div className="space-y-6">
                  {/* Selector de destinatarios */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                      Destinatarios * {selectedDestinatarios.length > 0 && (
                        <span className="ml-2 text-blue-600 font-normal">
                          ({selectedDestinatarios.length} seleccionados)
                        </span>
                      )}
                    </Label>
                    
                    {/* Barra de búsqueda y acciones */}
                    <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            placeholder="Buscar por nombre o email..."
                            value={destinatarioSearch}
                            onChange={(e) => {
                              setDestinatarioSearch(e.target.value)
                              setDestinatarioPage(1)
                            }}
                            className="block w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const pageIds = paginatedDestinatarios.map((d: Destinatario) => d.id)
                              setSelectedDestinatarios([...new Set([...selectedDestinatarios, ...pageIds])])
                            }}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            Seleccionar página
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedDestinatarios([])}
                            className="text-gray-600"
                          >
                            Limpiar
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Destinatarios seleccionados */}
                    {selectedDestinatarios.length > 0 && (
                      <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-blue-500" />
                            Destinatarios Seleccionados ({selectedDestinatarios.length})
                          </h4>
                          <button
                            type="button"
                            onClick={() => setSelectedDestinatarios([])}
                            className="text-xs text-red-600 hover:text-red-800 font-medium"
                          >
                            Remover todos
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                          {selectedDestinatarios.slice(0, 10).map((id) => {
                            const destinatario = destinatarios.find((d: Destinatario) => d.id === id)
                            if (!destinatario) return null
                            return (
                              <div key={id} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-blue-200 shadow-sm group">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-bold text-white">
                                    {destinatario.nombre?.charAt(0)?.toUpperCase() || 'U'}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{destinatario.nombre}</p>
                                  <p className="text-xs text-gray-500 truncate">{destinatario.email}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setSelectedDestinatarios(selectedDestinatarios.filter(did => did !== id))}
                                  className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 p-1"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            )
                          })}
                          {selectedDestinatarios.length > 10 && (
                            <div className="col-span-2 text-center text-sm text-gray-500 py-2">
                              ... y {selectedDestinatarios.length - 10} más
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Lista de destinatarios con paginación */}
                    <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-900">Destinatarios Disponibles</h4>
                        <span className="text-xs text-gray-500">
                          Mostrando {startDestinatarioIndex + 1}-{Math.min(startDestinatarioIndex + destinatariosPerPage, filteredDestinatarios.length)} de {filteredDestinatarios.length}
                        </span>
                      </div>
                      
                      <div className="max-h-60 overflow-y-auto">
                        {paginatedDestinatarios.length === 0 ? (
                          <div className="p-8 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </div>
                            <h3 className="text-sm font-medium text-gray-900 mb-1">No se encontraron destinatarios</h3>
                            <p className="text-xs text-gray-500">Intenta ajustar tu búsqueda</p>
                          </div>
                        ) : (
                          paginatedDestinatarios.map((destinatario: Destinatario) => {
                            const isSelected = selectedDestinatarios.includes(destinatario.id)
                            return (
                              <button
                                key={destinatario.id}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedDestinatarios(selectedDestinatarios.filter(id => id !== destinatario.id))
                                  } else {
                                    setSelectedDestinatarios([...selectedDestinatarios, destinatario.id])
                                  }
                                }}
                                className={`w-full p-4 text-left transition-all border-l-4 ${
                                  isSelected ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50 border-transparent'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    isSelected ? 'bg-blue-500' : 'bg-gray-400'
                                  }`}>
                                    <span className="text-sm font-bold text-white">
                                      {destinatario.nombre?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`font-semibold truncate ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                      {destinatario.nombre}
                                    </p>
                                    <p className={`text-sm truncate ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                                      {destinatario.email}
                                    </p>
                                  </div>
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                    isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                                  }`}>
                                    {isSelected && (
                                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </div>
                                </div>
                              </button>
                            )
                          })
                        )}
                      </div>

                      {/* Paginación */}
                      {totalDestinatarioPages > 1 && (
                        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setDestinatarioPage(p => Math.max(1, p - 1))}
                            disabled={destinatarioPage === 1}
                            className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                          >
                            ← Anterior
                          </button>
                          <span className="text-sm text-gray-600">
                            Página {destinatarioPage} de {totalDestinatarioPages}
                          </span>
                          <button
                            type="button"
                            onClick={() => setDestinatarioPage(p => Math.min(totalDestinatarioPages, p + 1))}
                            disabled={destinatarioPage === totalDestinatarioPages}
                            className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                          >
                            Siguiente →
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Resumen */}
                    {selectedDestinatarios.length > 0 && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-green-800">
                            {selectedDestinatarios.length} destinatario{selectedDestinatarios.length > 1 ? 's' : ''} seleccionado{selectedDestinatarios.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Selector de encuesta */}
                  <div>
                    <Label htmlFor="encuesta" className="text-sm font-semibold text-gray-700 mb-2 block">Encuesta *</Label>
                    <select
                      id="encuesta"
                      value={formData.encuestaId}
                      onChange={(e) => setFormData({ ...formData, encuestaId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={creating}
                    >
                      <option value="">Selecciona una encuesta</option>
                      {encuestas.map((e: Encuesta) => (
                        <option key={e.id} value={e.id}>{e.nombre}</option>
                      ))}
                    </select>
                  </div>

                  {/* Fecha de envío */}
                  <div>
                    <Label htmlFor="enviado_en" className="text-sm font-semibold text-gray-700 mb-2 block">Fecha de envío *</Label>
                    <Input
                      id="enviado_en"
                      type="date"
                      value={formData.enviado_en}
                      onChange={(e) => setFormData({ ...formData, enviado_en: e.target.value })}
                      className="px-4 py-3"
                      disabled={creating}
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setIsCreateOpen(false)
                    setSelectedDestinatarios([])
                    setDestinatarioSearch('')
                    setDestinatarioPage(1)
                  }}
                  disabled={creating}
                  className="px-6"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={creating || selectedDestinatarios.length === 0 || !formData.encuestaId}
                  className="px-6 bg-blue-600 hover:bg-blue-700"
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creando {selectedDestinatarios.length} entrega{selectedDestinatarios.length > 1 ? 's' : ''}...
                    </>
                  ) : (
                    <>Crear {selectedDestinatarios.length} Entrega{selectedDestinatarios.length > 1 ? 's' : ''}</>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edición Personalizado */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <form onSubmit={handleEdit}>
              {/* Header */}
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h3 className="text-xl font-bold text-gray-900">Editar Entrega</h3>
                <p className="text-sm text-gray-600 mt-1">Modifica los datos de la entrega</p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                <div>
                  <Label htmlFor="edit-destinatario">Destinatario</Label>
                  <select
                    id="edit-destinatario"
                    value={formData.destinatarioId}
                    onChange={(e) => setFormData({ ...formData, destinatarioId: e.target.value })}
                    className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={updating}
                  >
                    <option value="">Selecciona un destinatario</option>
                    {destinatarios.map((d: Destinatario) => (
                      <option key={d.id} value={d.id}>{d.nombre} ({d.email})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="edit-encuesta">Encuesta</Label>
                  <select
                    id="edit-encuesta"
                    value={formData.encuestaId}
                    onChange={(e) => setFormData({ ...formData, encuestaId: e.target.value })}
                    className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={updating}
                  >
                    <option value="">Selecciona una encuesta</option>
                    {encuestas.map((e: Encuesta) => (
                      <option key={e.id} value={e.id}>{e.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="edit-enviado_en">Fecha de envío</Label>
                  <Input
                    id="edit-enviado_en"
                    type="date"
                    value={formData.enviado_en}
                    onChange={(e) => setFormData({ ...formData, enviado_en: e.target.value })}
                    className="mt-2 px-4 py-3"
                    disabled={updating}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-respondido_en">Fecha de respuesta</Label>
                  <Input
                    id="edit-respondido_en"
                    type="date"
                    value={formData.respondido_en}
                    onChange={(e) => setFormData({ ...formData, respondido_en: e.target.value })}
                    className="mt-2 px-4 py-3"
                    disabled={updating}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                  disabled={updating}
                  className="px-6"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={updating}
                  className="px-6 bg-blue-600 hover:bg-blue-700"
                >
                  {updating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Cambios'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Entregas OCR */}
      {isOcrOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
              <h3 className="text-xl font-bold text-gray-900">Generar Entregas para OCR</h3>
              <p className="text-sm text-gray-600 mt-1">
                Genera múltiples entregas con códigos QR en un PDF para respuestas físicas
              </p>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <Label htmlFor="ocr-encuesta" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Encuesta *
                </Label>
                <select
                  id="ocr-encuesta"
                  value={formData.encuestaId}
                  onChange={(e) => setFormData({ ...formData, encuestaId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={loadingOCR}
                >
                  <option value="">Selecciona una encuesta</option>
                  {encuestas.map((e: Encuesta) => (
                    <option key={e.id} value={e.id}>{e.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="ocr-cantidad" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Cantidad de entregas
                </Label>
                <Input
                  id="ocr-cantidad"
                  type="number"
                  min={1}
                  max={1000}
                  value={ocrCantidad}
                  onChange={(e) => setOcrCantidad(parseInt(e.target.value) || 1)}
                  className="px-4 py-3"
                  disabled={loadingOCR}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Máximo 1000 entregas por PDF
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-purple-800 mb-1">
                      Información sobre Entregas OCR
                    </h5>
                    <p className="text-xs text-purple-700">
                      Se generará un PDF con códigos QR únicos para cada entrega. 
                      Los destinatarios pueden escanear estos códigos para responder la encuesta.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  setIsOcrOpen(false)
                  setFormData({ ...formData, encuestaId: '' })
                  setOcrCantidad(30)
                }}
                disabled={loadingOCR}
                className="px-6"
              >
                Cancelar
              </Button>
              <Button 
                onClick={async () => {
                  if (!formData.encuestaId) {
                    alert('Por favor selecciona una encuesta')
                    return
                  }
                  if (ocrCantidad < 1 || ocrCantidad > 1000) {
                    alert('La cantidad debe estar entre 1 y 1000')
                    return
                  }
                  await createBulkOCR({
                    variables: {
                      encuestaId: formData.encuestaId,
                      cantidad: ocrCantidad
                    }
                  })
                }}
                disabled={loadingOCR || !formData.encuestaId}
                className="px-6 bg-purple-600 hover:bg-purple-700"
              >
                {loadingOCR ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generando PDF...
                  </>
                ) : (
                  <>
                    <FileDown className="h-4 w-4 mr-2" />
                    Generar PDF con {ocrCantidad} entregas
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Entregas Audio */}
      {isAudioOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <h3 className="text-xl font-bold text-gray-900">Generar Entregas para Audio</h3>
              <p className="text-sm text-gray-600 mt-1">
                Genera múltiples entregas para respuestas por audio
              </p>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <Label htmlFor="audio-encuesta" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Encuesta *
                </Label>
                <select
                  id="audio-encuesta"
                  value={formData.encuestaId}
                  onChange={(e) => setFormData({ ...formData, encuestaId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={loadingAudio}
                >
                  <option value="">Selecciona una encuesta</option>
                  {encuestas.map((e: Encuesta) => (
                    <option key={e.id} value={e.id}>{e.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="audio-cantidad" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Cantidad de entregas
                </Label>
                <Input
                  id="audio-cantidad"
                  type="number"
                  min={1}
                  max={1000}
                  value={audioCantidad}
                  onChange={(e) => setAudioCantidad(parseInt(e.target.value) || 1)}
                  className="px-4 py-3"
                  disabled={loadingAudio}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Máximo 1000 entregas
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-green-800 mb-1">
                      Información sobre Entregas Audio
                    </h5>
                    <p className="text-xs text-green-700">
                      Se generarán entregas para que los destinatarios puedan responder mediante audio.
                      Las entregas estarán listas para ser asignadas a destinatarios.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  setIsAudioOpen(false)
                  setFormData({ ...formData, encuestaId: '' })
                  setAudioCantidad(30)
                }}
                disabled={loadingAudio}
                className="px-6"
              >
                Cancelar
              </Button>
              <Button 
                onClick={async () => {
                  if (!formData.encuestaId) {
                    alert('Por favor selecciona una encuesta')
                    return
                  }
                  if (audioCantidad < 1 || audioCantidad > 1000) {
                    alert('La cantidad debe estar entre 1 y 1000')
                    return
                  }
                  await createBulkAudio({
                    variables: {
                      input: {
                        encuestaId: formData.encuestaId,
                        cantidad: audioCantidad
                      }
                    }
                  })
                }}
                disabled={loadingAudio || !formData.encuestaId}
                className="px-6 bg-green-600 hover:bg-green-700"
              >
                {loadingAudio ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creando entregas...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Crear {audioCantidad} entregas
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
