import { Card, CardContent } from '@/components/ui/card'
import { Users, FileText, Send, BarChart3, TrendingUp, Activity } from 'lucide-react'
import { useQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { useAuth } from '@/contexts/AuthContext'

const GET_ADMIN_STATS = gql`
  query GetAdminStats {
    totalUsuarios
    totalEncuestas
    totalCampanas
    totalEntregas
  }
`

interface AdminStats {
  totalUsuarios: number
  totalEncuestas: number
  totalCampanas: number
  totalEntregas: number
}

export default function AdminDashboardHome() {
  const { user } = useAuth()
  const { data, loading } = useQuery<AdminStats>(GET_ADMIN_STATS)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Panel de Administración
        </h1>
        <p className="text-slate-600 mt-2">
          Bienvenido de vuelta, {user?.nombre}
        </p>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Usuarios</p>
                <p className="text-3xl font-bold mt-2">
                  {loading ? '...' : data?.totalUsuarios || 0}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Users className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Encuestas</p>
                <p className="text-3xl font-bold mt-2">
                  {loading ? '...' : data?.totalEncuestas || 0}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <FileText className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Campañas</p>
                <p className="text-3xl font-bold mt-2">
                  {loading ? '...' : data?.totalCampanas || 0}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Send className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Total Entregas</p>
                <p className="text-3xl font-bold mt-2">
                  {loading ? '...' : data?.totalEntregas || 0}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Activity className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secciones Principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gestión de Usuarios */}
        <Card>
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Gestión de Usuarios
            </h3>
          </div>
          <CardContent className="p-6">
            <p className="text-slate-600 mb-4">
              Administra todos los usuarios de la plataforma
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-slate-700">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                Ver lista completa de usuarios
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-700">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                Activar/desactivar cuentas
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-700">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                Gestionar permisos y roles
              </li>
            </ul>
            <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Ir a Usuarios
            </button>
          </CardContent>
        </Card>

        {/* Analíticas Globales */}
        <Card>
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Analíticas Globales
            </h3>
          </div>
          <CardContent className="p-6">
            <p className="text-slate-600 mb-4">
              Visualiza métricas y reportes del sistema
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-slate-700">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                Uso de la plataforma por usuario
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-700">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                Tasas de respuesta globales
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-700">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                Reportes de actividad
              </li>
            </ul>
            <button className="mt-4 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Ver Analíticas
            </button>
          </CardContent>
        </Card>

        {/* Gestión de Contenido */}
        <Card>
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Gestión de Contenido
            </h3>
          </div>
          <CardContent className="p-6">
            <p className="text-slate-600 mb-4">
              Supervisa todas las encuestas y campañas
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-slate-700">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                Ver todas las encuestas
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-700">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                Revisar campañas activas
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-700">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                Moderar contenido
              </li>
            </ul>
            <button className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Ver Contenido
            </button>
          </CardContent>
        </Card>

        {/* Actividad Reciente */}
        <Card>
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              Actividad Reciente
            </h3>
          </div>
          <CardContent className="p-6">
            <p className="text-slate-600 mb-4">
              Monitorea la actividad de la plataforma
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-slate-700">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                Nuevos registros de usuarios
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-700">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                Encuestas creadas recientemente
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-700">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                Últimas entregas realizadas
              </li>
            </ul>
            <button className="mt-4 w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
              Ver Actividad
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Nota de Administrador */}
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-white/10 p-3 rounded-lg">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2">Panel de Administración</h4>
              <p className="text-slate-300 text-sm">
                Como administrador, tienes acceso completo a todas las funciones de la plataforma. 
                Puedes gestionar usuarios, supervisar contenido, y acceder a analíticas avanzadas del sistema.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
