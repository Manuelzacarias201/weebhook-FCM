const express = require('./config/express');
const firebase = require('./config/firebase');
const webhookController = require('./adapters/inbound/webhookController');
const tokenController = require('./adapters/inbound/tokenController');

// Initialize Firebase
firebase.initialize();

// Set up routes
const app = express.initialize();
app.post('/webhook', webhookController.handleWebhook);
app.post('/register-token', tokenController.registerToken);

// Simulate events if needed
// require('./utils/eventSimulator').simulate();

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});