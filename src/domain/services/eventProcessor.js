const Notification = require('../models/notification');

class EventProcessor {
  process(event) {
    let notification;
    
    switch(event.type) {
      case 'user_action':
        notification = new Notification(
          'User Action',
          `User ${event.data.user} performed action: ${event.data.action}`,
          { eventId: event.id, type: 'user_action' }
        );
        break;
      case 'system_alert':
        notification = new Notification(
          'System Alert',
          `Alert: ${event.data.message}`,
          { eventId: event.id, type: 'system_alert', level: event.data.level }
        );
        break;
      case 'data_update':
        notification = new Notification(
          'Data Update',
          `${event.data.entity} data has been updated`,
          { eventId: event.id, type: 'data_update', entity: event.data.entity }
        );
        break;
      default:
        notification = new Notification(
          'New Event',
          `Event of type ${event.type} occurred`,
          { eventId: event.id, type: event.type }
        );
    }
    
    return notification;
  }
}

module.exports = EventProcessor;