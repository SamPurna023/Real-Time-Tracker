const express = require("express");
const app = express();
const path = require("path")
const http = require("http");

const socketio = require("socket.io");
const server = http.createServer(app);
const io = socketio(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

const users = {};

io.on("connection", function(socket) {
    // Send existing users' locations to the new connection
    for (const id in users) {
        socket.emit("receive-location", { id, ...users[id] });
    }

    socket.on("send-location", function (data){
        users[socket.id] = data; // Save location
        io.emit("receive-location", {id: socket.id, ...data })
    })
    socket.on("disconnect", function(){
        delete users[socket.id]; // Remove location
        io.emit("user-disconnect", socket.id);
    })
});

app.get("/", function (req,res) {
    res.render("index");
});

server.listen(3000, '0.0.0.0');