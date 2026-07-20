exports.getMatches = (req, res) => {
  res.json([{ id: 1, userAId: 1, userBId: 2 }]);
};

exports.createMatch = (req, res) => {
  res.json({ ok: true, match: { userAId: 1, userBId: 2 } });
};
