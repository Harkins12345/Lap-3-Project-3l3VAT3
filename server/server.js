const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser, jwt } = require('./middleware/authMiddleware');
const bodyParser = require("body-parser");

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: { origin: "*" }
});
const authRoutes = require('./routes/authRoutes');

let usersOnline = 0;

io.on('connection', (socket) => {
    usersOnline++;
    socket.on('setUsername', username => {
        socket.data.username = username;
        console.log(username);
    })
    
    socket.on('sendChallenge', data => {
        io.fetchSockets()
            .then(sockets => {
                sockets.forEach(s => s.data.username === data.challengeeUsername ? s.emit('sentChallenge', data) : null)
            })
    })

    socket.on('getOnlineUsers', data => {
        io.fetchSockets().then(sockets => socket.emit('sendOnlineUsers', sockets.map(s => s.data.username)))
    })

    //socket.on('respondChallenge') -- Create a room and place both users inside
})

//Middleware
app.use(cors('*'));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

app.get('/example', requireAuth, (req, res) => {
    const token = req.headers.cookie.split('=')[1];
    const decodedToken = jwt.decode(token);

    io.fetchSockets().then(sockets => console.log(sockets.length));
});

app.use(authRoutes);

module.exports = server;
