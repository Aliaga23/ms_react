import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ApolloProvider } from '@apollo/client/react'
import { apolloClient } from '@/lib/apollo-client'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import MainLayout from '@/layouts/MainLayout'
import DashboardLayout from '@/layouts/dashboard/DashboardLayout'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardHome from '@/pages/dashboard/DashboardHome'
import AdminDashboardHome from '@/pages/dashboard/AdminDashboardHome'
import EncuestasPage from '@/pages/dashboard/EncuestasPage'
import CampanasPage from '@/pages/dashboard/CampanasPage'
import DestinatariosPage from '@/pages/dashboard/DestinatariosPage'
import EntregasPage from '@/pages/dashboard/EntregasPage'
import SurveyResponsePage from '@/pages/survey/SurveyResponsePage'

// Componente para redireccionar según tipo de usuario
function DashboardRedirect() {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>
  }
  
  if (user?.es_admin) {
    return <AdminDashboardHome />
  }
  
  return <DashboardHome />
}

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/survey" element={<SurveyResponsePage />} />
            </Route>
            
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardRedirect />} />
              <Route path="encuestas" element={<EncuestasPage />} />
              <Route path="campanas" element={<CampanasPage />} />
              <Route path="destinatarios" element={<DestinatariosPage />} />
              <Route path="entregas" element={<EntregasPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ApolloProvider>
  )
}

export default App

