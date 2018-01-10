/*
 * A very basic HTTP relay server using node.js.
 *
 * Thank you to @florton for doing the initial legwork.
 *
 * Inspired by http://blog.javascripting.com/2015/01/17/dont-hassle-with-cors/
 *
 * Run using: node node-http-relay.js
 */
var express = require('express');
var request = require('request');
var app = express();

var API_HOST = "http://api.champion.gg/v2"; // Put your actual API host here.

app.use('/', function (req, res) {
    var url = API_HOST + req.url;

    console.log("Connecting to service:", url); // eslint-disable-line no-console
    console.log("Using parameters:", req.query); // eslint-disable-line no-console

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    req.pipe(request(url)).pipe(res);
});

console.log("Starting super-simple HTTP relay server..."); // eslint-disable-line no-console
app.listen(process.env.PORT || 3000);
