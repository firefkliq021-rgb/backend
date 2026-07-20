exports.getMessages = (req, res) => {
  res.json([{ id: 1, content: 'Hello there!', senderId: 1, receiverId: 2 }]);
};

exports.sendMessage = (req, res) => {
  res.json({ ok: true, message: req.body.content || 'demo message' });
};
