class Notification {
  constructor(title, body, data = {}) {
    this.title = title;
    this.body = body;
    this.data = data;
  }
}

module.exports = Notification;