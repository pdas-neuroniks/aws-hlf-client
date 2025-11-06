var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config('./.env');
console.log(process.env)

var indexRouter = require('./api/routes/routes');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log(`-- -- -- -- [${ip}] -- -- -- --\ninfo: ${req.method} ${req.url}`);
  if(process.env.NODE_ENV === "development" || process.env.NODE_ENV === "staging"){
    if (req.method == 'POST' || req.method == 'PUT' || req.method == 'DELETE') {
      console.log(`[Body] ${JSON.stringify(req.body)}`);
    }
  }
  res.once('finish', ()=>{console.log(`[Response] ${req.method} ${req.url} ${res.statusCode} ${res.statusMessage}`);});
  next();
});

app.use('/api/bc', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
