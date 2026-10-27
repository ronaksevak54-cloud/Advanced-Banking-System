const dns = require("dns");
const cookieParser = require("cookie-parser");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
dns.setDefaultResultOrder("ipv4first");
const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRoute = require("../routes/route");
const accountRoute = require("../routes/accountroutes");
const transactionRoute = require("../routes/transaction.route");
const app = express();
dotenv.config();
app.use(express.json());
app.use(cookieParser());
app.use("/user", authRoute);
app.use("/account", accountRoute);
app.use("/transaction",transactionRoute);
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connect to MongoDB");
  })
  .catch((error) => {
    console.log(error);
  });
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
