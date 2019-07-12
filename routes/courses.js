'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');

const { check, validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');
const router = express.Router();
const authenticate = require("./authenticate");
const Course = require("../models").Course;
const User = require("../models").User;

const courseValidation = [
  check('title')
    .exists() 
    .withMessage('Please provide a value for "title"'),
  check('description')
    .exists()
    .withMessage('Please provide a value for "description"'),
];


router.get("/", (req,res) => { //200
  // Returns a list of courses (including the user that owns each course)
  Course.findAll({
    attributes: ["id", "title", "description", "estimatedTime", "materialsNeeded"],
    include: [
    {
      model: User,
      as: "teacher",
      attributes: ["id", "firstName", "lastName", "emailAddress"]
    },
    ],
  }).then(courses => {
    res.json(courses).status(200).end();
  }).catch(err => {
    err.status = 400;
    next(err);
  });
});

router.get("/:id", (req,res,next) => { //200
  // Returns a the course (including the user that owns the course) for the provided course ID
  const currentCourse = req.params;
  Course.findOne({
    where: {
      id: currentCourse.id
    },
    attributes: ["id", "title", "description", "estimatedTime", "materialsNeeded"],
    include: [
    {
      model: User,
      as: "teacher",
      attributes: ["id", "firstName", "lastName", "emailAddress"]
    }],
  }).then(course => {
    if (course) {
      res.json(course).status(200).end();
    } else {
      const err = new Error("This course does not exist");
      res.status(400).json({message: "This course doesn't exist"});
      next(err);
    }
  })
});

router.post("/", [authenticate, courseValidation], (req,res) => { //201
  // Creates a course, sets the Location header to the URI for the course, and returns no content
  const courseInfo = {
    title: req.body.title,
    description: req.body.description,
    estimatedTime: req.body.estimatedTime,
    materialsNeeded: req.body.materialsNeeded
  }; //Why is req.body undefined? Needed body-parser
  const errors = validationResult(req);
  // If there are validation errors... // Maybe write separate function?
  if (!errors.isEmpty()) {
    // Use the Array `map()` method to get a list of error messages.
    const errorMessages = errors.array().map(error => error.msg);

    // Return the validation errors to the client.
    res.status(400).json({ errors: errorMessages });
  } else {
    courseInfo.userId = req.currentUser.id; // Why do I have access to req.currentUser? Because of authenticate.js
    Course.create(courseInfo).then(course => {
      console.log("Your course was successfully created");
      res.location(`/api/courses/${course.id}`).status(201).end();
      console.log(course.id);
    }).catch(err => {
      err.status = 400;
      next(err);
    })
  }
});

router.put("/:id", [authenticate, courseValidation], (req,res, next) => { 
  // Updates a course and returns no content
  const errors = validationResult(req);
  // If there are validation errors...
  if (!errors.isEmpty()) {
  	// Use the Array `map()` method to get a list of error messages.
    const errorMessages = errors.array().map(error => error.msg);

    // Return the validation errors to the client.
    res.status(400).json({ errors: errorMessages });
  } else {
    const newInfo = {
    title: req.body.title,
    description: req.body.description,
    estimatedTime: req.body.estimatedTime,
    materialsNeeded: req.body.materialsNeeded,
    id: req.body.id,
    userId: req.body.userId
  };
    Course.findOne({
      where: {
        id: newInfo.id
      }
    }).then(course => {
      console.log("The UserId is: " + course.userId);
      if(course.userId !== req.currentUser.id) {
        const err = new Error('You are not allowed to edit this course');
        res.json({message: "You are not allowed to edit this course"});
        err.status = 403;
        next(err);
      } else if (course) {
        course.update(newInfo);
      } else {
        const err = new Error('This course does not exist');
        res.json({message: "This course does not exist"});
        err.status = 403;
        next(err);
      }
    }).then(() => {
      console.log("Your course has been edited");
      res.status(204).end();
    }).catch(err => {
      err.status = 400;
      next(err);
    }) 
  }
});

router.delete("/:id", authenticate, (req,res,next) => { 
  //Deletes a course and returns no content
  Course.findByPk(req.params.id)
    .then(course => {
      if (course.userId !== req.currentUser.id) {
        const err = new Error("You can't delete this course");
        err.status = 403;
        next(err);
      } else if (course) {
        course.destroy();
        console.log("Your course has been deleted");
        res.status(204).end();
      } else {
        const err = new Error("This course doesn't exist");
        err.status = 400;
        next(err);
      }
    }).catch(err => {
      err.status = 400;
      next(err);
    })
});

module.exports = router;