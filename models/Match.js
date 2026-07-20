class Match {
  constructor({ id, userAId, userBId, createdAt }) {
    this.id = id;
    this.userAId = userAId;
    this.userBId = userBId;
    this.createdAt = createdAt;
  }
}

module.exports = Match;
