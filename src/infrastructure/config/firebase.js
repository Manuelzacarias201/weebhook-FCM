// src/infrastructure/config/firebase.js
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

/**
 * Inicializa Firebase Admin SDK
 * @param {Object} options - Opciones de configuración
 * @returns {Object} - Instancia inicializada de Firebase Admin
 */
function initializeFirebase(options = {}) {
  // Si ya está inicializado, devolver la instancia
  if (admin.apps.length) {
    return admin;
  }
  
  try {
    let credential;
    
    // Opción 1: Usar una ruta a un archivo de credenciales
    if (options.credentialPath || process.env.FIREBASE_CREDENTIAL_PATH) {
      const credentialPath = options.credentialPath || process.env.FIREBASE_CREDENTIAL_PATH;
      const fullPath = path.resolve(credentialPath);
      
      if (fs.existsSync(fullPath)) {
        const serviceAccount = require(fullPath);
        credential = admin.credential.cert(serviceAccount);
      } else {
        throw new Error(`Firebase credential file not found at: ${fullPath}`);
      }
    }
    // Opción 2: Usar JSON de credenciales en variable de entorno
    else if (process.env.FIREBASE_CREDENTIALS) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
        credential = admin.credential.cert(serviceAccount);
      } catch (error) {
        throw new Error('Invalid Firebase credentials JSON in environment variable');
      }
    }
    // Opción 3: Usar credenciales de aplicación predeterminada
    else if (options.useApplicationDefaultCredentials || process.env.USE_APPLICATION_DEFAULT_CREDENTIALS) {
      credential = admin.credential.applicationDefault();
    }
    // Si no hay credenciales, usar un objeto vacío (para entornos como Cloud Functions)
    else {
      console.warn('No explicit Firebase credentials provided, relying on environment defaults');
      credential = {}; // En entornos como Cloud Functions, esto funcionará
    }
    
    // Inicializar la aplicación con las credenciales
    admin.initializeApp({
      credential,
      databaseURL: options.databaseURL || process.env.FIREBASE_DATABASE_URL,
      projectId: options.projectId || process.env.FIREBASE_PROJECT_ID,
      storageBucket: options.storageBucket || process.env.FIREBASE_STORAGE_BUCKET
    });
    
    console.log('Firebase Admin SDK initialized successfully');
    return admin;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
}

/**
 * Obtiene una instancia de Firebase Cloud Messaging
 * @returns {Object} - Instancia de FCM
 */
function getMessaging() {
  return initializeFirebase().messaging();
}

/**
 * Obtiene una instancia de Firestore
 * @returns {Object} - Instancia de Firestore
 */
function getFirestore() {
  return initializeFirebase().firestore();
}

/**
 * Obtiene una instancia de Realtime Database
 * @returns {Object} - Instancia de Realtime Database
 */
function getDatabase() {
  return initializeFirebase().database();
}

module.exports = {
  initializeFirebase,
  getMessaging,
  getFirestore,
  getDatabase
};