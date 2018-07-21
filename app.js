var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var crypto = require('crypto');
var session = require('express-session');

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var apiRouter = require('./routes/api');

var app = express();

// const sessionSecret = "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";

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret: crypto.randomBytes(8192).toString(), resave: true, saveUninitialized: true, cookie: {secure: false}}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.emessage = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', { user: req.session.user });
});

module.exports = app;
