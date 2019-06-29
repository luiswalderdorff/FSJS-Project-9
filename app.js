'use strict';

// load modules
const express = require('express');
const app = express();
const morgan = require('morgan');

const models = require("./models");
const sequelize = models.sequelize;

const { User, Course } = models;

const { check, validationResult } = require('express-validator/check');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');
const bodyParser = require('body-parser')

app.use(bodyParser.json()); // Neede for req.body!!!


// Testing the connection to the database
sequelize
  .authenticate()
  .then(() => {
    console.log("Connection with the database was made.");


    // Syncing the models with the database
    return sequelize.sync(); 
  }).catch(err => {
    console.error('Unable to connect to the database:', err);
  });


// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// setup morgan which gives us http request logging
app.use(morgan('dev'));

// Add Routes

const userRoute = require('./routes/users');

const courseRoute = require('./routes/courses');

app.use("/api/users", userRoute);
app.use("/api/courses", courseRoute);



// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
