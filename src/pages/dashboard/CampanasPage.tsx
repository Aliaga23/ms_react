import { useState } from 'react'
import type { FormEvent } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { GET_CAMPANAS_QUERY } from '@/graphql/queries'
import { 
  CREATE_CAMPANA_MUTATION, 
  UPDATE_CAMPANA_MUTATION, 
  DELETE_CAMPANA_MUTATION 
} from '@/graphql/mutations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, Loader2, AlertCircle, Calendar, Mail } from 'lucide-react'

interface Campana {
  id: string
  nombre: string
  creado_en: string
  actualizado_en?: string
}

// Página de gestión de campañas
export default function CampanasPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedCampana, setSelectedCampana] = useState<Campana | null>(null)
  const [formData, setFormData] = useState({ nombre: '' })

  const { data, loading, error, refetch } = useQuery(GET_CAMPANAS_QUERY)

  const [createCampana, { loading: creating }] = useMutation(CREATE_CAMPANA_MUTATION, {
    onCompleted: () => {
      setIsCreateOpen(false)
      setFormData({ nombre: '' })
      refetch()
    },
    onError: (error: any) => {
      console.error('Error al crear campaña:', error)
      alert('Error al crear la campaña: ' + error.message)
    },
  })

  const [updateCampana, { loading: updating }] = useMutation(UPDATE_CAMPANA_MUTATION, {
    onCompleted: () => {
      setIsEditOpen(false)
      setSelectedCampana(null)
      setFormData({ nombre: '' })
      refetch()
    },
    onError: (error: any) => {
      console.error('Error al actualizar campaña:', error)
      alert('Error al actualizar la campaña: ' + error.message)
    },
  })

  const [deleteCampana] = useMutation(DELETE_CAMPANA_MUTATION, {
    onCompleted: () => {
      refetch()
    },
    onError: (error: any) => {
      console.error('Error al eliminar campaña:', error)
      alert('Error al eliminar la campaña: ' + error.message)
    },
  })

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!formData.nombre.trim()) {
      alert('Por favor ingresa un nombre para la campaña')
      return
    }

    await createCampana({
      variables: {
        createCampanaInput: {
          nombre: formData.nombre.trim(),
        },
      },
    })
  }

  const handleEdit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedCampana || !formData.nombre.trim()) {
      alert('Por favor ingresa un nombre válido')
      return
    }

    await updateCampana({
      variables: {
        id: selectedCampana.id,
        updateCampanaInput: {
          nombre: formData.nombre.trim(),
        },
      },
    })
  }

  const handleDelete = async (campana: Campana) => {
    if (window.confirm(`¿Estás seguro de eliminar la campaña "${campana.nombre}"?`)) {
      await deleteCampana({
        variables: { id: campana.id },
      })
    }
  }

  const openEditDialog = (campana: Campana) => {
    setSelectedCampana(campana)
    setFormData({ nombre: campana.nombre })
    setIsEditOpen(true)
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Cargando campañas...</p>
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
                <h3 className="font-semibold text-red-900">Error al cargar campañas</h3>
                <p className="text-sm text-red-800 mt-1">{error.message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const campanas: Campana[] = (data as any)?.campanas || []

  return (
    <div className="space-y-6 p-8 bg-gray-50 min-h-screen">
      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total de Campañas</p>
                <p className="text-3xl font-bold text-gray-900">{campanas.length}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Respuestas Recibidas</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Campañas Activas</p>
                <p className="text-3xl font-bold text-gray-900">{campanas.length}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-purple-600" />
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
            placeholder="Buscar campañas..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg className="absolute left-3 top-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select className="px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>Todos los estados</option>
          <option>Activas</option>
          <option>Pausadas</option>
          <option>Finalizadas</option>
        </select>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Campaña
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Crear Nueva Campaña</DialogTitle>
                <DialogDescription>
                  Ingresa el nombre de la nueva campaña
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="nombre">Nombre de la campaña</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ nombre: e.target.value })}
                  placeholder="Ej: Campaña Q1 2025"
                  className="mt-2"
                  disabled={creating}
                />
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
                    'Crear Campaña'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Campañas Grid */}
      {campanas.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay campañas creadas</h3>
              <p className="text-sm text-gray-500 mb-6">
                Crea tu primera campaña para organizar tus encuestas
              </p>
              <Button 
                onClick={() => setIsCreateOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Campaña
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campanas.map((campana) => (
            <Card key={campana.id} className="group hover:shadow-md transition-all duration-200 border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-semibold text-gray-900 truncate">
                      {campana.nombre}
                    </CardTitle>
                    <CardDescription className="mt-1 text-xs text-gray-500">
                      Creada el {new Date(campana.creado_en).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="ml-2 bg-green-50 text-green-700 border-green-200 text-xs">
                    Activa
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  <span>
                    {campana.actualizado_en 
                      ? `Actualizada ${new Date(campana.actualizado_en).toLocaleDateString('es-ES')}`
                      : 'Sin actualizar'
                    }
                  </span>
                </div>
                <div className="pt-2 border-t flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-8 text-xs"
                    onClick={() => openEditDialog(campana)}
                  >
                    <Pencil className="h-3 w-3 mr-1.5" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                    onClick={() => handleDelete(campana)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
            </div>
          )}

      {/* Dialog de Edición */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <form onSubmit={handleEdit}>
            <DialogHeader>
              <DialogTitle>Editar Campaña</DialogTitle>
              <DialogDescription>
                Modifica el nombre de la campaña
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="edit-nombre">Nombre de la campaña</Label>
              <Input
                id="edit-nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ nombre: e.target.value })}
                placeholder="Ej: Campaña Q1 2025"
                className="mt-2"
                disabled={updating}
              />
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
    </div>
  )
}
