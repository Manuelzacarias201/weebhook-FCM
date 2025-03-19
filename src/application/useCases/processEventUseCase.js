// src/application/useCases/processEventUseCase.js

class ProcessEventUseCase {
    /**
     * @param {Object} eventProcessor - Servicio de procesamiento de eventos
     * @param {Object} notificationService - Servicio de notificaciones
     * @param {Object} tokenRepository - Repositorio de tokens
     */
    constructor(eventProcessor, notificationService, tokenRepository) {
      this.eventProcessor = eventProcessor;
      this.notificationService = notificationService;
      this.tokenRepository = tokenRepository;
    }
  
    /**
     * Procesa un evento y envía notificaciones si es necesario
     * @param {Object} eventData - Datos del evento a procesar
     * @param {string} source - Fuente del evento
     * @returns {Promise<Object>} - Resultado del procesamiento
     */
    async execute(eventData, source) {
      try {
        // Validar y procesar el evento
        const processedEvent = await this.eventProcessor.processEvent(eventData, source);
        
        if (!processedEvent || !processedEvent.shouldNotify) {
          return { success: true, notified: false, processedEvent };
        }
  
        // Determinar los usuarios a notificar
        const usersToNotify = processedEvent.usersToNotify || [];
        
        // Para cada usuario, obtener sus tokens y enviar notificaciones
        const notificationResults = [];
        
        for (const userId of usersToNotify) {
          const tokens = await this.tokenRepository.getTokensByUser(userId);
          
          if (!tokens || tokens.length === 0) {
            notificationResults.push({
              userId,
              success: false,
              reason: 'No tokens available'
            });
            continue;
          }
          
          // Generar y enviar notificación
          const notification = this.notificationService.createNotificationFromEvent(
            processedEvent,
            userId
          );
          
          const result = await this.notificationService.sendNotification(notification, tokens);
          
          notificationResults.push({
            userId,
            success: result.success,
            tokensCount: tokens.length,
            failedTokens: result.failedTokens || []
          });
          
          // Eliminar tokens inválidos
          for (const invalidToken of (result.failedTokens || [])) {
            if (invalidToken.reason === 'TOKEN_NOT_REGISTERED') {
              await this.tokenRepository.removeToken(userId, invalidToken.token);
            }
          }
        }
        
        return {
          success: true,
          notified: notificationResults.some(r => r.success),
          notificationResults,
          processedEvent
        };
      } catch (error) {
        console.error('Error processing event:', error);
        return {
          success: false,
          error: error.message
        };
      }
    }
  }
  
  module.exports = ProcessEventUseCase;