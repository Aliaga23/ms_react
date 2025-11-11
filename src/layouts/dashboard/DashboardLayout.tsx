import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { 
  BarChart3, 
  LayoutDashboard, 
  FileText, 
  LogOut,
  Menu,
  X,
  Mail,
  Calendar,
  Send
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Chatbot from '@/components/chatbot/Chatbot'

const navigationRegular = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, title: 'Dashboard', description: 'Vista general de tu cuenta' },
  { name: 'Encuestas', href: '/dashboard/encuestas', icon: FileText, title: 'Gestión de Encuestas', description: 'Crea y administra tus encuestas' },
  { name: 'Campañas', href: '/dashboard/campanas', icon: Calendar, title: 'Gestión de Campañas', description: 'Crea y administra tus campañas de encuestas de manera eficiente' },
  { name: 'Destinatarios', href: '/dashboard/destinatarios', icon: Mail, title: 'Gestión de Destinatarios', description: 'Administra tu base de contactos' },
  { name: 'Entregas', href: '/dashboard/entregas', icon: Send, title: 'Gestión de Entregas', description: 'Administra el envío de encuestas' },
]

const navigationAdmin = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, title: 'Panel de Administración', description: 'Gestiona todos los aspectos de la plataforma' },
]

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  
  // Usar navegación según tipo de usuario
  const navigation = user?.es_admin ? navigationAdmin : navigationRegular

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Obtener título y descripción según la ruta actual
  const getCurrentPageInfo = () => {
    if (location.pathname === '/dashboard' && user?.es_admin) {
      return {
        title: 'Panel de Administración',
        description: 'Gestiona todos los aspectos de la plataforma'
      }
    }
    const navItem = navigation.find(item => item.href === location.pathname)
    return navItem ? { title: navItem.title, description: navItem.description } : null
  }

  const pageInfo = getCurrentPageInfo()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar para móvil */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-72 bg-gray-900 shadow-xl">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">SurveySaaS</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
            <div className="p-4 border-t border-gray-800">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-gray-800"
              >
                <LogOut className="h-5 w-5" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar para desktop */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 ${sidebarExpanded ? 'lg:w-64' : 'lg:w-16'}`}>
        <div className="flex flex-col flex-1 min-h-0 bg-gray-900 border-r border-gray-800">
          <div className="flex items-center justify-between h-16 px-3 border-b border-gray-800">
            {sidebarExpanded ? (
              <>
                <Link to="/dashboard" className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-semibold text-white">SurveySaaS</span>
                </Link>
                <button
                  onClick={() => setSidebarExpanded(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setSidebarExpanded(true)}
                className="w-full flex items-center justify-center"
              >
                <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
              </button>
            )}
          </div>
          <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                  } ${sidebarExpanded ? 'justify-start px-4' : 'justify-center'}`}
                  title={!sidebarExpanded ? item.name : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarExpanded && <span className="text-base font-medium">{item.name}</span>}
                </Link>
              )
            })}
          </nav>
          <div className="p-2 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 w-full p-3 rounded-lg text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors ${
                sidebarExpanded ? 'justify-start px-4' : 'justify-center'
              }`}
              title={!sidebarExpanded ? 'Cerrar sesión' : undefined}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {sidebarExpanded && <span className="text-base font-medium">Cerrar sesión</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Header móvil */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b">
        <div className="flex items-center justify-between h-16 px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-bold text-gray-900">SurveySaaS</span>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-600 text-white text-sm">
                    {user?.nombre?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-medium">{user?.nombre}</span>
                  <span className="text-xs text-gray-500 font-normal">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Contenido principal */}
      <div className={`transition-all duration-300 ${sidebarExpanded ? 'lg:pl-64' : 'lg:pl-16'}`}>
        {/* Header desktop */}
        <header className="hidden lg:block sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-8">
            <div className="flex items-center h-full">
              {pageInfo && (
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                    {pageInfo.title}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {pageInfo.description}
                  </p>
                </div>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2.5 h-9 px-2.5 rounded-lg hover:bg-gray-50">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-600 text-white text-sm font-semibold">
                      {user?.nombre?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-semibold text-gray-900">{user?.nombre}</span>
                    <span className="text-xs text-gray-500 font-normal">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-sm">
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-sm">
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span className="text-sm font-medium">Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="pt-16 lg:pt-0">
          <Outlet />
        </main>
        
        {/* Chatbot flotante */}
        <Chatbot />
      </div>
    </div>
  )
}
