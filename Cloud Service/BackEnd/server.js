var express = require('express');
var serveStatic = require('serve-static');
var app = require('./controller/app.js');

var port = 8082;

app.use(serveStatic(__dirname + '/public')); 

var server = app.listen(port, function(){
    console.log('Cloud Web App Backend Server Hosted at http://localhost:%s', port);
});

var app = require('./controller/app.js');