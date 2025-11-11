import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation } from '@apollo/client/react'
import { GET_ENTREGA_PREGUNTAS_QUERY } from '@/graphql/queries'
import { GUARDAR_RESPUESTAS_MUTATION } from '@/graphql/mutations'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { EntregaPreguntasResponse, RespuestaItem } from '@/types'

export default function SurveyResponsePage() {
  const [searchParams] = useSearchParams()
  const entregaId = searchParams.get('id')
  
  const [respuestas, setRespuestas] = useState<Record<string, RespuestaItem | RespuestaItem[]>>({})
  const [submitted, setSubmitted] = useState(false)

  const { data, loading, error } = useQuery(GET_ENTREGA_PREGUNTAS_QUERY, {
    variables: { entregaId },
    skip: !entregaId,
  })

  const [guardarRespuestas, { loading: saving }] = useMutation(GUARDAR_RESPUESTAS_MUTATION, {
    onCompleted: () => {
      setSubmitted(true)
    },
    onError: (error: any) => {
      console.error('Error al guardar respuestas:', error)
      alert('Error al guardar las respuestas: ' + error.message)
    },
  })

  const encuesta: EntregaPreguntasResponse | null = (data as any)?.entregaPreguntas

  const handleRespuesta = (preguntaId: string, valor: string, esTexto: boolean) => {
    setRespuestas({
      ...respuestas,
      [preguntaId]: {
        preguntaId,
        ...(esTexto ? { texto: valor } : { opcionId: valor })
      }
    })
  }

  const handleMultipleRespuesta = (preguntaId: string, opcionId: string, checked: boolean) => {
    const currentRespuestas = respuestas[preguntaId]
    let newOpciones: RespuestaItem[]

    if (Array.isArray(currentRespuestas)) {
      if (checked) {
        newOpciones = [...currentRespuestas, { preguntaId, opcionId }]
      } else {
        newOpciones = currentRespuestas.filter(r => r.opcionId !== opcionId)
      }
    } else {
      newOpciones = checked ? [{ preguntaId, opcionId }] : []
    }

    if (newOpciones.length > 0) {
      setRespuestas({
        ...respuestas,
        [preguntaId]: newOpciones
      })
    } else {
      const newRespuestas = { ...respuestas }
      delete newRespuestas[preguntaId]
      setRespuestas(newRespuestas)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!encuesta || !entregaId) return

    // Validar preguntas obligatorias
    const preguntasObligatorias = encuesta.preguntas.filter(p => p.obligatorio)
    const faltantes = preguntasObligatorias.filter(p => !respuestas[p.id])
    
    if (faltantes.length > 0) {
      alert(`Por favor responde todas las preguntas obligatorias (${faltantes.length} faltantes)`)
      return
    }

    // Convertir respuestas a array plano
    const respuestasArray = Object.values(respuestas).flatMap(r => 
      Array.isArray(r) ? r : [r]
    )

    await guardarRespuestas({
      variables: {
        input: {
          entregaId,
          respuestas: respuestasArray
        }
      }
    })
  }

  if (!entregaId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-lg border-0">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Link inválido</h3>
                <p className="text-sm text-red-800 mt-1">
                  No se encontró el ID de entrega en el link.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-gray-600">Cargando formulario...</p>
        </div>
      </div>
    )
  }

  if (error || !encuesta) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-lg border-0">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Error al cargar encuesta</h3>
                <p className="text-sm text-red-800 mt-1">
                  {error?.message || 'No se pudo cargar la encuesta. Verifica que el link sea correcto.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-lg border-0">
          <CardContent className="pt-12 pb-8 px-8">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Tu respuesta se registró
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Gracias por completar este formulario
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Formulario completo en un solo card */}
        <form onSubmit={handleSubmit}>
          <Card className="shadow-lg border-t-8 border-t-blue-600">
            {/* Header dentro del card */}
            <CardContent className="p-0">
              {/* Logo y título */}
              <div className="p-8 pb-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <span className="text-xl font-semibold text-blue-600">SurveySaaS</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {encuesta.encuesta.nombre}
                </h1>
                {encuesta.encuesta.descripcion && (
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {encuesta.encuesta.descripcion}
                  </p>
                )}
                <p className="text-sm text-red-600 font-medium">
                  * Indica una pregunta obligatoria
                </p>
              </div>

              <div className="h-px bg-gray-200"></div>

              {/* Preguntas */}
              <div className="p-8 pt-6">
                <div className="space-y-8">
                  {[...encuesta.preguntas]
                    .sort((a, b) => a.orden - b.orden)
                    .map((pregunta, index) => (
                      <div key={pregunta.id} className="pb-8 border-b border-gray-200 last:border-b-0 last:pb-0">
                        <div className="mb-6">
                          <Label className="text-base font-normal text-gray-900 leading-relaxed">
                            <span className="text-gray-500 mr-2">{index + 1}.</span>
                            {pregunta.texto}
                            {pregunta.obligatorio && (
                              <span className="text-red-600 ml-1">*</span>
                            )}
                          </Label>
                        </div>

                        {/* Opción Única (Radio) */}
                        {pregunta.tipo.nombre === 'Opción Única' && pregunta.opciones && pregunta.opciones.length > 0 && (
                          <div className="space-y-3 ml-6">
                            {pregunta.opciones.map((opcion) => {
                              const respuestaPregunta = respuestas[pregunta.id]
                              const isChecked = !Array.isArray(respuestaPregunta) && (respuestaPregunta as RespuestaItem)?.opcionId === opcion.id
                              
                              return (
                                <label
                                  key={opcion.id}
                                  className="flex items-center gap-3 group cursor-pointer"
                                >
                                  <input
                                    type="radio"
                                    name={pregunta.id}
                                    value={opcion.id}
                                    checked={isChecked}
                                    onChange={(e) => handleRespuesta(pregunta.id, e.target.value, false)}
                                    className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                    required={pregunta.obligatorio}
                                  />
                                  <span className="text-gray-800 group-hover:text-gray-900">{opcion.texto}</span>
                                </label>
                              )
                            })}
                          </div>
                        )}

                        {/* Opción Múltiple (Checkboxes) */}
                        {pregunta.tipo.nombre === 'Opción Múltiple' && pregunta.opciones && pregunta.opciones.length > 0 && (
                          <div className="space-y-3 ml-6">
                            {pregunta.opciones.map((opcion) => {
                              const respuestaPregunta = respuestas[pregunta.id]
                              const isChecked = Array.isArray(respuestaPregunta) 
                                ? respuestaPregunta.some(r => r.opcionId === opcion.id)
                                : false
                              
                              return (
                                <label
                                  key={opcion.id}
                                  className="flex items-center gap-3 group cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    value={opcion.id}
                                    checked={isChecked}
                                    onChange={(e) => handleMultipleRespuesta(pregunta.id, opcion.id, e.target.checked)}
                                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                  />
                                  <span className="text-gray-800 group-hover:text-gray-900">{opcion.texto}</span>
                                </label>
                              )
                            })}
                          </div>
                        )}

                        {/* Completar (Text Input) */}
                        {pregunta.tipo.nombre === 'Completar' && (
                          <div className="ml-6">
                            <Input
                              type="text"
                              placeholder="Tu respuesta"
                              value={!Array.isArray(respuestas[pregunta.id]) ? (respuestas[pregunta.id] as RespuestaItem)?.texto || '' : ''}
                              onChange={(e) => handleRespuesta(pregunta.id, e.target.value, true)}
                              className="w-full max-w-md border-0 border-b-2 border-gray-300 rounded-none px-0 focus:border-blue-600 focus:ring-0 text-gray-900 placeholder:text-gray-400"
                              required={pregunta.obligatorio}
                            />
                          </div>
                        )}

                        {/* Sin opciones - input de texto por defecto */}
                        {(!pregunta.opciones || pregunta.opciones.length === 0) && 
                         pregunta.tipo.nombre !== 'Completar' && (
                          <div className="ml-6">
                            <Input
                              type="text"
                              placeholder="Tu respuesta"
                              value={!Array.isArray(respuestas[pregunta.id]) ? (respuestas[pregunta.id] as RespuestaItem)?.texto || '' : ''}
                              onChange={(e) => handleRespuesta(pregunta.id, e.target.value, true)}
                              className="w-full max-w-md border-0 border-b-2 border-gray-300 rounded-none px-0 focus:border-blue-600 focus:ring-0 text-gray-900 placeholder:text-gray-400"
                              required={pregunta.obligatorio}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              <div className="h-px bg-gray-200"></div>

              {/* Footer con botones dentro del card */}
              <div className="p-8 pt-6 flex items-center justify-between">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 h-auto text-base font-medium shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar'
                  )}
                </Button>
                <button
                  type="button"
                  onClick={() => setRespuestas({})}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Borrar formulario
                </button>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Footer externo */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-xs text-gray-500">
            Nunca envíes contraseñas a través de Formularios
          </p>
          <p className="text-xs text-gray-400">
            Desarrollado con <span className="text-blue-600 font-semibold">SurveySaaS</span>
          </p>
        </div>
      </div>
    </div>
  )
}
