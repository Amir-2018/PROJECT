const mongoose = require('mongoose');
const bcrypt = require('bcrypt');




const userSchema = new mongoose.Schema({


  name: {
    type: String,
  },
  lastname: {
    type: String,
  },

  age: {
    type: String,
  },
  email : {
    type : String
  },
  telephone : {
    type : String
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
  const admin = await this.findOne({ email });
  if (admin) {
    const auth = await bcrypt.compare(password, admin.password);
    if (auth) {
      return admin;
    }
    throw Error('incorrect password');
  }
  throw Error('incorrect email');
};

const Caissier = mongoose.model('caissier', userSchema);

module.exports = Caissier;