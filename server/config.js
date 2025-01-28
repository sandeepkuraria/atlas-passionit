require("dotenv").config();

module.exports = {
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  IV: process.env.IV,
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
};
