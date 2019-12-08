const httpError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const server = express();


let mongo = require("mongodb");
let monk = require("monk");
let bodyParser = require("body-parser");
let usersDB = monk('localhost:27017/users');


server.use(bodyParser.urlencoded({
  extended: false
}));


server.use(bodyParser.json());

//Gör vår databas tillgänglig för routen
server.use(function (req, res, next) {
  req.db = usersDB;
  next();
});

server.post('/register', (req, res) => {
    let DB = req.db;

    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;

    let collection = DB.get('users')

    collection.insert({
        "username": username,
        "email": email,
        "password": password
    }, function (err, doc) {
        if (err) {
            res.send('Can not add information to database')
        } else {
            res.send('200')
        }
    });  
});

//Hanterar post-request
server.post('/login', async (req, res) => {
    let DB = req.db;
    let collection = DB.get('users');
    collection.find(
        {'username': req.body.username},
        {}).then(user => {
            if(user[0]) {
                if(user[0].password == req.body.password) {
                    res.send(true)
                } else {
                    res.send(false)
                } 
            } else {
                res.send(false)
            }
    });
});


server.use(morgan('dev'));
server.use(express.json());
server.use(express.urlencoded({ extended: false }));
server.use(cookieParser());
server.use(express.static(path.join(__dirname, 'public')));

server.listen(3500, () => {
    console.log('listening on *:3500');
});

module.exports = server;