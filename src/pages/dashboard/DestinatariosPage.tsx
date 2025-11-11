import { useState } from 'react'
import type { FormEvent } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { GET_DESTINATARIOS_QUERY } from '@/graphql/queries'
import { 
  CREATE_DESTINATARIO_MUTATION, 
  UPDATE_DESTINATARIO_MUTATION, 
  DELETE_DESTINATARIO_MUTATION 
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
import { Plus, Pencil, Trash2, Loader2, AlertCircle, Users, Mail, Phone } from 'lucide-react'
import type { Destinatario } from '@/types'

// Página de gestión de destinatarios
export default function DestinatariosPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedDestinatario, setSelectedDestinatario] = useState<Destinatario | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20 // Mostrar 20 destinatarios por página
  
  const [formData, setFormData] = useState({ 
    nombre: '', 
    email: '', 
    telefono: ''
  })

  const { data, loading, error, refetch } = useQuery(GET_DESTINATARIOS_QUERY)

  const [createDestinatario, { loading: creating }] = useMutation(CREATE_DESTINATARIO_MUTATION, {
    onCompleted: () => {
      setIsCreateOpen(false)
      setFormData({ nombre: '', email: '', telefono: '' })
      refetch()
    },
    onError: (error: any) => {
      console.error('Error al crear destinatario:', error)
      alert('Error al crear el destinatario: ' + error.message)
    },
  })

  const [updateDestinatario, { loading: updating }] = useMutation(UPDATE_DESTINATARIO_MUTATION, {
    onCompleted: () => {
      setIsEditOpen(false)
      setSelectedDestinatario(null)
      setFormData({ nombre: '', email: '', telefono: '' })
      refetch()
    },
    onError: (error: any) => {
      console.error('Error al actualizar destinatario:', error)
      alert('Error al actualizar el destinatario: ' + error.message)
    },
  })

  const [deleteDestinatario] = useMutation(DELETE_DESTINATARIO_MUTATION, {
    onCompleted: () => {
      refetch()
    },
    onError: (error: any) => {
      console.error('Error al eliminar destinatario:', error)
      alert('Error al eliminar el destinatario: ' + error.message)
    },
  })

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!formData.nombre.trim() || !formData.email.trim()) {
      alert('Por favor ingresa nombre y email')
      return
    }

    await createDestinatario({
      variables: {
        createDestinatarioInput: {
          nombre: formData.nombre.trim(),
          email: formData.email.trim(),
          telefono: formData.telefono.trim() || undefined,
        },
      },
    })
  }

  const handleEdit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedDestinatario || !formData.nombre.trim() || !formData.email.trim()) {
      alert('Por favor ingresa nombre y email válidos')
      return
    }

    await updateDestinatario({
      variables: {
        id: selectedDestinatario.id,
        updateDestinatarioInput: {
          nombre: formData.nombre.trim(),
          email: formData.email.trim(),
          telefono: formData.telefono.trim() || undefined,
        },
      },
    })
  }

  const handleDelete = async (destinatario: Destinatario) => {
    if (window.confirm(`¿Estás seguro de eliminar a "${destinatario.nombre}"?`)) {
      await deleteDestinatario({
        variables: { id: destinatario.id },
      })
    }
  }

  const openEditDialog = (destinatario: Destinatario) => {
    setSelectedDestinatario(destinatario)
    setFormData({ 
      nombre: destinatario.nombre,
      email: destinatario.email,
      telefono: destinatario.telefono || ''
    })
    setIsEditOpen(true)
  }

  const destinatarios: Destinatario[] = (data as any)?.destinatarios || []
  const filteredDestinatarios = destinatarios.filter(destinatario => {
    const matchesSearch = destinatario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      destinatario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (destinatario.telefono && destinatario.telefono.includes(searchTerm))
    return matchesSearch
  })

  // Paginación
  const totalPages = Math.ceil(filteredDestinatarios.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedDestinatarios = filteredDestinatarios.slice(startIndex, endIndex)

  // Reset página cuando cambia la búsqueda
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const stats = {
    total: destinatarios.length,
    active: destinatarios.length,
    inactive: 0,
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Cargando destinatarios...</p>
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
                <h3 className="font-semibold text-red-900">Error al cargar destinatarios</h3>
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
                <p className="text-sm text-gray-600 mb-1">Total de Destinatarios</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Activos</p>
                <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
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
                <p className="text-sm text-gray-600 mb-1">Inactivos</p>
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
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg className="absolute left-3 top-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <Button 
          onClick={() => setIsCreateOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Destinatario
        </Button>
      </div>

      {/* Destinatarios Grid */}
      {paginatedDestinatarios.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No se encontraron destinatarios' : 'No hay destinatarios creados'}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {searchTerm 
                  ? 'Intenta ajustar los filtros de búsqueda' 
                  : 'Crea tu primer destinatario para comenzar a enviar encuestas'
                }
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => setIsCreateOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Destinatario
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {paginatedDestinatarios.map((destinatario) => (
            <Card key={destinatario.id} className="group hover:shadow-lg transition-all duration-200 border-gray-200 flex flex-col h-full">
              <CardContent className="p-6 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 truncate">
                      {destinatario.nombre}
                    </h3>
                  </div>
                </div>

                {/* Información del destinatario */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-2 flex-1">
                  <div className="flex items-start gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 break-all">{destinatario.email}</span>
                  </div>
                  {destinatario.telefono && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-700">{destinatario.telefono}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-9"
                    onClick={() => openEditDialog(destinatario)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                    onClick={() => handleDelete(destinatario)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <span className="text-sm text-gray-700">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Dialog de Creación */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Destinatario</DialogTitle>
              <DialogDescription>
                Ingresa los datos del nuevo destinatario
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="nombre">Nombre completo *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Juan Pérez"
                  className="mt-2"
                  disabled={creating}
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ejemplo@correo.com"
                  className="mt-2"
                  disabled={creating}
                />
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono (opcional)</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="+591 12345678"
                  className="mt-2"
                  disabled={creating}
                />
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
                  'Crear Destinatario'
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
              <DialogTitle>Editar Destinatario</DialogTitle>
              <DialogDescription>
                Modifica los datos del destinatario
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-nombre">Nombre completo *</Label>
                <Input
                  id="edit-nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="mt-2"
                  disabled={updating}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-2"
                  disabled={updating}
                />
              </div>
              <div>
                <Label htmlFor="edit-telefono">Teléfono</Label>
                <Input
                  id="edit-telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="mt-2"
                  disabled={updating}
                />
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
    </div>
  )
}
