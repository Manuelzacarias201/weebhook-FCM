// src/infrastructure/adapters/inbound/tokenController.js

class TokenController {
    /**
     * @param {Object} registerTokenUseCase - Caso de uso para registro de tokens
     */
    constructor(registerTokenUseCase) {
      this.registerTokenUseCase = registerTokenUseCase;
    }
  
    /**
     * Registra un nuevo token FCM para un usuario
     * @param {Object} req - Objeto de solicitud HTTP
     * @param {Object} res - Objeto de respuesta HTTP
     */
    async registerToken(req, res) {
      try {
        const { userId, token, deviceInfo } = req.body;
  
        if (!userId || !token) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields: userId and token'
          });
        }
  
        const result = await this.registerTokenUseCase.execute(userId, token, deviceInfo || {});
  
        if (result.success) {
          return res.status(result.created ? 201 : 200).json(result);
        } else {
          return res.status(400).json(result);
        }
      } catch (error) {
        console.error('Error in registerToken controller:', error);
        return res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  
    /**
     * Elimina un token FCM de un usuario
     * @param {Object} req - Objeto de solicitud HTTP
     * @param {Object} res - Objeto de respuesta HTTP
     */
    async removeToken(req, res) {
      try {
        const { userId, token } = req.body;
  
        if (!userId || !token) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields: userId and token'
          });
        }
  
        const result = await this.registerTokenUseCase.removeToken(userId, token);
  
        if (result.success) {
          return res.status(200).json(result);
        } else {
          return res.status(400).json(result);
        }
      } catch (error) {
        console.error('Error in removeToken controller:', error);
        return res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  
    /**
     * Obtiene todos los tokens de un usuario
     * @param {Object} req - Objeto de solicitud HTTP
     * @param {Object} res - Objeto de respuesta HTTP
     */
    async getUserTokens(req, res) {
      try {
        const { userId } = req.params;
  
        if (!userId) {
          return res.status(400).json({
            success: false,
            error: 'Missing required parameter: userId'
          });
        }
  
        const tokens = await this.registerTokenUseCase.tokenRepository.getTokensByUser(userId);
  
        return res.status(200).json({
          success: true,
          userId,
          tokens
        });
      } catch (error) {
        console.error('Error in getUserTokens controller:', error);
        return res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  
    /**
     * Configura las rutas en la aplicación Express
     * @param {Object} app - Aplicación Express
     * @param {string} basePath - Ruta base para los endpoints
     */
    setupRoutes(app, basePath = '/api/tokens') {
      app.post(`${basePath}/register`, this.registerToken.bind(this));
      app.post(`${basePath}/remove`, this.removeToken.bind(this));
      app.get(`${basePath}/user/:userId`, this.getUserTokens.bind(this));
    }
  }
  
  module.exports = TokenController;