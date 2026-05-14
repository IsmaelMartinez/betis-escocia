/**
 * Standardized error messages for consistent user experience
 * All user-facing messages should be in Spanish to match the app's language
 */

export const StandardErrors = {
  // Authentication & Authorization
  UNAUTHORIZED: "Usuario no autenticado",
  FORBIDDEN: "Acceso denegado",
  ADMIN_REQUIRED: "Se requiere acceso de administrador",

  // Generic Server Errors
  INTERNAL_SERVER_ERROR: "Error interno del servidor",
  SERVICE_UNAVAILABLE: "Servicio no disponible temporalmente",

  // Data Operations
  NOT_FOUND: "Recurso no encontrado",
  ALREADY_EXISTS: "El recurso ya existe",
  INVALID_REQUEST: "Solicitud inválida",
  VALIDATION_ERROR: "Error de validación de datos",

  // Database Errors
  DATABASE_ERROR: "Error de base de datos",
  DATABASE_CONNECTION_ERROR: "Error de conexión a la base de datos",

  VOTING: {
    NOT_ACTIVE: "La votación no está activa en este momento",
    PERIOD_ENDED: "El período de votación ha terminado",
    ALREADY_VOTED:
      "Ya has votado anteriormente. Solo se permite un voto por persona",
    DESIGN_NOT_FOUND:
      "El diseño seleccionado no existe. Por favor, recarga la página",
    DATA_NOT_INITIALIZED:
      "No se encontraron datos de votación. La votación podría no estar inicializada",
    DATA_ERROR: "Error al cargar los datos de votación",
    INVALID_ACTION: "Acción no válida",
    PERMISSION_ERROR: "Error de permisos al acceder a los datos de votación",
    FORMAT_ERROR: "Error en el formato de los datos de votación",
  },

  STANDINGS: {
    FETCH_ERROR: "No se pudieron obtener las clasificaciones",
  },
} as const;

/**
 * Helper function to create consistent error objects
 */
export function createStandardError(
  message: string,
  statusCode: number = 500,
): Error & { statusCode: number } {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
}

/**
 * Helper function to get error message with fallback
 */
export function getErrorMessage(
  error: unknown,
  fallback: string = StandardErrors.INTERNAL_SERVER_ERROR,
): string {
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}
