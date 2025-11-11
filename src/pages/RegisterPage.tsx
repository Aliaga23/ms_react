import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Link, useNavigate } from 'react-router-dom'
import { BarChart3, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useMutation } from '@apollo/client/react'
import { REGISTER_MUTATION, LOGIN_MUTATION } from '@/graphql/mutations'
import { useAuth } from '@/contexts/AuthContext'
import type { CreateUsuarioInput, LoginResponse } from '@/types'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState<CreateUsuarioInput>({
    nombre: '',
    email: '',
    password: '',
    telefono: '',
  })
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<boolean>(false)

  const [loginMutation] = useMutation<{ login: LoginResponse }>(LOGIN_MUTATION)

  const [registerMutation, { loading }] = useMutation(REGISTER_MUTATION, {
    onCompleted: async () => {
      setSuccess(true)
      // Esperar 1 segundo y hacer login automático
      setTimeout(async () => {
        try {
          const { data } = await loginMutation({
            variables: {
              loginInput: {
                email: formData.email,
                password: formData.password,
              },
            },
          })
          if (data) {
            login(data.login.token, data.login.usuario)
            navigate('/dashboard')
          }
        } catch (err: any) {
          console.error('Error al hacer login automático:', err)
          navigate('/login')
        }
      }, 1000)
    },
    onError: (err: any) => {
      console.error('Error de registro:', err)
      setError(err.message || 'Error al registrarse. Por favor intenta de nuevo.')
    },
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!formData.nombre || !formData.email || !formData.password) {
      setError('Por favor completa todos los campos obligatorios')
      return
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    try {
      await registerMutation({
        variables: {
          createUsuarioInput: formData,
        },
      })
    } catch (err) {
      // Error already handled in onError
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">SurveySaaS</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Crear cuenta</h1>
          <p className="text-gray-600">Comienza gratis, sin tarjeta de crédito</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 border">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">¡Cuenta creada exitosamente! Redirigiendo...</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre completo *
              </label>
              <input
                id="nombre"
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                placeholder="Juan Pérez"
                disabled={loading || success}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                placeholder="tu@email.com"
                disabled={loading || success}
              />
            </div>

            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono (opcional)
              </label>
              <input
                id="telefono"
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                placeholder="+591 12345678"
                disabled={loading || success}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña *
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                placeholder="Mínimo 6 caracteres"
                disabled={loading || success}
              />
            </div>
            
            <Button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg"
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creando cuenta...
                </>
              ) : success ? (
                'Redirigiendo...'
              ) : (
                'Crear cuenta'
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Al registrarte, aceptas nuestros Términos de Servicio y Política de Privacidad
            </p>
          </form>
          
          <p className="text-center text-gray-600 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
