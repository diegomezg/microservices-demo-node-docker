const express = require('express');
var app = express();
//var router = require('./routers/router')


app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send("Simple API Gateway")
})

console.log("Simple API Gateway run on localhost:5050")

app.listen(5050);