// src/domain/services/notificationService.js

const Notification = require('../models/notification');

class NotificationService {
  /**
   * @param {Object} messagingPort - Puerto para envío de notificaciones
   */
  constructor(messagingPort) {
    this.messagingPort = messagingPort;
  }

  /**
   * Crea una notificación a partir de un evento procesado
   * @param {Object} event - Evento procesado
   * @param {string} userId - ID del usuario destinatario
   * @returns {Notification} - Notificación generada
   */
  createNotificationFromEvent(event, userId) {
    // Extracción de datos relevantes del evento
    const {
      type,
      title,
      body,
      data,
      priority = 'normal',
      timeToLive = 86400 // 24 horas por defecto
    } = event;

    // Creación de la notificación
    const notification = new Notification({
      userId,
      title: title || this.getTitleForEventType(type),
      body: body || this.getBodyForEventType(type, event),
      data: {
        eventId: event.id,
        eventType: type,
        ...data
      },
      priority,
      timeToLive
    });

    return notification;
  }

  /**
   * Envía una notificación a uno o varios tokens FCM
   * @param {Notification} notification - Notificación a enviar
   * @param {Array<string>} tokens - Tokens FCM donde enviar la notificación
   * @returns {Promise<Object>} - Resultado del envío
   */
  async sendNotification(notification, tokens) {
    if (!tokens || tokens.length === 0) {
      return {
        success: false,
        reason: 'No tokens provided'
      };
    }

    try {
      // Preparar mensaje para Firebase
      const message = {
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: this.sanitizeData(notification.data),
        android: {
          priority: notification.priority === 'high' ? 'high' : 'normal',
          ttl: notification.timeToLive * 1000 // Convertir a milisegundos
        },
        apns: {
          headers: {
            'apns-priority': notification.priority === 'high' ? '10' : '5',
            'apns-expiration': Math.floor(Date.now() / 1000) + notification.timeToLive
          }
        }
      };

      // Enviamos la notificación a través del puerto de mensajería
      const result = await this.messagingPort.sendToTokens(message, tokens);
      
      return {
        success: result.successCount > 0,
        successCount: result.successCount,
        failureCount: result.failureCount,
        failedTokens: this.processFailedTokens(result.responses, tokens)
      };
    } catch (error) {
      console.error('Error sending notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtiene el título predeterminado para un tipo de evento
   * @param {string} eventType - Tipo de evento
   * @returns {string} - Título predeterminado
   */
  getTitleForEventType(eventType) {
    const titles = {
      'payment': 'Nuevo pago recibido',
      'order': 'Actualización de pedido',
      'message': 'Nuevo mensaje',
      'alert': 'Alerta importante',
      'reminder': 'Recordatorio'
    };

    return titles[eventType] || 'Nueva notificación';
  }

  /**
   * Obtiene el cuerpo predeterminado para un tipo de evento
   * @param {string} eventType - Tipo de evento
   * @param {Object} event - Datos del evento
   * @returns {string} - Cuerpo predeterminado
   */
  getBodyForEventType(eventType, event) {
    switch (eventType) {
      case 'payment':
        return `Se ha recibido un pago de ${event.amount || 'cantidad no especificada'}.`;
      case 'order':
        return `Tu pedido #${event.orderId || 'N/A'} ha sido ${event.status || 'actualizado'}.`;
      case 'message':
        return `Has recibido un nuevo mensaje de ${event.sender || 'un usuario'}.`;
      case 'alert':
        return `${event.message || 'Hay una alerta que requiere tu atención.'}`;
      case 'reminder':
        return `Recordatorio: ${event.message || 'Tienes un evento pendiente.'}`;
      default:
        return 'Tienes una nueva notificación.';
    }
  }

  /**
   * Sanitiza los datos para enviar como data en FCM
   * @param {Object} data - Datos a sanitizar
   * @returns {Object} - Datos sanitizados
   */
  sanitizeData(data) {
    // FCM requiere que todos los valores sean strings
    const sanitized = {};
    
    for (const [key, value] of Object.entries(data || {})) {
      sanitized[key] = String(value);
    }
    
    return sanitized;
  }

  /**
   * Procesa los resultados fallidos para identificar tokens inválidos
   * @param {Array<Object>} responses - Respuestas de FCM
   * @param {Array<string>} tokens - Tokens enviados
   * @returns {Array<Object>} - Tokens fallidos con razón
   */
  processFailedTokens(responses, tokens) {
    const failedTokens = [];
    
    if (!responses || !tokens) return failedTokens;
    
    responses.forEach((response, index) => {
      if (!response.success) {
        failedTokens.push({
          token: tokens[index],
          reason: response.error?.code || 'UNKNOWN_ERROR'
        });
      }
    });
    
    return failedTokens;
  }
}

module.exports = NotificationService;