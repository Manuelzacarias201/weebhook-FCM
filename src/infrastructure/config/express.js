// src/infrastructure/config/express.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

/**
 * Configura la aplicación Express con middlewares y configuraciones de seguridad
 * @param {Object} options - Opciones de configuración
 * @returns {Object} - Aplicación Express configurada
 */
function configureExpressApp(options = {}) {
  const app = express();
  
  // Configuraciones básicas
  app.disable('x-powered-by');
  app.set('trust proxy', options.trustProxy || 1);
  
  // Middlewares de seguridad
  app.use(helmet());
  app.use(cors(options.cors || {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Webhook-Token']
  }));
  
  // Limitar tasa de peticiones
  const limiter = rateLimit({
    windowMs: options.rateLimitWindow || 15 * 60 * 1000, // 15 minutos por defecto
    max: options.rateLimitMax || 100, // límite de 100 peticiones por ventana
    standardHeaders: true,
    legacyHeaders: false
  });
  
  // Aplicar limitador a las rutas que lo necesiten
  if (options.applyRateLimit !== false) {
    app.use('/api/', limiter);
  }
  
  // Parsing de cuerpo de petición
  app.use(express.json({
    limit: options.jsonLimit || '1mb'
  }));
  app.use(express.urlencoded({
    extended: true,
    limit: options.urlencodedLimit || '1mb'
  }));
  
  // Logging
  const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
  app.use(morgan(morganFormat));
  
  // Middleware para manejo de errores de JSON mal formado
  app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      return res.status(400).json({
        success: false,
        error: 'Invalid JSON payload'
      });
    }
    next(err);
  });
  
  // Ruta básica de estado
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date(),
      uptime: process.uptime()
    });
  });
  
  return app;
}

module.exports = configureExpressApp;