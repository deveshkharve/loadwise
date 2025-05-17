// require modules
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, ".env") });

const packageJson = require("./package.json");
process.env.VERSION = packageJson.version;

require("./src/server");
