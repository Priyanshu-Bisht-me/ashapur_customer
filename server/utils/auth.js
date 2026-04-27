const jwt = require("jsonwebtoken");
const { serializeUser } = require("./serializers");

function signToken(user) {
  return jwt.sign(
    {
      sub: String(user._id),
      role: user.role,
      email: user.email
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function buildAuthPayload(user) {
  return {
    token: signToken(user),
    user: serializeUser(user)
  };
}

module.exports = {
  buildAuthPayload,
  signToken
};
