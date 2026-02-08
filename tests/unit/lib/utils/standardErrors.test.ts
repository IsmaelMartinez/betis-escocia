import { describe, it, expect } from 'vitest';
import { StandardErrors, createStandardError, getErrorMessage } from '../../../src/lib/standardErrors';

describe('StandardErrors', () => {
  describe('StandardErrors constants', () => {
    it('should have authentication and authorization errors', () => {
      expect(StandardErrors.UNAUTHORIZED).toBe('Usuario no autenticado');
      expect(StandardErrors.FORBIDDEN).toBe('Acceso denegado');
      expect(StandardErrors.ADMIN_REQUIRED).toBe('Se requiere acceso de administrador');
    });

    it('should have generic server errors', () => {
      expect(StandardErrors.INTERNAL_SERVER_ERROR).toBe('Error interno del servidor');
      expect(StandardErrors.SERVICE_UNAVAILABLE).toBe('Servicio no disponible temporalmente');
    });

    it('should have data operation errors', () => {
      expect(StandardErrors.NOT_FOUND).toBe('Recurso no encontrado');
      expect(StandardErrors.ALREADY_EXISTS).toBe('El recurso ya existe');
      expect(StandardErrors.INVALID_REQUEST).toBe('Solicitud inválida');
      expect(StandardErrors.VALIDATION_ERROR).toBe('Error de validación de datos');
    });

    it('should have database errors', () => {
      expect(StandardErrors.DATABASE_ERROR).toBe('Error de base de datos');
      expect(StandardErrors.DATABASE_CONNECTION_ERROR).toBe('Error de conexión a la base de datos');
    });

    it('should have RSVP specific errors', () => {
      expect(StandardErrors.RSVP.MATCH_NOT_FOUND).toBe('Partido no encontrado');
      expect(StandardErrors.RSVP.ALREADY_CONFIRMED).toBe('Ya has confirmado tu asistencia para este partido');
      expect(StandardErrors.RSVP.DATA_ERROR).toBe('Error al obtener datos de confirmaciones');
    });

    it('should have contact specific errors', () => {
      expect(StandardErrors.CONTACT.PROCESSING_ERROR).toBe('Error interno del servidor al procesar tu mensaje');
      expect(StandardErrors.CONTACT.STATS_ERROR).toBe('Error al obtener estadísticas de contacto');
    });

    it('should have voting specific errors', () => {
      expect(StandardErrors.VOTING.NOT_ACTIVE).toBe('La votación no está activa en este momento');
      expect(StandardErrors.VOTING.PERIOD_ENDED).toBe('El período de votación ha terminado');
      expect(StandardErrors.VOTING.ALREADY_VOTED).toBe('Ya has votado anteriormente. Solo se permite un voto por persona');
      expect(StandardErrors.VOTING.DESIGN_NOT_FOUND).toBe('El diseño seleccionado no existe. Por favor, recarga la página');
      expect(StandardErrors.VOTING.DATA_NOT_INITIALIZED).toBe('No se encontraron datos de votación. La votación podría no estar inicializada');
      expect(StandardErrors.VOTING.DATA_ERROR).toBe('Error al cargar los datos de votación');
      expect(StandardErrors.VOTING.INVALID_ACTION).toBe('Acción no válida');
      expect(StandardErrors.VOTING.PERMISSION_ERROR).toBe('Error de permisos al acceder a los datos de votación');
      expect(StandardErrors.VOTING.FORMAT_ERROR).toBe('Error en el formato de los datos de votación');
    });

  it.skip('should have pre-order specific errors (skipped until shop feature)', () => {});

  it.skip('should have merchandise specific errors (skipped until shop feature)', () => {});

  it.skip('should have orders specific errors (skipped until shop feature)', () => {});

    it('should have trivia specific errors', () => {
      expect(StandardErrors.TRIVIA.DAILY_SCORE_ERROR).toBe('Error al verificar puntuación diaria');
      expect(StandardErrors.TRIVIA.ALREADY_PLAYED).toBe('Ya has jugado hoy. Vuelve mañana para una nueva partida');
      expect(StandardErrors.TRIVIA.SAVE_SCORE_ERROR).toBe('Error al guardar la puntuación');
      expect(StandardErrors.TRIVIA.FETCH_SCORE_ERROR).toBe('Error al obtener puntuación total');
      expect(StandardErrors.TRIVIA.AUTHENTICATION_REQUIRED).toBe('Se requiere autenticación para jugar');
    });

    it('should have GDPR specific errors', () => {
      expect(StandardErrors.GDPR.VERIFICATION_ERROR).toBe('Error verificando registros');
      expect(StandardErrors.GDPR.DELETION_ERROR).toBe('Error eliminando registros');
      expect(StandardErrors.GDPR.INVALID_REQUEST_TYPE).toBe('Tipo de petición inválido');
    });

    it('should have standings specific errors', () => {
      expect(StandardErrors.STANDINGS.FETCH_ERROR).toBe('No se pudieron obtener las clasificaciones');
    });
  });

  describe('createStandardError', () => {
    it('should create an error with default status code 500', () => {
      const message = 'Test error message';
      const error = createStandardError(message);
      
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(500);
    });

    it('should create an error with custom status code', () => {
      const message = 'Not found error';
      const statusCode = 404;
      const error = createStandardError(message, statusCode);
      
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(statusCode);
    });

    it('should create errors with various status codes', () => {
      const testCases = [
        { message: 'Bad Request', code: 400 },
        { message: 'Unauthorized', code: 401 },
        { message: 'Forbidden', code: 403 },
        { message: 'Not Found', code: 404 },
        { message: 'Internal Server Error', code: 500 },
        { message: 'Service Unavailable', code: 503 }
      ];

      testCases.forEach(({ message, code }) => {
        const error = createStandardError(message, code);
        expect(error.message).toBe(message);
        expect(error.statusCode).toBe(code);
        expect(error).toBeInstanceOf(Error);
      });
    });

    it('should create errors with standard error messages', () => {
      const error1 = createStandardError(StandardErrors.NOT_FOUND, 404);
      const error2 = createStandardError(StandardErrors.UNAUTHORIZED, 401);
      const error3 = createStandardError(StandardErrors.VALIDATION_ERROR, 400);

      expect(error1.message).toBe('Recurso no encontrado');
      expect(error1.statusCode).toBe(404);
      
      expect(error2.message).toBe('Usuario no autenticado');
      expect(error2.statusCode).toBe(401);
      
      expect(error3.message).toBe('Error de validación de datos');
      expect(error3.statusCode).toBe(400);
    });

    it('should preserve error stack trace', () => {
      const error = createStandardError('Test error');
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('Test error');
    });
  });

  describe('getErrorMessage', () => {
    it('should return error message from Error instance', () => {
      const originalError = new Error('Original error message');
      const message = getErrorMessage(originalError);
      
      expect(message).toBe('Original error message');
    });

    it('should return default fallback for non-Error values', () => {
      const nonErrors = [
        'string error',
        123,
        { error: 'object error' },
        null,
        undefined,
        true,
        []
      ];

      nonErrors.forEach(nonError => {
        const message = getErrorMessage(nonError);
        expect(message).toBe(StandardErrors.INTERNAL_SERVER_ERROR);
      });
    });

    it('should return custom fallback for non-Error values', () => {
      const customFallback = 'Custom fallback message';
      const nonErrors = [
        'string error',
        123,
        { error: 'object error' },
        null,
        undefined
      ];

      nonErrors.forEach(nonError => {
        const message = getErrorMessage(nonError, customFallback);
        expect(message).toBe(customFallback);
      });
    });

    it('should handle Error instances with empty messages', () => {
      const emptyError = new Error('');
      const message = getErrorMessage(emptyError);
      
      expect(message).toBe('');
    });

    it('should handle custom Error subclasses', () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'CustomError';
        }
      }

      const customError = new CustomError('Custom error message');
      const message = getErrorMessage(customError);
      
      expect(message).toBe('Custom error message');
    });

    it('should handle errors created by createStandardError', () => {
      const standardError = createStandardError('Standard error message', 400);
      const message = getErrorMessage(standardError);
      
      expect(message).toBe('Standard error message');
    });

    it('should use fallback with various error types', () => {
      const fallbackMessage = 'Fallback message';
      
      // Test with primitive values
      expect(getErrorMessage(null, fallbackMessage)).toBe(fallbackMessage);
      expect(getErrorMessage(undefined, fallbackMessage)).toBe(fallbackMessage);
      expect(getErrorMessage('string', fallbackMessage)).toBe(fallbackMessage);
      expect(getErrorMessage(42, fallbackMessage)).toBe(fallbackMessage);
      expect(getErrorMessage(true, fallbackMessage)).toBe(fallbackMessage);
      
      // Test with complex values
      expect(getErrorMessage({}, fallbackMessage)).toBe(fallbackMessage);
      expect(getErrorMessage([], fallbackMessage)).toBe(fallbackMessage);
      expect(getErrorMessage({ message: 'not an error' }, fallbackMessage)).toBe(fallbackMessage);
    });
  });

  describe('Integration with StandardErrors', () => {
    it('should work well with createStandardError for common patterns', () => {
      // Create errors using standard messages
      const authError = createStandardError(StandardErrors.UNAUTHORIZED, 401);
      const validationError = createStandardError(StandardErrors.VALIDATION_ERROR, 400);
      const notFoundError = createStandardError(StandardErrors.NOT_FOUND, 404);

      // Extract messages using getErrorMessage
      expect(getErrorMessage(authError)).toBe(StandardErrors.UNAUTHORIZED);
      expect(getErrorMessage(validationError)).toBe(StandardErrors.VALIDATION_ERROR);
      expect(getErrorMessage(notFoundError)).toBe(StandardErrors.NOT_FOUND);
    });

    it('should handle nested error objects', () => {
      const rsvpError = createStandardError(StandardErrors.RSVP.MATCH_NOT_FOUND, 404);
      const votingError = createStandardError(StandardErrors.VOTING.ALREADY_VOTED, 400);
      const triviaError = createStandardError(StandardErrors.TRIVIA.ALREADY_PLAYED, 409);

      expect(getErrorMessage(rsvpError)).toBe('Partido no encontrado');
      expect(getErrorMessage(votingError)).toBe('Ya has votado anteriormente. Solo se permite un voto por persona');
      expect(getErrorMessage(triviaError)).toBe('Ya has jugado hoy. Vuelve mañana para una nueva partida');
    });
  });

  describe('Type safety', () => {
    it('should maintain const assertion for StandardErrors', () => {
      // This test ensures that StandardErrors maintains its const assertion
      // which prevents accidental modification and ensures type safety
      expect(typeof StandardErrors).toBe('object');
      expect(Object.isFrozen(StandardErrors)).toBe(false); // const assertion doesn't freeze
      
      // But the structure should be accessible
      expect(StandardErrors.UNAUTHORIZED).toBeDefined();
      expect(StandardErrors.RSVP.MATCH_NOT_FOUND).toBeDefined();
      expect(StandardErrors.VOTING.ALREADY_VOTED).toBeDefined();
    });

    it('should work with TypeScript type checking', () => {
      // These should compile without errors in TypeScript
      const message1: string = StandardErrors.NOT_FOUND;
      const message2: string = StandardErrors.RSVP.DATA_ERROR;
      const message3: string = StandardErrors.VOTING.INVALID_ACTION;

      expect(message1).toBe('Recurso no encontrado');
      expect(message2).toBe('Error al obtener datos de confirmaciones');
      expect(message3).toBe('Acción no válida');
    });
  });
});