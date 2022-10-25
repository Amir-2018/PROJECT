const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({

  full_name: {
    type: String,
  },
  email: {
    type: String,
    required: [true, 'Please enter an email'],
  },

  password: {
    type: String,
  }

});


// fire a function before doc saved to db
userSchema.pre('save', async function(next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// static method to login user
userSchema.statics.login = async function(email, password) {
  const super_admin = await this.findOne({ email });
  if (super_admin) {
    const auth = await bcrypt.compare(password, super_admin.password);
    if (auth) {
      return super_admin;
    }
    throw Error('incorrect password');
  }
  throw Error('incorrect email');
};

const Super_Admin = mongoose.model('super_admin', userSchema);

module.exports = Super_Admin;
