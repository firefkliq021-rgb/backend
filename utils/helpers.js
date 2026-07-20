function formatUserName(name) {
  return name.trim().toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

module.exports = { formatUserName };
