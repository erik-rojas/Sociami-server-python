const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let AdminUserSchema = mongoose.Schema({
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String
    }
});

AdminUserSchema.statics.createUser = function createUser(newUser, callback) {
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(newUser.password, salt, function (err, hash) {
            newUser.password = hash;
            newUser.save(callback);
        });
    });
};

AdminUserSchema.statics.getUserByEmail = function getUserByEmail(email, callback) {
    let Obj = { email: email }
    User.findOne(Obj, callback);
};


AdminUserSchema.methods.comparePassword = function comparePassword(password, callback) {
    bcrypt.compare(password, this.password, callback);
};

AdminUserSchema.statics.getUserById = function (id, callback) {
    User.findById(id, callback);
};

AdminUserSchema.pre('save', function saveHook(next) {
    const user = this;
  
    // proceed further only if the password is modified or the user is new
    if (!user.isModified('password')) return next();
  
  
    return bcrypt.genSalt((saltError, salt) => {
      if (saltError) { return next(saltError); }
  
      return bcrypt.hash(user.password, salt, (hashError, hash) => {
        if (hashError) { return next(hashError); }
  
        // replace a password string with hash value
        user.password = hash;
  
        return next();
      });
    });
  });

module.exports = mongoose.model('AdminUser', AdminUserSchema);