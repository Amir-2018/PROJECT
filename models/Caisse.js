const mongoose = require('mongoose');
const bcrypt = require('bcrypt');




const userSchema = new mongoose.Schema({


  DeviceId: {
    type: String,
  },
  Name: {
    type: String,
  },

  Belongsto: {
    type: String,
  },
  Allers : {
    type : String
  },
  long : {
    type : String
  },

  lat: {
    type: String,
  }


});



const Caisse = mongoose.model('caisse', userSchema);

module.exports = Caisse;