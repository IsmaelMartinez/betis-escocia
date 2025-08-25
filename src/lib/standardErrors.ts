/**
 * Standardized error messages for consistent user experience
 * All user-facing messages should be in Spanish to match the app's language
 */

export const StandardErrors = {
  // Authentication & Authorization
  UNAUTHORIZED: 'Usuario no autenticado',
  FORBIDDEN: 'Acceso denegado',
  ADMIN_REQUIRED: 'Se requiere acceso de administrador',
  
  // Generic Server Errors
  INTERNAL_SERVER_ERROR: 'Error interno del servidor',
  SERVICE_UNAVAILABLE: 'Servicio no disponible temporalmente',
  
  // Data Operations
  NOT_FOUND: 'Recurso no encontrado',
  ALREADY_EXISTS: 'El recurso ya existe',
  INVALID_REQUEST: 'Solicitud inválida',
  VALIDATION_ERROR: 'Error de validación de datos',
  
  // Database Errors
  DATABASE_ERROR: 'Error de base de datos',
  DATABASE_CONNECTION_ERROR: 'Error de conexión a la base de datos',
  
  // Specific Business Logic Errors
  RSVP: {
    MATCH_NOT_FOUND: 'Partido no encontrado',
    ALREADY_CONFIRMED: 'Ya has confirmado tu asistencia para este partido',
    DATA_ERROR: 'Error al obtener datos de confirmaciones',
  },
  
  CONTACT: {
    PROCESSING_ERROR: 'Error interno del servidor al procesar tu mensaje',
    STATS_ERROR: 'Error al obtener estadísticas de contacto',
  },
  
  VOTING: {
    NOT_ACTIVE: 'La votación no está activa en este momento',
    PERIOD_ENDED: 'El período de votación ha terminado',
    ALREADY_VOTED: 'Ya has votado anteriormente. Solo se permite un voto por persona',
    DESIGN_NOT_FOUND: 'El diseño seleccionado no existe. Por favor, recarga la página',
    DATA_NOT_INITIALIZED: 'No se encontraron datos de votación. La votación podría no estar inicializada',
    DATA_ERROR: 'Error al cargar los datos de votación',
    INVALID_ACTION: 'Acción no válida',
    PERMISSION_ERROR: 'Error de permisos al acceder a los datos de votación',
    FORMAT_ERROR: 'Error en el formato de los datos de votación',
  },
  
  TRIVIA: {
    // Existing errors
    DAILY_SCORE_ERROR: 'Error al verificar puntuación diaria',
    ALREADY_PLAYED: 'Ya has jugado hoy. Vuelve mañana para una nueva partida',
    SAVE_SCORE_ERROR: 'Error al guardar la puntuación',
    FETCH_SCORE_ERROR: 'Error al obtener puntuación total',
    AUTHENTICATION_REQUIRED: 'Se requiere autenticación para jugar',
    
    // Enhanced error handling
    QUESTIONS_FETCH_ERROR: 'Error al obtener preguntas del trivia',
    QUESTIONS_NOT_AVAILABLE: 'No hay preguntas disponibles en este momento',
    INVALID_ACTION: 'Acción no válida para el endpoint de trivia',
    DATABASE_CONNECTION_FAILED: 'Error de conexión con la base de datos',
    SCORE_VALIDATION_ERROR: 'Puntuación inválida',
    DAILY_LIMIT_EXCEEDED: 'Has excedido el límite diario de intentos',
    SESSION_EXPIRED: 'Tu sesión ha expirado, por favor inicia sesión nuevamente',
    RATE_LIMITED: 'Demasiadas solicitudes, intenta de nuevo más tarde',
    SERVICE_MAINTENANCE: 'El servicio de trivia está en mantenimiento',
    AGGREGATION_ERROR: 'Error al calcular puntuaciones totales',
    TOKEN_INVALID: 'Token de autenticación inválido',
    UNEXPECTED_ERROR: 'Error inesperado en el sistema de trivia',
  },
  
  GDPR: {
    VERIFICATION_ERROR: 'Error verificando registros',
    DELETION_ERROR: 'Error eliminando registros',
    INVALID_REQUEST_TYPE: 'Tipo de petición inválido',
  },
  
  STANDINGS: {
    FETCH_ERROR: 'No se pudieron obtener las clasificaciones',
  },
} as const;

/**
 * Helper function to create consistent error objects
 */
export function createStandardError(message: string, statusCode: number = 500): Error & { statusCode: number } {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
}

/**
 * Helper function to get error message with fallback
 */
export function getErrorMessage(error: unknown, fallback: string = StandardErrors.INTERNAL_SERVER_ERROR): string {
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}