const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const dbConnect = require("../src/config/db");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const http = require("http");
require("dotenv").config();

const initializeSocket = require("../src/utils/socket");

const { authRouter } = require("./routes/auth");
const { profileRouter } = require("./routes/profile");
const { requestRouter } = require("./routes/request");
const { userRouter } = require("./routes/user");
const { chatRouter } = require("./routes/chat");
const { swipeRouter } = require("./routes/swipeRouter");
const rateLimit = require("express-rate-limit");

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  }),
);
app.use("/login", rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);

app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", chatRouter);
app.use("/", swipeRouter);
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "SERVER_ERROR" });
});

const server = http.createServer(app);
initializeSocket(server);
dbConnect()
  .then(() => {
    server.listen(3000, () => {
      console.log("server running on port 3000");
    });
  })
  .catch((err) => {
    console.log(err);
  });
