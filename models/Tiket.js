const mongoose = require('mongoose');
const bcrypt = require('bcrypt');




const userSchema = new mongoose.Schema({



  Total: {
    type: String,
  }



});



const Tiket = mongoose.model('tiket', userSchema);

module.exports = Tiket;