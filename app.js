/**
 * Module dependencies.
 */

var express = require('express');
var RedisStore = require('connect-redis')(express);
var routes = require('./routes');
var user = require('./routes/user');
var search = require('./routes/search');
var edit = require('./routes/edit');
var timeline = require('./routes/timeline');
var api = require('./routes/api');
var others = require('./routes/others');
var http = require('http');
var path = require('path');

var app = express();

app.configure(function() {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon(__dirname + '/public/favicon.ico'));
  app.use(express.logger('dev'));
  app.use(express.compress());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session({secret: 'himitsu!', store: new RedisStore(), key: 'express.sid'}));
  app.use(app.router);
  app.use(express['static'](path.join(__dirname, 'public')));
});

app.configure('development', function() {
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/search', search.index);
app.get('/edit', edit.get);
app.post('/edit', edit.post);
app.get('/timeline', timeline.index);
app.all('/api/v1/:job', api.index);
app.get('/robots.txt', others.robots);
app.get('/humans.txt', others.humans);

http.createServer(app).listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});

// Do no stop running
process.on('uncaughtException', function (err) {
  console.error(err);
});
