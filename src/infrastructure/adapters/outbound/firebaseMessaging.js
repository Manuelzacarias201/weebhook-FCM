const admin = require('firebase-admin');
const MessagingPort = require('../../../application/ports/outbound/messagingPort');

class FirebaseMessaging extends MessagingPort {
  constructor() {
    super();
  }
  
  async send(notification, tokens) {
    if (tokens.length === 0) {
      console.log('No tokens available to send notification');
      return { success: false, message: 'No tokens available' };
    }
    
    const message = {
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: notification.data,
      tokens: tokens
    };
    
    try {
      const response = await admin.messaging().sendMulticast(message);
      console.log('Successfully sent message:', response);
      return { 
        success: true, 
        successCount: response.successCount,
        failureCount: response.failureCount
      };
    } catch (error) {
      console.log('Error sending message:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = FirebaseMessaging;