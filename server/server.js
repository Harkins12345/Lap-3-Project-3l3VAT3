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
})

app.set('view engine', 'ejs');

//Middleware
app.use(cors('*'));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:true}))
app.use(bodyParser.text());

app.get('*', checkUser);

app.get('/example', requireAuth, (req, res) => {
    const token = req.headers.cookie.split('=')[1];
    const decodedToken = jwt.decode(token);
});

app.use(authRoutes);

module.exports = app;