class User {
  constructor({ id, name, email, passwordHash, bio, age, city }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.passwordHash = passwordHash;
    this.bio = bio;
    this.age = age;
    this.city = city;
  }
}

module.exports = User;
