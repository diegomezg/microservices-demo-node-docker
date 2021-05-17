const express = require('express');
var app = express();
//var router = require('./routers/router')


app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.get('/user', (req, res) => {
    app.get('http://api-users:4041', (req, res) => {
        res.json({
            success: true,
            total,
            users,
        }).status(200)
    });
});

app.get('/post', (req, res) => {
    app.get('http://api-posts:4040', (req, res) => {
        res.json({
            success: true,
            total,
            posts,
        }).status(200)
    });
});

console.log("Simple API Gateway run on localhost:5050")

app.listen(5050);