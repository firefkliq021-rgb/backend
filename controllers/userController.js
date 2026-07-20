exports.getUsers = (req, res) => {
  res.json([{ id: 1, name: 'Amara', city: 'New York' }]);
};

exports.getUserById = (req, res) => {
  res.json({ id: req.params.id, name: 'Amara', city: 'New York' });
};
