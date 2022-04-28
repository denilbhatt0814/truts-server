// app.js
const express = require("express");
var session = require("express-session");
const dotenv = require("dotenv");
dotenv.config();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
require("./strategies/discord");

//import routers
const daoRouter = require("./routes/daoRoute");
const authRouter = require("./routes/authRoute");
const reviewRouter = require("./routes/reviewRoute");

// intialize server
const app = express();
app.use(cors({ credentials: true }));

// Set up mongoose connection
const mongoDB = process.env.MONGODB_URI;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

//json middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));

//passport js middleware
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: "secret",
  })
);
app.use(passport.initialize());
app.use(passport.session());

//routes
app.use("/dao", daoRouter);
app.use("/auth", authRouter);
app.use("/review", reviewRouter);

const port = process.env.PORT;
db.once("open", function () {
  console.log("DB Connected!");
  app.listen(port, () => {
    console.log("Server is up and running on port number " + port);
  });
});
