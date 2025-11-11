import { useState, useRef, useEffect } from 'react'
import { useMutation } from '@apollo/client/react'
import { SEND_CHATBOT_MESSAGE_MUTATION } from '@/graphql/mutations'
import { Button } from '@/components/ui/button'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  action?: string
  result?: any
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: '¡Hola! Soy tu asistente virtual. Puedo ayudarte a crear campañas, encuestas y preguntas. ¿En qué puedo ayudarte hoy?'
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [sendMessage, { loading }] = useMutation(SEND_CHATBOT_MESSAGE_MUTATION, {
    onCompleted: (data: any) => {
      const result = data.sendChatbotMessage
      
      // Guardar sessionId si es la primera interacción
      if (result.sessionId && !sessionId) {
        setSessionId(result.sessionId)
      }

      // Agregar respuesta del chatbot
      const botMessage: ChatMessage = {
        role: 'assistant',
        content: result.response,
        action: result.action,
        result: result.result
      }
      
      setMessages(prev => [...prev, botMessage])

      // Si hay una acción ejecutada, mostrar mensaje adicional
      if (result.action && result.message) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: result.message
          }])
        }, 500)
      }
    },
    onError: (error) => {
      console.error('Error al enviar mensaje:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, inténtalo de nuevo.'
      }])
    }
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return

    // Agregar mensaje del usuario
    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage
    }
    setMessages(prev => [...prev, userMessage])
    
    const currentMessage = inputMessage
    setInputMessage('')

    // Enviar mensaje al backend
    await sendMessage({
      variables: {
        input: {
          message: currentMessage,
          sessionId: sessionId || undefined
        }
      }
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleDeleteSession = async () => {
    if (sessionId) {
      // Aquí podrías llamar a la mutación deleteChatbotSession si la necesitas
      setSessionId(null)
      setMessages([{
        role: 'assistant',
        content: '¡Hola! Soy tu asistente virtual. Puedo ayudarte a crear campañas, encuestas y preguntas. ¿En qué puedo ayudarte hoy?'
      }])
    }
  }

  return (
    <>
      {/* Botón flotante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
        </button>
      )}

      {/* Ventana del chatbot */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Asistente Virtual</h3>
                <p className="text-xs text-blue-100">
                  {sessionId ? 'Conversación activa' : 'Nueva conversación'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {sessionId && (
                <button
                  onClick={handleDeleteSession}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Nueva conversación"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-200 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Mostrar acción ejecutada */}
                  {message.action && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs font-semibold text-green-600">
                        ✓ Acción ejecutada: {message.action}
                      </p>
                      {message.result && (
                        <div className="mt-1 text-xs text-gray-600">
                          {message.result.campana && (
                            <p>• Campaña: {message.result.campana.nombre}</p>
                          )}
                          {message.result.encuesta && (
                            <p>• Encuesta: {message.result.encuesta.nombre}</p>
                          )}
                          {message.result.preguntas && (
                            <p>• {message.result.preguntas.length} pregunta(s) creadas</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 shadow-sm border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm text-gray-600">Escribiendo...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || loading}
                className="bg-blue-600 hover:bg-blue-700 px-4 rounded-xl"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Puedo ayudarte a crear campañas, encuestas y preguntas
            </p>
          </div>
        </div>
      )}
    </>
  )
}
