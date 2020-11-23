const apiKey = process.env.APIKEY;

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    if (authHeader === apiKey) {
      return next()
    }
    else {
      return res.status(401).json({
        status: "401",
        error: "API key not match"
      });
    }
  }
  else {
    return res.status(401).json({
      status: "401",
      error: "No api key provided"
    });
  }
}

module.exports = auth;