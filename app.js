const utils = require("utils");

const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const mongodb = require('mongodb');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const assert = require('assert');
const cors = require('cors');
const app = express();
app.use(cors());

const port = process.env.PORT || 3000;

// Connect to heroku server
var uri = 'mongodb://heroku_fqv9hg2h:ljpbfjlvl10670dslq6qifok6q@ds147265.mlab.com:47265/heroku_fqv9hg2h';

//'mongodb://BradleyJHumble:Buffalo97!:49335/bigdatabase';


mongodb.MongoClient.connect(uri, function(err, db) {
  if(err) throw err;
    db.close(function(err) {
      if(err) throw err;
    });
});


//mongoose connection
var mongoURI = 'mongodb://localhost:27017/sign-up-form';
mongoose.connect(uri);
const db = mongoose.connection;

//mongo error
db.on('error', console.error.bind(console, 'connection error:'));

//use sessions for tracking logins
app.use(
	session({
		secret: 'Bradley Was Here',
		resave: true,
		saveUninitialized: false,
		store: new MongoStore({
			mongooseConnection: db
		})
	})
);

//make user ID available to templates
app.use(function(req, res, next) {
	res.locals.currentUser = req.session.userId;
	next();
});

//parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//serve static files from public/
app.use(express.static(__dirname + '/public'));

//view engine setup
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

//include routes
const routes = require('./routes/index');
app.use('/', routes);

//catch 404 and foward to handler
app.use((req, res, next) => {
	const err = new Error('File Not Found');
	err.status = 404;
	next(err);
});

//error handler
// define as the last app.js callback
app.use((err, req, res, next) => {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});

http.createServer((req, res) => {
  res.statusCode =  200;
  res.setHeader('Content-type', 'text/plain');
  res.end();
});

app.listen(port, () => {
	console.log(`listening on ${port}`);
});
