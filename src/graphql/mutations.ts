import { gql } from '@apollo/client'

export const LOGIN_MUTATION = gql`
  mutation Login($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      token
      usuario {
        id
        nombre
        email
        telefono
        es_admin
      }
    }
  }
`

export const REGISTER_MUTATION = gql`
  mutation Register($createUsuarioInput: CreateUsuarioInput!) {
    register(createUsuarioInput: $createUsuarioInput) {
      id
      nombre
      email
      telefono
      es_admin
      estado
    }
  }
`

export const CREATE_ENCUESTA_MUTATION = gql`
  mutation CreateEncuesta($createEncuestaInput: CreateEncuestaInput!) {
    createEncuesta(createEncuestaInput: $createEncuestaInput) {
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

export const UPDATE_ENCUESTA_MUTATION = gql`
  mutation UpdateEncuesta($id: String!, $updateEncuestaInput: UpdateEncuestaInput!) {
    updateEncuesta(id: $id, updateEncuestaInput: $updateEncuestaInput) {
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

export const DELETE_ENCUESTA_MUTATION = gql`
  mutation RemoveEncuesta($id: String!) {
    removeEncuesta(id: $id)
  }
`

// Campañas
export const CREATE_CAMPANA_MUTATION = gql`
  mutation CreateCampana($createCampanaInput: CreateCampanaInput!) {
    createCampana(createCampanaInput: $createCampanaInput) {
      id
      nombre
    }
  }
`

export const UPDATE_CAMPANA_MUTATION = gql`
  mutation UpdateCampana($id: String!, $updateCampanaInput: UpdateCampanaInput!) {
    updateCampana(id: $id, updateCampanaInput: $updateCampanaInput) {
      id
      nombre
    }
  }
`

export const DELETE_CAMPANA_MUTATION = gql`
  mutation RemoveCampana($id: String!) {
    removeCampana(id: $id)
  }
`

// Preguntas
export const CREATE_PREGUNTA_MUTATION = gql`
  mutation CreatePregunta($createPreguntaInput: CreatePreguntaInput!) {
    createPregunta(createPreguntaInput: $createPreguntaInput) {
      id
      orden
      texto
      obligatorio
      encuestaId
      tipo_preguntaId
    }
  }
`

export const UPDATE_PREGUNTA_MUTATION = gql`
  mutation UpdatePregunta($id: String!, $updatePreguntaInput: UpdatePreguntaInput!) {
    updatePregunta(id: $id, updatePreguntaInput: $updatePreguntaInput) {
      id
      orden
      texto
      obligatorio
    }
  }
`

export const DELETE_PREGUNTA_MUTATION = gql`
  mutation RemovePregunta($id: String!) {
    removePregunta(id: $id)
  }
`

// Opciones de Encuesta
export const CREATE_OPCION_MUTATION = gql`
  mutation CreateOpcionEncuesta($createOpcionEncuestaInput: CreateOpcionEncuestaInput!) {
    createOpcionEncuesta(createOpcionEncuestaInput: $createOpcionEncuestaInput) {
      id
      texto
      valor
      preguntaId
    }
  }
`

export const UPDATE_OPCION_MUTATION = gql`
  mutation UpdateOpcionEncuesta($id: String!, $updateOpcionEncuestaInput: UpdateOpcionEncuestaInput!) {
    updateOpcionEncuesta(id: $id, updateOpcionEncuestaInput: $updateOpcionEncuestaInput) {
      id
      texto
      valor
    }
  }
`

export const DELETE_OPCION_MUTATION = gql`
  mutation RemoveOpcionEncuesta($id: String!) {
    removeOpcionEncuesta(id: $id)
  }
`

// Destinatarios
export const CREATE_DESTINATARIO_MUTATION = gql`
  mutation CreateDestinatario($createDestinatarioInput: CreateDestinatarioInput!) {
    createDestinatario(createDestinatarioInput: $createDestinatarioInput) {
      id
      nombre
      email
      telefono
    }
  }
`

export const UPDATE_DESTINATARIO_MUTATION = gql`
  mutation UpdateDestinatario($id: String!, $updateDestinatarioInput: UpdateDestinatarioInput!) {
    updateDestinatario(id: $id, updateDestinatarioInput: $updateDestinatarioInput) {
      id
      nombre
      email
      telefono
    }
  }
`

export const DELETE_DESTINATARIO_MUTATION = gql`
  mutation RemoveDestinatario($id: String!) {
    removeDestinatario(id: $id)
  }
`

// Entregas
export const CREATE_ENTREGA_MUTATION = gql`
  mutation CreateEntrega($createEntregaInput: CreateEntregaInput!) {
    createEntrega(createEntregaInput: $createEntregaInput) {
      id
      destinatarioId
      encuestaId
      enviado_en
    }
  }
`

export const UPDATE_ENTREGA_MUTATION = gql`
  mutation UpdateEntrega($id: String!, $updateEntregaInput: UpdateEntregaInput!) {
    updateEntrega(id: $id, updateEntregaInput: $updateEntregaInput) {
      id
      destinatarioId
      encuestaId
      enviado_en
      respondido_en
    }
  }
`

export const DELETE_ENTREGA_MUTATION = gql`
  mutation RemoveEntrega($id: String!) {
    removeEntrega(id: $id)
  }
`

export const GUARDAR_RESPUESTAS_MUTATION = gql`
  mutation GuardarRespuestas($input: GuardarRespuestasInput!) {
    guardarRespuestas(input: $input)
  }
`

export const CREATE_BULK_OCR_MUTATION = gql`
  mutation CreateBulkOCR($encuestaId: String!, $cantidad: Float!) {
    createBulkOCR(encuestaId: $encuestaId, cantidad: $cantidad)
  }
`

export const CREATE_BULK_AUDIO_MUTATION = gql`
  mutation CreateBulkAudio($input: CreateBulkEntregaInput!) {
    createBulkAudio(input: $input) {
      message
      cantidad
      encuestaId
      entregas {
        id
        enviado_en
      }
    }
  }
`

export const SEND_CHATBOT_MESSAGE_MUTATION = gql`
  mutation SendChatbotMessage($input: ChatbotRequestInput!) {
    sendChatbotMessage(input: $input) {
      response
      sessionId
      message
      action
      result
    }
  }
`
