const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');


// Use native promises
mongoose.Promise = global.Promise;
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  }
});


//authenticate input against database documents
UserSchema.statics.authenticate = function(email, password, callback) {
      User.findOne({ email: email })

      .exec(function (error, user) {
        if (error) {
          return callback(error);
        } else if ( !user ) {
          const err = new Error('User not found');
          err.status = 401;
          return callback(err);
        }
        bcrypt.compare(password, user.password, function(error, result) {
          if (result === true) {
            return callback(null, user);
          } else {
            return callback(error);
          }
        });
      });
}

//hash password before saving to database
UserSchema.pre('save', function(next) {
  var user = this;

bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(user.password, salt, null, function(err, hash) {
        // Store hash in your password DB.
        if (err) {
          return next(err);
        }
        user.password = hash;
        next();
    });
  });
});
const User = mongoose.model('User', UserSchema);
module.exports = User;
