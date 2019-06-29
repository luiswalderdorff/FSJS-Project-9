'use strict';

// load modules
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require("../models").User;
const authenticate = require("./authenticate");
const bcryptjs = require('bcryptjs');

router.get("/", authenticate, (req,res) => { 
  res.json({
		id: req.currentUser.id,
		firstName: req.currentUser.firstName,
		lastName: req.currentUser.lastName,
		email: req.currentUser.emailAddress
	}).status(200);
});


router.post("/", [
  check("firstName")
    .exists() 
    .withMessage('Please provide a value for "firstName"'),
  check('lastName')
    .exists()
    .withMessage('Please provide a value for "lastName"'),
  check('emailAddress')
    .exists()
    .withMessage('Please provide a value for "emailAddress"')
    .isEmail()
  	.withMessage('Please provide a valid email address for "emailAddress"'),
  check('password')
    .exists()
    .withMessage('Please provide a value for "password"'),
], (req,res,next) => { 
  // Creates a user, sets the Location header to "/", and returns no content
  const errors = validationResult(req);
  // If there are validation errors...
  if (!errors.isEmpty()) {
  	// Use the Array `map()` method to get a list of error messages.
    const errorMessages = errors.array().map(error => error.msg);

    // Return the validation errors to the client.
    res.status(400).json({ errors: errorMessages });
  } else {
  	// Check if there already is a user with the entered emailAdress
  	User.findOne({
  		where: {
  			emailAddress: req.body.emailAddress
  		}
  	}).then(emailExists => {
  		if(emailExists) { // if email exists throw error
  			const err = new Error('That email address is already in use');
				err.status = 400;
				next(err);
  		} else { // if email doesn't exist, create new user
  			// Get the user from the request body
    		const user = {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          emailAddress: req.body.emailAddress,
          password: req.body.password
        };
  			user.password = bcryptjs.hashSync(user.password);
  			// Create User
		    User.create(user).then(() => {
		    	res.location("/").status(201).end();
		    })
		  }
  	})
  }
});

module.exports = router;