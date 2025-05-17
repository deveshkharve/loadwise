const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const http = require("http");
const moment = require("moment");
require("./db");

const { PORT, NODE_ENV } = process.env;

// server setup
const app = express();
const server = http.Server(app);

app.locals.moment = moment;
app.locals.version = process.env.version;
app.locals.NODE_ENV = NODE_ENV;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(bodyParser.urlencoded({ limit: "50mb", extended: false }));
app.use((req, res, next) => express.json({ limit: "50mb" })(req, res, next));
app.use(bodyParser.text({ limit: "50mb" }));
app.use(cookieParser());

app.use(require("./routes"));
// listen to connections
server.listen(PORT);
console.log(`Server is running on port ${PORT}`);
