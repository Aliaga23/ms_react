import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'

export default function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Automatización Inteligente
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Transforma tus{' '}
              <span className="text-blue-600">datos</span> en decisiones{' '}
              <span className="text-purple-600">inteligentes</span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              Unifica la recolección multicanal de datos y el procesamiento de documentos con IA
              y OCR, optimizando decisiones estratégicas para tu organización.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8">
                Comenzar gratis ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8">
                Ver funcionalidades
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm">Sin configuración compleja</span>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm">Soporte 24/7</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Dashboard en Tiempo Real</h3>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="h-4 bg-blue-200 rounded-full w-full animate-pulse"></div>
                  <div className="h-4 bg-purple-200 rounded-full w-5/6 animate-pulse delay-75"></div>
                  <div className="h-4 bg-green-200 rounded-full w-2/3 animate-pulse delay-150"></div>
                </div>
                
                <div className="grid grid-cols-2 gap-6 pt-8">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-600">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">+127%</div>
                    <div className="text-sm text-gray-600">Eficiencia</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-purple-600">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">50K+</div>
                    <div className="text-sm text-gray-600">Respuestas</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
