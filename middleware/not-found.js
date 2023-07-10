const notFound = (req, res) =>
  res.status(404).send('Error 404 - Page not found!');

module.exports = notFound;
