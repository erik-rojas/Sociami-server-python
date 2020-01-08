const Routes = require('express').Router();

const APIServicesController = require('../controllers/apiServices');

/********INDEED********/
Routes.get('/indeed/jobs', APIServicesController.get_indeed_jobs);
/**********************/

/********EVENTBRITE********/
Routes.get('/eventbrite/events', APIServicesController.get_eventbrite_events);
/**********************/

/********UDEMY********/
Routes.get('/udemy/courses', APIServicesController.get_udemy_courses);
/**********************/

/********Freelancer********/
Routes.get('/freelancer/gigs', APIServicesController.get_freelancer_gigs);
/**********************/

module.exports = Routes;