"use strict";

// dependencies
import express from "express";
import http from "http";
import path from "path";
import socketIO from "socket.io";

import Room from "./lib/server/room.js"

// since this now uses es6 modules for easy importing, __dirname has to be manually set here
// also for some reason there's an extra / at the start so it has to get chopped off if it's being hosted locally
let dir = path.dirname(new URL(import.meta.url).pathname);
if (dir.substring(1, 3) == "C:") {
    dir = dir.substring(1);
}
const __dirname = dir;
const PORT = process.env.PORT || 5000;

//initialization
var app = express();
var server = http.Server(app);
var io = socketIO(server);


function sendClientHTML(p, resp) {
    let opts = process.platform === "win32" ? undefined : { root: "/" };
    resp.sendFile(path.join(__dirname, "lib/client/html", p), opts);
}

app.set('port', PORT);
app.use('/static', express.static(__dirname + '/lib/client'));
app.use('/shared', express.static(__dirname + '/lib/shared'));

//Routing
app.get("/", function (request, response) {
    sendClientHTML("index.html", response);
});

server.listen(PORT, function() {
    console.log('Starting server on port 5000');
});

let room = new Room();

io.on('connection', (socket) => {
    console.log('new client connected');
    room.addPlayer(socket);

    socket.on('update', (data) => {room.update(socket.id, data)});

    socket.on('disconnect', () => {room.removePlayer(socket.id)});
});
