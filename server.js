"use strict";

const express = require("express");
const app = express();
var port = 3000;
const router = express.Router();
var crawlList = [];

//#region mongodb
const mongoose = require("mongoose");
// initialise mongodb connection
mongoose.connect("mongodb://localhost:27017/nodedb");
let db = mongoose.connection;

// check connection
db.once("open", function () {
  console.log("Connected to MongoDB");
});

// check for db errors
db.on("error", function (err) {
  console.log(err);
});
let schema = mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    required: true,
  },
});
var Model = mongoose.model("model", schema, "myCollection");
// var doc1 = new Model({ url: "test", active: true });
// doc1.save(function (err, doc) {
//   if (err) return console.error(err);
//   console.log("Document inserted succussfully!");
// });

router.route("/fetch").get(function (req, res) {
  Model.find({}, function (err, result) {
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  });
});

// var query = { address: /^S/ };
// db.collection("myCollection").find(query).toArray(function(err, result) {
Model.find({}, function (err, result) {
  if (err) {
    console.log("error");
    throw err;
  }
  console.log(result);
  crawlList = result;
  // db.close();
});

//#endregion

//#region router

app.use("/", router);

router.get("/status", function (req, res) {
  res.json({ status: "app is running" });
});

var server = app.listen(port, function () {
  console.log("server is running on port " + port);
});

//#endregion

//#region websocket
const SocketServer = require("ws").Server;
const wss = new SocketServer({ server });
var connectedUsers = [];
//init websocket ws and handle incomming request
wss.on("connection", (ws) => {
  console.log("Client connected");
  ws.on("close", () => console.log("Client disconnected"));

  ws.send(JSON.stringify({data: crawlList, status:"success"}));
});

// setInterval(() => {
//   wss.clients.forEach((client) => {
//     client.send(new Date().toTimeString());
//   });
// }, 1000);

// wss.on('connection', function connection(ws){
//   console.log("connection ...");

//   //on connect message
//   wss.on('message', function incoming(message){
//     console.log('received %s', message);
//     connectedUsers.push(message);
//   });

//   ws.send('something');
// });
//#endregion
