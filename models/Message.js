class Message {
  constructor({ id, senderId, receiverId, content, sentAt }) {
    this.id = id;
    this.senderId = senderId;
    this.receiverId = receiverId;
    this.content = content;
    this.sentAt = sentAt;
  }
}

module.exports = Message;
