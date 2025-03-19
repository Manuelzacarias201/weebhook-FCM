// src/application/useCases/registerTokenUseCase.js

class RegisterTokenUseCase {
    /**
     * @param {Object} tokenRepository - Repositorio para almacenar tokens FCM
     */
    constructor(tokenRepository) {
      this.tokenRepository = tokenRepository;
    }
  
    /**
     * Registra un nuevo token FCM para un usuario
     * @param {string} userId - ID único del usuario
     * @param {string} token - Token FCM del dispositivo
     * @param {Object} deviceInfo - Información adicional del dispositivo
     * @returns {Promise<Object>} - Resultado del registro
     */
    async execute(userId, token, deviceInfo = {}) {
      try {
        // Validar parámetros
        if (!userId || typeof userId !== 'string') {
          throw new Error('userId must be a valid string');
        }
        
        if (!token || typeof token !== 'string') {
          throw new Error('token must be a valid string');
        }
        
        // Verificar si el token ya existe para este usuario
        const existingTokens = await this.tokenRepository.getTokensByUser(userId);
        const tokenExists = existingTokens.includes(token);
        
        if (tokenExists) {
          // Si el token ya existe, actualizamos su información
          await this.tokenRepository.updateTokenInfo(userId, token, {
            ...deviceInfo,
            lastUpdated: new Date()
          });
          
          return {
            success: true,
            created: false,
            updated: true,
            userId,
            token
          };
        }
        
        // Registrar el nuevo token
        const result = await this.tokenRepository.saveToken(userId, token, {
          ...deviceInfo,
          createdAt: new Date(),
          lastUpdated: new Date()
        });
        
        return {
          success: true,
          created: true,
          updated: false,
          userId,
          token
        };
      } catch (error) {
        console.error('Error registering token:', error);
        return {
          success: false,
          error: error.message
        };
      }
    }
  
    /**
     * Elimina un token FCM de un usuario
     * @param {string} userId - ID único del usuario
     * @param {string} token - Token FCM a eliminar
     * @returns {Promise<Object>} - Resultado de la operación
     */
    async removeToken(userId, token) {
      try {
        const removed = await this.tokenRepository.removeToken(userId, token);
        
        return {
          success: true,
          removed,
          userId,
          token
        };
      } catch (error) {
        console.error('Error removing token:', error);
        return {
          success: false,
          error: error.message
        };
      }
    }
  }
  
  module.exports = RegisterTokenUseCase;