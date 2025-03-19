// src/application/ports/inbound/webhookPort.js

/**
 * Puerto de entrada para recepción de eventos vía webhook
 */
class WebhookPort {
    /**
     * Procesa un evento recibido a través del webhook
     * @param {Object} eventData - Datos del evento recibido
     * @param {string} source - Fuente o sistema de origen del evento
     * @returns {Promise<Object>} - Resultado del procesamiento del evento
     */
    async processEvent(eventData, source) {
      throw new Error('Method not implemented');
    }
  
    /**
     * Valida que un evento recibido cumpla con la estructura requerida
     * @param {Object} eventData - Datos del evento a validar
     * @param {string} source - Fuente o sistema de origen del evento
     * @returns {boolean} - True si el evento es válido
     */
    validateEvent(eventData, source) {
      throw new Error('Method not implemented');
    }
  
    /**
     * Registra una nueva fuente de eventos
     * @param {string} source - Identificador de la fuente
     * @param {Object} config - Configuración de la fuente
     * @returns {Promise<boolean>} - True si el registro fue exitoso
     */
    async registerEventSource(source, config) {
      throw new Error('Method not implemented');
    }
  }
  
  module.exports = WebhookPort;