import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { BarChart3 } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">SurveySaaS</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link to="#funcionalidades" className="text-gray-600 hover:text-gray-900 transition-colors">
              Funcionalidades
            </Link>
            <Link to="#beneficios" className="text-gray-600 hover:text-gray-900 transition-colors">
              Beneficios
            </Link>
            <Link to="#testimonios" className="text-gray-600 hover:text-gray-900 transition-colors">
              Testimonios
            </Link>
            <Link to="#precios" className="text-gray-600 hover:text-gray-900 transition-colors">
              Precios
            </Link>
            <Link to="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
              Iniciar sesión
            </Link>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Registrarse
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
