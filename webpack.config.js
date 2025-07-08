const Dotenv = require("dotenv-webpack");

module.exports = {
  resolve: {
    fallback: {
      path: false,
      os: false,
      crypto: false,
    },
  },
  plugins: [new Dotenv()],
};
