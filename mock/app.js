var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, '../release')));
console.log(path.join(__dirname, '../release'));
app.use(bodyParser.json());

// CORS
app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/', function(req, res) {
  res.sendfile('./release/index.html');
});

var server = app.listen(8080, function () {
  var host = 'localhost';
  var port = server.address().port;
  console.log('Mock server listening at http://%s:%s', host, port);
});