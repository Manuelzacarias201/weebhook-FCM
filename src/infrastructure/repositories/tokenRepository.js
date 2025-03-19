// src/infrastructure/repositories/tokenRepository.js

class TokenRepository {
    /**
     * @param {Object} firestore - Instancia de Firestore o base de datos
     * @param {string} collectionName - Nombre de la colección para tokens
     */
    constructor(firestore, collectionName = 'fcm_tokens') {
      this.firestore = firestore;
      this.collectionName = collectionName;
      this.tokensCollection = firestore.collection(collectionName);
    }
  
    /**
     * Guarda un token FCM para un usuario
     * @param {string} userId - ID único del usuario
     * @param {string} token - Token FCM del dispositivo
     * @param {Object} deviceInfo - Información adicional del dispositivo
     * @returns {Promise<boolean>} - True si se guardó correctamente
     */
    async saveToken(userId, token, deviceInfo = {}) {
      try {
        const tokenDoc = this.tokensCollection.doc(`${userId}_${token}`);
        
        await tokenDoc.set({
          userId,
          token,
          deviceInfo,
          createdAt: deviceInfo.createdAt || new Date(),
          lastUpdated: new Date(),
          isActive: true
        });
        
        return true;
      } catch (error) {
        console.error('Error saving token:', error);
        throw error;
      }
    }
  
    /**
     * Actualiza la información de un token
     * @param {string} userId - ID único del usuario
     * @param {string} token - Token FCM a actualizar
     * @param {Object} deviceInfo - Nueva información del dispositivo
     * @returns {Promise<boolean>} - True si se actualizó correctamente
     */
    async updateTokenInfo(userId, token, deviceInfo = {}) {
      try {
        const tokenDoc = this.tokensCollection.doc(`${userId}_${token}`);
        
        await tokenDoc.update({
          deviceInfo,
          lastUpdated: new Date()
        });
        
        return true;
      } catch (error) {
        console.error('Error updating token info:', error);
        throw error;
      }
    }
  
    /**
     * Elimina un token FCM de un usuario
     * @param {string} userId - ID único del usuario
     * @param {string} token - Token FCM a eliminar
     * @returns {Promise<boolean>} - True si se eliminó correctamente
     */
    async removeToken(userId, token) {
      try {
        const tokenDoc = this.tokensCollection.doc(`${userId}_${token}`);
        
        // Verificar si el documento existe
        const doc = await tokenDoc.get();
        
        if (!doc.exists) {
          return false; // No se encontró el token
        }
        
        // Eliminar el token
        await tokenDoc.delete();
        
        return true;
      } catch (error) {
        console.error('Error removing token:', error);
        throw error;
      }
    }
  
    /**
     * Marca un token como inactivo
     * @param {string} token - Token FCM a marcar
     * @returns {Promise<boolean>} - True si se actualizó correctamente
     */
    async markTokenAsInactive(token) {
      try {
        // Buscar el documento por token
        const snapshot = await this.tokensCollection.where('token', '==', token).limit(1).get();
        
        if (snapshot.empty) {
          return false; // No se encontró el token
        }
        
        // Actualizar el estado del token
        const tokenDoc = snapshot.docs[0].ref;
        await tokenDoc.update({
          isActive: false,
          lastUpdated: new Date()
        });
        
        return true;
      } catch (error) {
        console.error('Error marking token as inactive:', error);
        throw error;
      }
    }
  
    /**
     * Verifica si un token está activo
     * @param {string} token - Token FCM a verificar
     * @returns {Promise<boolean>} - True si el token está activo
     */
    async isTokenActive(token) {
      try {
        // Buscar el documento por token
        const snapshot = await this.tokensCollection.where('token', '==', token).limit(1).get();
        
        if (snapshot.empty) {
          return false; // No se encontró el token
        }
        
        // Verificar el estado del token
        const tokenData = snapshot.docs[0].data();
        return tokenData.isActive === true;
      } catch (error) {
        console.error('Error checking token status:', error);
        return false;
      }
    }
  
    /**
     * Obtiene todos los tokens de un usuario
     * @param {string} userId - ID único del usuario
     * @returns {Promise<Array<string>>} - Lista de tokens FCM activos
     */
    async getTokensByUser(userId) {
      try {
        // Buscar documentos por userId y isActive = true
        const snapshot = await this.tokensCollection
          .where('userId', '==', userId)
          .where('isActive', '==', true)
          .get();
        
        if (snapshot.empty) {
          return []; // No se encontraron tokens
        }
        
        // Extraer los tokens
        const tokens = snapshot.docs.map(doc => doc.data().token);
        
        return tokens;
      } catch (error) {
        console.error('Error getting tokens by user:', error);
        throw error;
      }
    }
  
    /**
     * Obtiene información detallada de los tokens de un usuario
     * @param {string} userId - ID único del usuario
     * @returns {Promise<Array<Object>>} - Lista de tokens con su información
     */
    async getDetailedTokensByUser(userId) {
      try {
        // Buscar documentos por userId
        const snapshot = await this.tokensCollection
          .where('userId', '==', userId)
          .get();
        
        if (snapshot.empty) {
          return []; // No se encontraron tokens
        }
        
        // Extraer los datos completos
        const tokensData = snapshot.docs.map(doc => doc.data());
        
        return tokensData;
      } catch (error) {
        console.error('Error getting detailed tokens by user:', error);
        throw error;
      }
    }
  
    /**
     * Limpia tokens inactivos o antiguos
     * @param {number} olderThanDays - Eliminar tokens más antiguos que estos días
     * @returns {Promise<number>} - Número de tokens eliminados
     */
    async cleanupOldTokens(olderThanDays = 90) {
      try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
        
        // Buscar tokens inactivos o que no se han actualizado en mucho tiempo
        const snapshot = await this.tokensCollection
          .where('lastUpdated', '<', cutoffDate)
          .get();
        
        if (snapshot.empty) {
          return 0; // No hay tokens para limpiar
        }
        
        // Eliminar los tokens encontrados
        const batch = this.firestore.batch();
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
        
        return snapshot.size; // Número de tokens eliminados
      } catch (error) {
        console.error('Error cleaning up old tokens:', error);
        throw error;
      }
    }
  }
  
  module.exports = TokenRepository;