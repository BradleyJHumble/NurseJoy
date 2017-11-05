const express = require('express');
const router = express.Router();
const User = require('../models/user');
const middleware = require('../middleware');



router.get('/', (req, res, next) => {
  return res.render('landing', { title: 'Home' });
});

router.get('/overview', middleware.requiresLogin, (req, res, next) => {
  User.findById(req.session.userId)
      .exec(function (error, user) {
        if (error) {
          return next(error);
        } else {
          return res.render('overview', { title: 'Overview', name: user.name });
        }
      });
});

router.get('/dash/id', middleware.requiresLogin, (req, res, next) => {
          return res.render('dash', { title: 'dash', name: 'bob' });
  
          
});


router.get('/register', middleware.loggedOut, (req, res, next) => {
  return res.render('register', { title: 'Sign Up Today' });
});

router.get('/logout', (req, res, next) => {
  if (req.session) {
    //delete session object
    req.session.destroy(function(err) {
      if(err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

router.get('/login', middleware.loggedOut, (req, res, next) => {
  return res.render('login', { title: 'Log In' });
});

router.post('/login', (req, res, next) => {
  if (req.body.user_email && req.body.user_password) {
    User.authenticate(req.body.user_email, req.body.user_password, function(error, user) {
      if (error || !user) {
        const err = new Error('Wrong email or password');
        err.status =  401;
        return next(err);
      } else {
        req.session.userId = user._id;
        return res.redirect('/overview');
      }
    });
  } else {
    const err =  new Error('Email and password are required');
    err.status = 401;
    return next(err);
  }
});





router.post('/register', (req, res, next) => {
  if (req.body.user_email &&
      req.body.user_name &&
      req.body.user_password ) {
        //confirm that user typed same password twice
        if (req.body.user_password !== req.body.confirm_password) {
          const err = new Error('Passwords do not match.');
          err.status = 400;
          return next(err);
        }
        
        //create object form input
        const userData = {
          email: req.body.user_email,
          name: req.body.user_name,
          password: req.body.user_password
        };

        //use schema create 'method' to insert document into mongodb
        User.create(userData, (error, user) => {
          if (error) {
            return next(error);
          } else {
            req.session.userId = user._id;
            return res.redirect('/overview');
          }
        });

      } else {
        const err = new Error('All fields required.');
        err.status = 400;
        return next(err);
      }
});



module.exports = router;
