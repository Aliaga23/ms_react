import { gql } from '@apollo/client'

export const GET_PERFIL_QUERY = gql`
  query GetPerfil {
    perfil {
      id
      nombre
      email
      telefono
      es_admin
      estado
    }
  }
`

export const GET_USUARIOS_QUERY = gql`
  query GetUsuarios($page: Float, $limit: Float) {
    usuarios(page: $page, limit: $limit) {
      id
      nombre
      email
      telefono
      es_admin
      estado
    }
  }
`

export const GET_ENCUESTAS_QUERY = gql`
  query GetEncuestas {
    encuestas {
      id
      nombre
      descripcion
      activo
      campanaId
      canalId
      creado_en
    }
  }
`

export const GET_USUARIO_ENCUESTAS_QUERY = gql`
  query GetUsuarioEncuestas($userId: String!) {
    usuarioEncuestas(userId: $userId) {
      encuesta_id
      nombre
      descripcion
      activo
      campana
      canal
      total_preguntas
    }
  }
`

export const GET_ANALYTICS_USUARIOS_QUERY = gql`
  query GetAnalyticsUsuarios {
    analyticsUsuarios {
      total_usuarios
      usuarios {
        usuario_id
        nombre
        email
        total_encuestas
        total_respuestas
      }
    }
  }
`

export const GET_PLANES_QUERY = gql`
  query GetPlanes($page: Float, $limit: Float, $showInactive: Boolean) {
    planes(page: $page, limit: $limit, showInactive: $showInactive) {
      id
      nombre
      descripcion
      precio
      activo
    }
  }
`

export const GET_MIS_SUSCRIPCIONES_QUERY = gql`
  query GetMisSuscripciones($page: Float, $limit: Float) {
    misSuscripciones(page: $page, limit: $limit) {
      id
      plan_id
      usuario_id
      estado
      fecha_inicio
      fecha_fin
    }
  }
`

// Campañas
export const GET_CAMPANAS_QUERY = gql`
  query GetCampanas {
    campanas {
      id
      nombre
    }
  }
`

export const GET_CAMPANA_QUERY = gql`
  query GetCampana($id: String!) {
    campana(id: $id) {
      id
      nombre
    }
  }
`

// Tipos de Pregunta
export const GET_TIPOS_PREGUNTA_QUERY = gql`
  query GetTiposPreguntas {
    tiposPreguntas {
      id
      nombre
    }
  }
`

// Canales
export const GET_CANALES_QUERY = gql`
  query GetCanales {
    canales {
      id
      nombre
    }
  }
`

// Preguntas
export const GET_PREGUNTAS_QUERY = gql`
  query GetPreguntas {
    preguntas {
      id
      orden
      texto
      obligatorio
      encuestaId
      tipo_preguntaId
    }
  }
`

export const GET_PREGUNTAS_BY_ENCUESTA_QUERY = gql`
  query GetPreguntasByEncuesta($encuestaId: String!) {
    preguntasByEncuesta(encuestaId: $encuestaId) {
      id
      orden
      texto
      obligatorio
      encuestaId
      tipo_preguntaId
    }
  }
`

export const GET_PREGUNTA_QUERY = gql`
  query GetPregunta($id: String!) {
    pregunta(id: $id) {
      id
      orden
      texto
      obligatorio
      encuestaId
      tipo_preguntaId
    }
  }
`

// Opciones de Encuesta
export const GET_OPCIONES_ENCUESTA_QUERY = gql`
  query GetOpcionesEncuesta {
    opcionesEncuesta {
      id
      texto
      valor
      preguntaId
    }
  }
`

export const GET_OPCION_ENCUESTA_QUERY = gql`
  query GetOpcionEncuesta($id: String!) {
    opcionEncuesta(id: $id) {
      id
      texto
      valor
      preguntaId
    }
  }
`

export const GET_OPCIONES_BY_PREGUNTA_QUERY = gql`
  query GetOpcionesByPregunta($preguntaId: String!) {
    opcionesByPregunta(preguntaId: $preguntaId) {
      id
      texto
      valor
      preguntaId
    }
  }
`

// Destinatarios
export const GET_DESTINATARIOS_QUERY = gql`
  query GetDestinatarios {
    destinatarios {
      id
      nombre
      email
      telefono
    }
  }
`

export const GET_DESTINATARIO_QUERY = gql`
  query GetDestinatario($id: String!) {
    destinatario(id: $id) {
      id
      nombre
      email
      telefono
    }
  }
`

// Entregas
export const GET_ENTREGAS_QUERY = gql`
  query GetEntregas {
    entregas {
      id
      destinatarioId
      encuestaId
      enviado_en
      respondido_en
    }
  }
`

export const GET_ENTREGA_QUERY = gql`
  query GetEntrega($id: String!) {
    entrega(id: $id) {
      id
      destinatarioId
      encuestaId
      enviado_en
      respondido_en
    }
  }
`

export const GET_ENTREGA_PREGUNTAS_QUERY = gql`
  query EntregaPreguntas($entregaId: String!) {
    entregaPreguntas(entregaId: $entregaId) {
      entregaId
      encuesta {
        id
        nombre
        descripcion
      }
      preguntas {
        id
        orden
        texto
        obligatorio
        tipo {
          id
          nombre
        }
        opciones {
          id
          texto
          valor
        }
      }
    }
  }
`

export const GET_RESPUESTAS_COMPLETAR_QUERY = gql`
  query RespuestasCompletar($userId: String, $encuestaId: String) {
    respuestasCompletar(userId: $userId, encuestaId: $encuestaId)
  }
`

export const GET_RESPUESTAS_BY_USUARIO_ENCUESTA_QUERY = gql`
  query RespuestasByUsuarioEncuesta($userId: String!, $encuestaId: String!) {
    respuestasByUsuarioEncuesta(userId: $userId, encuestaId: $encuestaId)
  }
`

export const GET_RESPUESTAS_COMPLETAR_BY_CAMPANA_QUERY = gql`
  query RespuestasCompletarByCampana($campanaId: String!) {
    respuestasCompletarByCampana(campanaId: $campanaId)
  }
`

export const GET_RESPUESTAS_OPCIONES_BY_CAMPANA_QUERY = gql`
  query RespuestasOpcionesByCampana($campanaId: String!) {
    respuestasOpcionesByCampana(campanaId: $campanaId)
  }
`
