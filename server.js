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

var saveUrl = (url) => {
  var doc1 = new Model({ url: url, active: true });
  doc1.save(function (err, doc) {
    if (err) return console.error(err);
    console.log("Document inserted succussfully!");
  });
  return doc1._id;
};

var delUrl = (id) => {
  Model.findByIdAndDelete(id, function (err) {
    if (err) console.log(err);
    console.log("Successful deletion");
  });
};

var toggleUrl = (id) => {
  Model.findById(id, function (err, doc) {
    if (err) console.log(err);
    doc.active = !doc.active;
    doc.save(function (err) {
      if (err) console.log(err);
      var json = {
        content: doc,
        status: "toggle-url",
      };
      wss.broadcast(JSON.stringify(json));
    });
  });
};

router.route("/fetch").get(function (req, res) {
  Model.find({}, function (err, result) {
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  });
});

Model.find({}, function (err, result) {
  if (err) {
    console.log("error");
    throw err;
  }
  crawlList = result;
});

var getUrls = () => {
  Model.find({}, function (err, result) {
    if (err) {
      console.log("error");
      throw err;
    }
    crawlList = result;
  });
};

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
var clients = [];

wss.broadcast = function (data) {
  for (var i in clients) {
    clients[i].send(data);
  }
};

//init websocket ws and handle incomming request
wss.on("connection", (ws) => {
  clients.push(ws);
  console.log("Client connected");
  ws.on("close", () => console.log("Client disconnected"));

  // on receive message
  ws.on("message", function incoming(message) {
    let data = JSON.parse(message);
    console.log(data);
    switch (data.status) {
      case "add-url":
        var newid = saveUrl(data.content);
        var json = {
          content: { _id: newid, url: data.content, active: true },
          status: "add-url",
        };
        wss.broadcast(JSON.stringify(json));
        break;
      case "del-url":
        delUrl(data.content);
        var json = {
          content: data.content,
          status: "del-url",
        };
        wss.broadcast(JSON.stringify(json));
        break;
      case "toggle-url":
        console.log(data.content);
        toggleUrl(data.content);
        break;
      default:
        console.log("error: " + data);
    }
  });
  getUrls();
  ws.send(JSON.stringify({ content: crawlList, status: "url-list" }));
});

//#endregion
