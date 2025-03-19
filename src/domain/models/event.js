class Event {
  constructor(id, type, data, timestamp = new Date()) {
    this.id = id;
    this.type = type;
    this.data = data;
    this.timestamp = timestamp;
  }
}

module.exports = Event;