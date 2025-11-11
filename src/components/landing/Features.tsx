import { MessageSquare, FileText, Sparkles } from 'lucide-react'

const features = [
  {
    icon: MessageSquare,
    title: 'Encuestas Multicanal',
    description: 'Distribuye encuestas por correo, WhatsApp, web o apps móviles. Datos centralizados en tiempo real.',
    color: 'bg-blue-100',
    iconColor: 'text-blue-600',
    items: [
      'Integración WhatsApp Business',
      'Campañas de email automatizadas',
      'Apps móviles nativas'
    ]
  },
  {
    icon: FileText,
    title: 'Procesamiento de Documentos',
    description: 'Digitaliza, extrae y organiza información desde imágenes o PDF escaneados usando OCR avanzado.',
    color: 'bg-purple-100',
    iconColor: 'text-purple-600',
    items: [
      'OCR con 99.5% precisión',
      'Procesamiento por lotes',
      'Múltiples formatos'
    ]
  },
  {
    icon: Sparkles,
    title: 'Modelos de IA',
    description: 'Clasificación automática, análisis semántico y generación de reportes usando aprendizaje automático.',
    color: 'bg-green-100',
    iconColor: 'text-green-600',
    items: [
      'Análisis de sentimientos',
      'Clasificación automática',
      'Reportes inteligentes'
    ]
  }
]

export default function Features() {
  return (
    <section id="funcionalidades" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Funcionalidades Poderosas
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Todo lo que necesitas para automatizar la recolección y procesamiento de datos en una sola plataforma
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div 
                key={index} 
                className={`${feature.color} rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300`}
              >
                <div className={`inline-flex p-3 ${feature.iconColor} bg-white rounded-xl mb-6`}>
                  <Icon className="h-8 w-8" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                
                <ul className="space-y-3">
                  {feature.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-700">
                      <svg className="h-5 w-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
