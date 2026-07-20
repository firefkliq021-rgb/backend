class Like {
  constructor({ id, fromUserId, toUserId, createdAt }) {
    this.id = id;
    this.fromUserId = fromUserId;
    this.toUserId = toUserId;
    this.createdAt = createdAt;
  }
}

module.exports = Like;
