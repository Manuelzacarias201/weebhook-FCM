// Puerto para el servicio de mensajería
class MessagingPort {
    /**
     * Envía una notificación a los destinatarios
     * @param {Notification} notification - La notificación a enviar
     * @param {Array<string>} tokens - Tokens de dispositivos a los que enviar
     * @returns {Promise<Object>} - Resultado de la operación
     */
    async send(notification, tokens) {
      throw new Error('Method not implemented');
    }
  }
  
  module.exports = MessagingPort;