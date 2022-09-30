// app.js
const express = require("express");
var session = require("express-session");
const dotenv = require("dotenv");
dotenv.config();
// const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const compression = require("compression");
require("./strategies/discord");

const Email = require('./models/Emails');

//import routers
const daoRouter = require("./routes/daoRoute");
const authRouter = require("./routes/authRoute");
const reviewRouter = require("./routes/reviewRoute");
const reviewRouterv2 = require("./routes/reviewRoute-v2");
const searchRouter = require("./routes/searchRoute");
// const analyticsRouter = require("./routes/analyticsRoute");
const txnRouter = require("./routes/tippingTxnRoute");

// intialize server
const app = express();
const corsConfig = {
  origin: true,
  credentials: true,
};
app.use(cors(corsConfig));
app.use(compression());
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
app.use("/review-v2", reviewRouterv2);
app.use("/search", searchRouter);
app.use("/txn", txnRouter);
// app.use("/analytics", analyticsRouter);

//save email news letter

app.get('/email-save', async (req, res) => {
  try {
    let email = req.query.email;
    let newEmail = new Email({ email });
    let saveEmail = await newEmail.save();
    if (saveEmail) {
      return res.status(200).send("success");
    }
    return res.status(500)
  }
  catch (er) {
    return res.status(500).json({ er })
  }
})

const port = process.env.PORT;
db.once("open", function () {
  console.log("DB Connected!");
  app.listen(port, () => {
    console.log("Server is up and running on port number " + port);
  });
});

let script = require('./script');
script();