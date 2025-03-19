// src/infrastructure/adapters/inbound/webhookController.js

class WebhookController {
    /**
     * @param {Object} processEventUseCase - Caso de uso para procesamiento de eventos
     */
    constructor(processEventUseCase) {
      this.processEventUseCase = processEventUseCase;
    }
  
    /**
     * Procesa eventos recibidos a través del webhook
     * @param {Object} req - Objeto de solicitud HTTP
     * @param {Object} res - Objeto de respuesta HTTP
     */
    async handleWebhook(req, res) {
      try {
        const eventData = req.body;
        const source = req.params.source || req.query.source || 'default';
        
        if (!eventData) {
          return res.status(400).json({
            success: false,
            error: 'Missing event data in request body'
          });
        }
        
        // Verificar cabeceras de autenticación si es necesario
        if (!this.verifyWebhookAuthentication(req, source)) {
          return res.status(401).json({
            success: false,
            error: 'Invalid authentication'
          });
        }
        
        // Procesar el evento
        const result = await this.processEventUseCase.execute(eventData, source);
        
        // Responder según el resultado
        if (result.success) {
          return res.status(200).json({
            success: true,
            eventProcessed: true,
            notificationsDelivered: result.notified,
            resultSummary: {
              notifiedUsers: result.notificationResults ? result.notificationResults.length : 0,
              successfulNotifications: result.notificationResults ? 
                result.notificationResults.filter(r => r.success).length : 0
            }
          });
        } else {
          return res.status(422).json({
            success: false,
            error: result.error || 'Failed to process event'
          });
        }
      } catch (error) {
        console.error('Error in webhook controller:', error);
        return res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  
    /**
     * Verifica la autenticación del webhook
     * @param {Object} req - Objeto de solicitud HTTP
     * @param {string} source - Fuente del webhook
     * @returns {boolean} - True si la autenticación es válida
     */
    verifyWebhookAuthentication(req, source) {
      // Implementación básica, debe adaptarse según los requisitos de seguridad
      const authHeader = req.headers['x-webhook-token'] || req.headers['authorization'];
      
      // Verificar según la fuente
      switch (source) {
        case 'payment-gateway':
          // Verificar firma HMAC o token específico para pasarela de pagos
          return this.verifyPaymentGatewayAuth(authHeader, req.body);
        case 'cms':
          // Verificar token para sistema de CMS
          return this.verifyCmsAuth(authHeader);
        default:
          // Verificación básica para fuentes no específicas
          return !!authHeader && process.env.WEBHOOK_SECRET === authHeader;
      }
    }
  
    /**
     * Verifica autenticación específica para pasarela de pagos
     * @param {string} authHeader - Cabecera de autenticación
     * @param {Object} body - Cuerpo de la solicitud
     * @returns {boolean} - True si la autenticación es válida
     */
    verifyPaymentGatewayAuth(authHeader, body) {
      // Implementación dependerá de cada pasarela de pagos
      // Por ejemplo, verificar firma HMAC
      return true; // Implementar lógica real
    }
  
    /**
     * Verifica autenticación para CMS
     * @param {string} authHeader - Cabecera de autenticación
     * @returns {boolean} - True si la autenticación es válida
     */
    verifyCmsAuth(authHeader) {
      // Implementación para sistema CMS específico
      return authHeader === process.env.CMS_WEBHOOK_TOKEN;
    }
  
    /**
     * Configura las rutas en la aplicación Express
     * @param {Object} app - Aplicación Express
     * @param {string} basePath - Ruta base para los endpoints
     */
    setupRoutes(app, basePath = '/api/webhooks') {
      app.post(`${basePath}`, this.handleWebhook.bind(this));
      app.post(`${basePath}/:source`, this.handleWebhook.bind(this));
    }
  }
  
  module.exports = WebhookController;