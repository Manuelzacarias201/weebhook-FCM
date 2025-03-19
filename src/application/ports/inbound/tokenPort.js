// src/application/ports/inbound/tokenPort.js

/**
 * Puerto de entrada para el registro y gestión de tokens FCM
 */
class TokenPort {
    /**
     * @param {string} userId - ID único del usuario
     * @param {string} token - Token FCM para el dispositivo del usuario
     * @param {Object} deviceInfo - Información adicional del dispositivo
     * @returns {Promise<boolean>} - True si el registro fue exitoso
     */
    async registerToken(userId, token, deviceInfo) {
      throw new Error('Method not implemented');
    }
  
    /**
     * Elimina un token FCM para un usuario
     * @param {string} userId - ID único del usuario
     * @param {string} token - Token FCM a eliminar
     * @returns {Promise<boolean>} - True si la eliminación fue exitosa
     */
    async removeToken(userId, token) {
      throw new Error('Method not implemented');
    }
  
    /**
     * Obtiene todos los tokens FCM asociados a un usuario
     * @param {string} userId - ID único del usuario
     * @returns {Promise<Array<string>>} - Lista de tokens FCM
     */
    async getTokensByUser(userId) {
      throw new Error('Method not implemented');
    }
  
    /**
     * Verifica si un token está activo
     * @param {string} token - Token FCM a verificar
     * @returns {Promise<boolean>} - True si el token está activo
     */
    async isTokenActive(token) {
      throw new Error('Method not implemented');
    }
  }
  
  module.exports = TokenPort;