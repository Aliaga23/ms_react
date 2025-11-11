export interface Usuario {
  id: string
  nombre: string
  email: string
  telefono: string
  es_admin: boolean
  estado: boolean
  creado_en: string
}

export interface LoginResponse {
  token: string
  usuario: Usuario
}

export interface LoginInput {
  email: string
  password: string
}

export interface CreateUsuarioInput {
  nombre: string
  email: string
  password: string
  telefono?: string
}

export interface Encuesta {
  id: string
  nombre: string
  descripcion?: string
  activo: boolean
  campanaId?: string
  canalId?: string
  user_id: string
  creado_en: string
}

export interface Campana {
  id: string
  nombre: string
  descripcion?: string
  fechaInicio?: string
  fechaFin?: string
  activo?: boolean
  user_id?: string
  creado_en?: string
}

export interface Plan {
  id: string
  nombre: string
  descripcion: string
  precio: number
  activo: boolean
  creado_en: string
}

export interface Suscripcion {
  id: string
  plan_id: string
  usuario_id: string
  estado: string
  fecha_inicio: string
  fecha_fin?: string
  creado_en: string
}

export interface TipoPregunta {
  id: string
  nombre: string
}

export interface Canal {
  id: string
  nombre: string
}

export interface OpcionPregunta {
  id: string
  texto: string
  valor?: string
}

export interface PreguntaConOpciones {
  id: string
  orden: number
  texto: string
  obligatorio: boolean
  tipo: TipoPregunta
  opciones?: OpcionPregunta[]
}

export interface EncuestaInfo {
  id: string
  nombre: string
  descripcion?: string
}

export interface EntregaPreguntasResponse {
  entregaId: string
  encuesta: EncuestaInfo
  preguntas: PreguntaConOpciones[]
}

export interface RespuestaItem {
  preguntaId: string
  opcionId?: string
  texto?: string
  imagen?: string
}

export interface Pregunta {
  id: string
  orden: number
  texto: string
  obligatorio: boolean
  encuestaId: string
  tipo_preguntaId: string
  creado_en: string
  actualizado_en?: string
}

export interface OpcionEncuesta {
  id: string
  texto: string
  valor?: string
  preguntaId: string
  creado_en: string
  actualizado_en?: string
}

export interface CreatePreguntaInput {
  orden: number
  texto: string
  obligatorio: boolean
  encuestaId: string
  tipo_preguntaId: string
}

export interface UpdatePreguntaInput {
  orden?: number
  texto?: string
  obligatorio?: boolean
}

export interface CreateOpcionEncuestaInput {
  texto: string
  valor?: string
  preguntaId: string
}

export interface UpdateOpcionEncuestaInput {
  texto?: string
  valor?: string
}

export interface Destinatario {
  id: string
  nombre: string
  email: string
  telefono?: string
  user_id?: string
}

export interface CreateDestinatarioInput {
  nombre: string
  email: string
  telefono?: string
}

export interface UpdateDestinatarioInput {
  nombre?: string
  email?: string
  telefono?: string
}

export interface Entrega {
  id: string
  destinatarioId: string
  encuestaId: string
  enviado_en: string
  respondido_en?: string
}

export interface CreateEntregaInput {
  destinatarioId: string
  encuestaId: string
  enviado_en: string
}

export interface UpdateEntregaInput {
  destinatarioId?: string
  encuestaId?: string
  enviado_en?: string
  respondido_en?: string
}
