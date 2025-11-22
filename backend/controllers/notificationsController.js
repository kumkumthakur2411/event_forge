// Notifications endpoint removed - feature disabled
exports.getNotifications = async (req, res) => {
  res.status(404).json({ message: 'Notifications disabled' });
};

exports.markRead = async (req, res) => {
  res.status(404).json({ message: 'Notifications disabled' });
};

exports.markAllRead = async (req, res) => {
  res.status(404).json({ message: 'Notifications disabled' });
};

exports.deleteNotification = async (req, res) => {
  res.status(404).json({ message: 'Notifications disabled' });
};
