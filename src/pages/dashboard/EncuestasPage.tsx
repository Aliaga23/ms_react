import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { 
  GET_ENCUESTAS_QUERY, 
  GET_TIPOS_PREGUNTA_QUERY, 
  GET_PREGUNTAS_QUERY,
  GET_PREGUNTAS_BY_ENCUESTA_QUERY,
  GET_OPCIONES_ENCUESTA_QUERY,
  GET_CANALES_QUERY,
  GET_CAMPANAS_QUERY
} from '@/graphql/queries'
import { 
  CREATE_ENCUESTA_MUTATION, 
  UPDATE_ENCUESTA_MUTATION, 
  DELETE_ENCUESTA_MUTATION,
  CREATE_PREGUNTA_MUTATION,
  UPDATE_PREGUNTA_MUTATION,
  DELETE_PREGUNTA_MUTATION,
  CREATE_OPCION_MUTATION,
  UPDATE_OPCION_MUTATION
} from '@/graphql/mutations'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, Loader2, AlertCircle, FileText, MessageSquare} from 'lucide-react'
import type { Encuesta, TipoPregunta, Pregunta, OpcionEncuesta, Canal, Campana } from '@/types'

interface PreguntaForm {
  id?: string
  orden: number
  texto: string
  obligatorio: boolean
  tipo_preguntaId: string
  opciones: OpcionForm[]
}

interface OpcionForm {
  id?: string
  texto: string
  valor: string
}

// Página de gestión de encuestas con preguntas
export default function EncuestasPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isPreguntasOpen, setIsPreguntasOpen] = useState(false)
  const [selectedEncuesta, setSelectedEncuesta] = useState<Encuesta | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  
  // Estados para gestión de preguntas
  const [selectedPregunta, setSelectedPregunta] = useState<Pregunta | null>(null)
  const [preguntaForm, setPreguntaForm] = useState<PreguntaForm>({
    orden: 1,
    texto: '',
    obligatorio: false,
    tipo_preguntaId: '',
    opciones: []
  })
  
  const [formData, setFormData] = useState({ 
    nombre: '', 
    descripcion: '', 
    activo: true,
    campanaId: '',
    canalId: ''
  })

  const { data, loading, error, refetch } = useQuery(GET_ENCUESTAS_QUERY)
  const { data: tiposData } = useQuery(GET_TIPOS_PREGUNTA_QUERY)
  const { data: canalesData } = useQuery(GET_CANALES_QUERY)
  const { data: campanasData } = useQuery(GET_CAMPANAS_QUERY)
  const { data: todasPreguntasData } = useQuery(GET_PREGUNTAS_QUERY)
  const { data: preguntasData, refetch: refetchPreguntas } = useQuery(GET_PREGUNTAS_BY_ENCUESTA_QUERY, {
    variables: { encuestaId: selectedEncuesta?.id || '' },
    skip: !selectedEncuesta?.id
  })
  const { data: opcionesData, refetch: refetchOpciones } = useQuery(GET_OPCIONES_ENCUESTA_QUERY)

  const tiposPreguntas = (tiposData as any)?.tiposPreguntas || []
  const canales = (canalesData as any)?.canales || []
  const campanas = (campanasData as any)?.campanas || []
  const todasLasPreguntas = (todasPreguntasData as any)?.preguntas || []
  const preguntasEncuesta = (preguntasData as any)?.preguntasByEncuesta || []
  const todasOpciones = (opcionesData as any)?.opcionesEncuesta || []

  // Obtener IDs de tipos de pregunta dinámicamente
  const tipoTextoId = tiposPreguntas.find((t: TipoPregunta) => t.nombre.toLowerCase() === 'texto')?.id
  const tipoNumeroId = tiposPreguntas.find((t: TipoPregunta) => t.nombre.toLowerCase() === 'número')?.id
  const tipoSeleccionUnicaId = tiposPreguntas.find((t: TipoPregunta) => t.nombre.toLowerCase().includes('única'))?.id
  const tipoSeleccionMultipleId = tiposPreguntas.find((t: TipoPregunta) => t.nombre.toLowerCase().includes('múltiple'))?.id

  const [createEncuesta, { loading: creating }] = useMutation(CREATE_ENCUESTA_MUTATION, {
    onCompleted: () => {
      setIsCreateOpen(false)
      setFormData({ nombre: '', descripcion: '', activo: true, campanaId: '', canalId: '' })
      refetch()
    },
    onError: (error: any) => {
      console.error('Error al crear encuesta:', error)
      alert('Error al crear la encuesta: ' + error.message)
    },
  })

  const [updateEncuesta, { loading: updating }] = useMutation(UPDATE_ENCUESTA_MUTATION, {
    onCompleted: () => {
      setIsEditOpen(false)
      setSelectedEncuesta(null)
      setFormData({ nombre: '', descripcion: '', activo: true, campanaId: '', canalId: '' })
      refetch()
    },
    onError: (error: any) => {
      console.error('Error al actualizar encuesta:', error)
      alert('Error al actualizar la encuesta: ' + error.message)
    },
  })

  const [deleteEncuesta] = useMutation(DELETE_ENCUESTA_MUTATION, {
    onCompleted: () => {
      refetch()
    },
    onError: (error: any) => {
      console.error('Error al eliminar encuesta:', error)
      alert('Error al eliminar la encuesta: ' + error.message)
    },
  })

  const [createPregunta, { loading: creatingPregunta }] = useMutation(CREATE_PREGUNTA_MUTATION, {
    onCompleted: () => {
      refetchPreguntas()
      setSelectedPregunta(null)
      setPreguntaForm({
        orden: 1,
        texto: '',
        obligatorio: false,
        tipo_preguntaId: tiposPreguntas.length > 0 ? tiposPreguntas[0].id : '',
        opciones: []
      })
    },
    onError: (error: any) => {
      console.error('Error al crear pregunta:', error)
      alert('Error al crear la pregunta: ' + error.message)
    },
  })

  const [updatePregunta, { loading: updatingPregunta }] = useMutation(UPDATE_PREGUNTA_MUTATION, {
    onCompleted: () => {
      refetchPreguntas()
      setSelectedPregunta(null)
      setPreguntaForm({
        orden: 1,
        texto: '',
        obligatorio: false,
        tipo_preguntaId: tiposPreguntas.length > 0 ? tiposPreguntas[0].id : '',
        opciones: []
      })
    },
    onError: (error: any) => {
      console.error('Error al actualizar pregunta:', error)
      alert('Error al actualizar la pregunta: ' + error.message)
    },
  })

  const [deletePregunta] = useMutation(DELETE_PREGUNTA_MUTATION, {
    onCompleted: () => {
      refetchPreguntas()
      refetchOpciones()
    },
    onError: (error: any) => {
      console.error('Error al eliminar pregunta:', error)
      alert('Error al eliminar la pregunta: ' + error.message)
    },
  })

  const [createOpcion] = useMutation(CREATE_OPCION_MUTATION, {
    onCompleted: () => {
      refetchOpciones()
    },
    onError: (error: any) => {
      console.error('Error al crear opción:', error)
      alert('Error al crear la opción: ' + error.message)
    },
  })

  const [updateOpcion] = useMutation(UPDATE_OPCION_MUTATION, {
    onError: (error: any) => {
      console.error('Error al actualizar opción:', error)
      alert('Error al actualizar la opción: ' + error.message)
    },
  })

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!formData.nombre.trim()) {
      alert('Por favor ingresa un nombre para la encuesta')
      return
    }

    await createEncuesta({
      variables: {
        createEncuestaInput: {
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim() || undefined,
          activo: formData.activo,
          campanaId: formData.campanaId || undefined,
          canalId: formData.canalId || undefined,
        },
      },
    })
  }

  const handleEdit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedEncuesta || !formData.nombre.trim()) {
      alert('Por favor ingresa un nombre válido')
      return
    }

    await updateEncuesta({
      variables: {
        id: selectedEncuesta.id,
        updateEncuestaInput: {
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim() || undefined,
          activo: formData.activo,
          campanaId: formData.campanaId || undefined,
          canalId: formData.canalId || undefined,
        },
      },
    })
  }

  const handleDelete = async (encuesta: Encuesta) => {
    if (window.confirm(`¿Estás seguro de eliminar la encuesta "${encuesta.nombre}"?`)) {
      await deleteEncuesta({
        variables: { id: encuesta.id },
      })
    }
  }

  const openEditDialog = (encuesta: Encuesta) => {
    setSelectedEncuesta(encuesta)
    setFormData({ 
      nombre: encuesta.nombre,
      descripcion: encuesta.descripcion || '',
      activo: encuesta.activo,
      campanaId: encuesta.campanaId || '',
      canalId: encuesta.canalId || ''
    })
    setIsEditOpen(true)
  }

  const openPreguntasDialog = async (encuesta: Encuesta) => {
    console.log('Abriendo modal de preguntas para:', encuesta)
    setSelectedEncuesta(encuesta)
    setIsPreguntasOpen(true)
  }

  const handleSavePregunta = async () => {
    if (!selectedEncuesta || !preguntaForm.texto.trim()) {
      alert('Por favor completa el texto de la pregunta')
      return
    }

    const tipoRequiereOpciones = preguntaForm.tipo_preguntaId === tipoSeleccionUnicaId || preguntaForm.tipo_preguntaId === tipoSeleccionMultipleId
    if (tipoRequiereOpciones && preguntaForm.opciones.length === 0) {
      alert('Este tipo de pregunta requiere al menos una opción')
      return
    }

    try {
      if (selectedPregunta) {
        // Actualizar pregunta existente
        await updatePregunta({
          variables: {
            id: selectedPregunta.id,
            updatePreguntaInput: {
              orden: preguntaForm.orden,
              texto: preguntaForm.texto,
              obligatorio: preguntaForm.obligatorio
            }
          }
        })

        // Actualizar opciones existentes y crear nuevas
        for (const opcion of preguntaForm.opciones) {
          if (opcion.id) {
            await updateOpcion({
              variables: {
                id: opcion.id,
                updateOpcionEncuestaInput: {
                  texto: opcion.texto,
                  valor: opcion.valor || undefined
                }
              }
            })
          } else {
            await createOpcion({
              variables: {
                createOpcionEncuestaInput: {
                  texto: opcion.texto,
                  valor: opcion.valor || undefined,
                  preguntaId: selectedPregunta.id
                }
              }
            })
          }
        }
      } else {
        // Crear nueva pregunta
        const result = await createPregunta({
          variables: {
            createPreguntaInput: {
              orden: preguntaForm.orden,
              texto: preguntaForm.texto,
              obligatorio: preguntaForm.obligatorio,
              encuestaId: selectedEncuesta.id,
              tipo_preguntaId: preguntaForm.tipo_preguntaId
            }
          }
        })

        const nuevaPreguntaId = (result.data as any)?.createPregunta?.id
        if (nuevaPreguntaId && preguntaForm.opciones.length > 0) {
          for (const opcion of preguntaForm.opciones) {
            await createOpcion({
              variables: {
                createOpcionEncuestaInput: {
                  texto: opcion.texto,
                  valor: opcion.valor || undefined,
                  preguntaId: nuevaPreguntaId
                }
              }
            })
          }
        }
      }
      refetchOpciones()
      await refetchPreguntas()
    } catch (error) {
      console.error('Error al guardar pregunta:', error)
    }
  }

  const handleDeletePregunta = async (pregunta: Pregunta) => {
    if (window.confirm(`¿Eliminar la pregunta "${pregunta.texto}"?`)) {
      await deletePregunta({ variables: { id: pregunta.id } })
      if (selectedPregunta?.id === pregunta.id) {
        setSelectedPregunta(null)
        setPreguntaForm({
          orden: 1,
          texto: '',
          obligatorio: false,
          tipo_preguntaId: tiposPreguntas.length > 0 ? tiposPreguntas[0].id : '',
          opciones: []
        })
      }
    }
  }

  const handleEditPregunta = (pregunta: Pregunta) => {
    setSelectedPregunta(pregunta)
    const opcionesPregunta = todasOpciones
      .filter((o: OpcionEncuesta) => o.preguntaId === pregunta.id)
      .map((o: OpcionEncuesta) => ({
        id: o.id,
        texto: o.texto,
        valor: o.valor || ''
      }))
    
    setPreguntaForm({
      id: pregunta.id,
      orden: pregunta.orden,
      texto: pregunta.texto,
      obligatorio: pregunta.obligatorio,
      tipo_preguntaId: pregunta.tipo_preguntaId,
      opciones: opcionesPregunta
    })
  }

  const addOpcion = () => {
    setPreguntaForm({
      ...preguntaForm,
      opciones: [...preguntaForm.opciones, { texto: '', valor: '' }]
    })
  }

  const removeOpcion = (index: number) => {
    setPreguntaForm({
      ...preguntaForm,
      opciones: preguntaForm.opciones.filter((_, i) => i !== index)
    })
  }

  const updateOpcionForm = (index: number, field: 'texto' | 'valor', value: string) => {
    const newOpciones = [...preguntaForm.opciones]
    newOpciones[index][field] = value
    setPreguntaForm({ ...preguntaForm, opciones: newOpciones })
  }

  useEffect(() => {
    if (!isPreguntasOpen) {
      setSelectedPregunta(null)
      setPreguntaForm({
        orden: 1,
        texto: '',
        obligatorio: false,
        tipo_preguntaId: tiposPreguntas.length > 0 ? tiposPreguntas[0].id : '',
        opciones: []
      })
    }
  }, [isPreguntasOpen, tiposPreguntas])

  // Inicializar tipo_preguntaId cuando se cargan los tipos de pregunta
  useEffect(() => {
    if (tiposPreguntas.length > 0 && !preguntaForm.tipo_preguntaId) {
      setPreguntaForm(prev => ({
        ...prev,
        tipo_preguntaId: tiposPreguntas[0].id
      }))
    }
  }, [tiposPreguntas])

  const encuestas: Encuesta[] = (data as any)?.encuestas || []
  const filteredEncuestas = encuestas.filter(encuesta => {
    const matchesSearch = encuesta.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (encuesta.descripcion && encuesta.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && encuesta.activo) ||
      (filterStatus === 'inactive' && !encuesta.activo)
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: encuestas.length,
    active: encuestas.filter(e => e.activo).length,
    inactive: encuestas.filter(e => !e.activo).length,
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Cargando encuestas...</p>
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
                <h3 className="font-semibold text-red-900">Error al cargar encuestas</h3>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total de Encuestas</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Encuestas Activas</p>
                <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Encuestas Inactivas</p>
                <p className="text-3xl font-bold text-gray-900">{stats.inactive}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
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
            placeholder="Buscar encuestas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg className="absolute left-3 top-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activas</option>
          <option value="inactive">Inactivas</option>
        </select>
        
        <Button 
          onClick={() => setIsCreateOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Encuesta
        </Button>
      </div>

      {/* Encuestas Grid */}
      {filteredEncuestas.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm || filterStatus !== 'all' ? 'No se encontraron encuestas' : 'No hay encuestas creadas'}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Intenta ajustar los filtros de búsqueda' 
                  : 'Crea tu primera encuesta para comenzar a recopilar datos'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <Button 
                  onClick={() => setIsCreateOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Encuesta
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredEncuestas.map((encuesta) => {
            // Contar preguntas de esta encuesta
            const preguntasCount = todasLasPreguntas.filter((p: Pregunta) => p.encuestaId === encuesta.id).length
            const preguntasObligatorias = todasLasPreguntas.filter((p: Pregunta) => p.encuestaId === encuesta.id && p.obligatorio).length
            
            // Contar opciones totales
            const preguntasIds = todasLasPreguntas.filter((p: Pregunta) => p.encuestaId === encuesta.id).map((p: Pregunta) => p.id)
            const opcionesCount = todasOpciones.filter((o: OpcionEncuesta) => preguntasIds.includes(o.preguntaId)).length
            
            return (
            <Card key={encuesta.id} className="group hover:shadow-lg transition-all duration-200 border-gray-200 flex flex-col h-full">
              <CardContent className="p-6 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    {encuesta.campanaId && (
                      <Badge className="bg-blue-500 text-white hover:bg-blue-600 mb-2 text-sm px-3 py-1">
                        {campanas.find((c: Campana) => c.id === encuesta.campanaId)?.nombre || 'Sin campaña'}
                      </Badge>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                      {encuesta.nombre}
                    </h3>
                    {encuesta.descripcion && (
                      <p className="text-sm text-gray-500 line-clamp-3 mb-3">
                        {encuesta.descripcion}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <Badge 
                        variant={encuesta.activo ? "default" : "secondary"}
                        className={encuesta.activo ? "bg-green-50 text-green-700 border-green-200" : ""}
                      >
                        {encuesta.activo ? 'Activa' : 'Inactiva'}
                      </Badge>
                      {encuesta.canalId && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {canales.find((c: Canal) => c.id === encuesta.canalId)?.nombre || 'Canal'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Estadísticas de la encuesta */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      Preguntas
                    </span>
                    <span className="font-semibold text-gray-900">{preguntasCount}</span>
                  </div>
                  {preguntasObligatorias > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Obligatorias
                      </span>
                      <span className="font-semibold text-red-600">{preguntasObligatorias}</span>
                    </div>
                  )}
                  {opcionesCount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Opciones totales</span>
                      <span className="font-semibold text-gray-900">{opcionesCount}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-9"
                    onClick={() => openPreguntasDialog(encuesta)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Gestionar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 px-3"
                    onClick={() => openEditDialog(encuesta)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                    onClick={() => handleDelete(encuesta)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            )
          })}
        </div>
      )}

      {/* Dialog de Creación */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Crear Nueva Encuesta</DialogTitle>
              <DialogDescription>
                Ingresa los datos de la nueva encuesta
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="nombre">Nombre de la encuesta</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Encuesta de Satisfacción"
                  className="mt-2"
                  disabled={creating}
                />
              </div>
              <div>
                <Label htmlFor="descripcion">Descripción (opcional)</Label>
                <textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Describe el propósito de esta encuesta..."
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  disabled={creating}
                />
              </div>
              <div>
                <Label htmlFor="campanaId">Campaña *</Label>
                <select
                  id="campanaId"
                  value={formData.campanaId}
                  onChange={(e) => setFormData({ ...formData, campanaId: e.target.value })}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={creating}
                  required
                >
                  <option value="">Selecciona una campaña</option>
                  {campanas.map((campana: Campana) => (
                    <option key={campana.id} value={campana.id}>{campana.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="canalId">Canal *</Label>
                <select
                  id="canalId"
                  value={formData.canalId}
                  onChange={(e) => setFormData({ ...formData, canalId: e.target.value })}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={creating}
                  required
                >
                  <option value="">Selecciona un canal</option>
                  {canales.map((canal: Canal) => (
                    <option key={canal.id} value={canal.id}>{canal.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label>Estado</Label>
                  <p className="text-xs text-gray-500">Las encuestas activas pueden recibir respuestas</p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`relative w-11 h-6 rounded-full transition-colors ${formData.activo ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${formData.activo ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </div>
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCreateOpen(false)}
                disabled={creating}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Encuesta'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Edición */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <form onSubmit={handleEdit}>
            <DialogHeader>
              <DialogTitle>Editar Encuesta</DialogTitle>
              <DialogDescription>
                Modifica los datos de la encuesta
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-nombre">Nombre de la encuesta</Label>
                <Input
                  id="edit-nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="mt-2"
                  disabled={updating}
                />
              </div>
              <div>
                <Label htmlFor="edit-descripcion">Descripción</Label>
                <textarea
                  id="edit-descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  disabled={updating}
                />
              </div>
              <div>
                <Label htmlFor="edit-campanaId">Campaña</Label>
                <select
                  id="edit-campanaId"
                  value={formData.campanaId}
                  onChange={(e) => setFormData({ ...formData, campanaId: e.target.value })}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={updating}
                >
                  <option value="">Selecciona una campaña</option>
                  {campanas.map((campana: Campana) => (
                    <option key={campana.id} value={campana.id}>{campana.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="edit-canalId">Canal</Label>
                <select
                  id="edit-canalId"
                  value={formData.canalId}
                  onChange={(e) => setFormData({ ...formData, canalId: e.target.value })}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={updating}
                >
                  <option value="">Selecciona un canal</option>
                  {canales.map((canal: Canal) => (
                    <option key={canal.id} value={canal.id}>{canal.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label>Estado</Label>
                  <p className="text-xs text-gray-500">Las encuestas activas pueden recibir respuestas</p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`relative w-11 h-6 rounded-full transition-colors ${formData.activo ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${formData.activo ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </div>
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditOpen(false)}
                disabled={updating}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updating}>
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Preguntas con dos paneles */}
      {isPreguntasOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-[55vw] h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0 flex justify-between items-start rounded-t-lg">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Gestión de Preguntas</h2>
                <p className="text-blue-600 font-medium mt-1">{selectedEncuesta?.nombre}</p>
              </div>
              <button 
                onClick={() => setIsPreguntasOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenido principal con dos paneles */}
            <div className="flex-1 overflow-hidden flex min-h-0">
              {/* Panel Izquierdo - Formulario */}
              <div className="w-[40%] border-r overflow-y-auto bg-white">
                <div className="p-4 space-y-4">
                <h4 className="font-semibold text-base mb-4 text-gray-900">
                  {selectedPregunta ? 'Editar Pregunta' : 'Nueva Pregunta'}
                </h4>
                
                <div className="space-y-4">
                  {/* Orden */}
                  <div>
                    <Label className="text-sm font-medium">Orden</Label>
                    <Input
                      type="number"
                      min="1"
                      value={preguntaForm.orden}
                      onChange={(e) => setPreguntaForm({ ...preguntaForm, orden: parseInt(e.target.value) || 1 })}
                      className="mt-1 h-9"
                    />
                  </div>

                  {/* Texto de la pregunta */}
                  <div>
                    <Label className="text-sm font-medium">Texto de la pregunta *</Label>
                    <textarea
                      value={preguntaForm.texto}
                      onChange={(e) => setPreguntaForm({ ...preguntaForm, texto: e.target.value })}
                      placeholder="¿Cuál es tu pregunta?"
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                      rows={2}
                    />
                  </div>

                  {/* Tipo de pregunta */}
                  <div>
                    <Label className="text-sm font-medium">Tipo de Pregunta</Label>
                    <select
                      value={preguntaForm.tipo_preguntaId}
                      onChange={(e) => {
                        const nuevoTipo = e.target.value
                        const requiereOpciones = nuevoTipo === tipoSeleccionUnicaId || nuevoTipo === tipoSeleccionMultipleId
                        setPreguntaForm({ 
                          ...preguntaForm, 
                          tipo_preguntaId: nuevoTipo,
                          opciones: requiereOpciones ? preguntaForm.opciones : []
                        })
                      }}
                      className="mt-1 w-full h-9 px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      disabled={!!selectedPregunta}
                    >
                      {tiposPreguntas.length === 0 ? (
                        <option value="">Cargando tipos...</option>
                      ) : (
                        tiposPreguntas.map((tipo: TipoPregunta) => (
                          <option key={tipo.id} value={tipo.id}>
                            {tipo.nombre}
                          </option>
                        ))
                      )}
                    </select>
                    {selectedPregunta && (
                      <p className="text-xs text-gray-500 mt-1">No se puede cambiar el tipo de una pregunta existente</p>
                    )}
                  </div>

                  {/* Obligatoria */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div>
                      <Label className="text-sm font-medium">¿Pregunta Obligatoria?</Label>
                      <p className="text-xs text-gray-500">Los usuarios deben responder</p>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preguntaForm.obligatorio}
                        onChange={(e) => setPreguntaForm({ ...preguntaForm, obligatorio: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`relative w-10 h-5 rounded-full transition-colors ${preguntaForm.obligatorio ? 'bg-blue-600' : 'bg-gray-300'}`}>
                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${preguntaForm.obligatorio ? 'translate-x-5' : 'translate-x-0'}`}></div>
                      </div>
                    </label>
                  </div>

                  {/* Opciones (solo para Selección Única y Múltiple) */}
                  {(preguntaForm.tipo_preguntaId === tipoSeleccionUnicaId || preguntaForm.tipo_preguntaId === tipoSeleccionMultipleId) && (
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-3">
                        <Label className="text-sm font-medium">Opciones</Label>
                        <Button
                          type="button"
                          size="sm"
                          onClick={addOpcion}
                          className="bg-blue-600 hover:bg-blue-700 h-8 px-3 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Agregar
                        </Button>
                      </div>

                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {preguntaForm.opciones.map((opcion, index) => (
                          <div key={index} className="flex gap-2 items-start p-2 bg-gray-50 rounded border">
                            <div className="flex-1 space-y-2">
                              <Input
                                placeholder="Texto"
                                value={opcion.texto}
                                onChange={(e) => updateOpcionForm(index, 'texto', e.target.value)}
                                className="h-8 text-sm"
                              />
                              <Input
                                placeholder="Valor"
                                value={opcion.valor}
                                onChange={(e) => updateOpcionForm(index, 'valor', e.target.value)}
                                className="h-8 text-sm"
                              />
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => removeOpcion(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Botones de acción */}
                  <div className="flex flex-col gap-2 pt-4 border-t">
                    <Button
                      type="button"
                      onClick={handleSavePregunta}
                      disabled={creatingPregunta || updatingPregunta}
                      className="w-full bg-blue-600 hover:bg-blue-700 h-9 text-sm"
                    >
                      {(creatingPregunta || updatingPregunta) ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          {selectedPregunta ? 'Actualizar Pregunta' : 'Agregar Pregunta'}
                        </>
                      )}
                    </Button>
                    {selectedPregunta && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setSelectedPregunta(null)
                          setPreguntaForm({
                            orden: 1,
                            texto: '',
                            obligatorio: false,
                            tipo_preguntaId: tiposPreguntas.length > 0 ? tiposPreguntas[0].id : '',
                            opciones: []
                          })
                        }}
                        className="w-full h-9 text-sm"
                      >
                        Cancelar Edición
                      </Button>
                    )}
                  </div>
                </div>
                </div>
              </div>

              {/* Panel Derecho - Vista Previa */}
              <div className="w-[60%] overflow-y-auto bg-gray-50">
                {/* Vista previa del formulario completo */}
                <div className="p-4 bg-white border-b">
                  <div className="mb-4">
                    <h2 className="text-lg font-bold text-gray-900 mb-1">{selectedEncuesta?.nombre}</h2>
                    <p className="text-gray-600 text-sm">{selectedEncuesta?.descripcion}</p>
                    <div className="mt-2 h-0.5 bg-blue-600 rounded-full w-12"></div>
                  </div>

                  {preguntasEncuesta.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium text-sm">No hay preguntas en esta encuesta</p>
                      <p className="text-gray-400 text-xs mt-1">Agrega preguntas para ver la vista previa</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {preguntasEncuesta.map((pregunta: Pregunta, index: number) => {
                        const opcionesPregunta = todasOpciones.filter((o: OpcionEncuesta) => o.preguntaId === pregunta.id)
                        const tipoPregunta = tiposPreguntas.find((t: TipoPregunta) => t.id === pregunta.tipo_preguntaId)
                        
                        return (
                          <div key={pregunta.id} className="pb-4">
                            {/* Separador entre preguntas (excepto la primera) */}
                            {index > 0 && <div className="border-t border-gray-200 mb-4"></div>}
                            
                            {/* Header con badges y botones */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                                  {pregunta.orden}
                                </span>
                                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                                  {tipoPregunta?.nombre || 'Desconocido'}
                                </Badge>
                                {pregunta.obligatorio && (
                                  <Badge className="text-xs px-2 py-0.5 bg-red-100 text-red-700">
                                    Obligatoria
                                  </Badge>
                                )}
                                {opcionesPregunta.length > 0 && (
                                  <span className="text-xs text-gray-500">
                                    ({opcionesPregunta.length} opciones)
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditPregunta(pregunta)}
                                  className="h-7 px-2"
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeletePregunta(pregunta)}
                                  className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            <div className="flex-1">
                              <h3 className="text-sm font-medium text-gray-900 mb-3">
                                {pregunta.texto}
                                {pregunta.obligatorio && <span className="text-red-500 ml-1">*</span>}
                              </h3>
                              
                              {/* Renderizado según tipo de pregunta */}
                              {pregunta.tipo_preguntaId === tipoTextoId && (
                                <input 
                                  type="text" 
                                  placeholder="Tu respuesta" 
                                  disabled 
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none bg-gray-50 text-gray-600 placeholder-gray-400 text-sm" 
                                />
                              )}
                              
                              {pregunta.tipo_preguntaId === tipoNumeroId && (
                                <input 
                                  type="number" 
                                  placeholder="Tu respuesta" 
                                  disabled 
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none bg-gray-50 text-gray-600 placeholder-gray-400 text-sm" 
                                />
                              )}
                              
                              {pregunta.tipo_preguntaId === tipoSeleccionUnicaId && (
                                <div className="space-y-2">
                                  {opcionesPregunta.length > 0 ? (
                                    opcionesPregunta.map((opcion: OpcionEncuesta) => (
                                      <label key={opcion.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                                        <input 
                                          type="radio" 
                                          name={`pregunta-${pregunta.id}`} 
                                          disabled 
                                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" 
                                        />
                                        <span className="text-gray-700 text-sm">{opcion.texto}</span>
                                        {opcion.valor && (
                                          <span className="text-xs text-gray-400">({opcion.valor})</span>
                                        )}
                                      </label>
                                    ))
                                  ) : (
                                    <div className="text-gray-400 italic text-xs p-2">No hay opciones configuradas</div>
                                  )}
                                </div>
                              )}
                              
                              {pregunta.tipo_preguntaId === tipoSeleccionMultipleId && (
                                <div className="space-y-2">
                                  {opcionesPregunta.length > 0 ? (
                                    opcionesPregunta.map((opcion: OpcionEncuesta) => (
                                      <label key={opcion.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                                        <input 
                                          type="checkbox" 
                                          disabled 
                                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                                        />
                                        <span className="text-gray-700 text-sm">{opcion.texto}</span>
                                        {opcion.valor && (
                                          <span className="text-xs text-gray-400">({opcion.valor})</span>
                                        )}
                                      </label>
                                    ))
                                  ) : (
                                    <div className="text-gray-400 italic text-xs p-2">No hay opciones configuradas</div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <button disabled className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium opacity-50 cursor-not-allowed text-sm">
                      Enviar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

