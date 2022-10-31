const mongoose = require('mongoose');
const bcrypt = require('bcrypt');




const userSchema = new mongoose.Schema({
  DeviceId: {
    type: String,
  },
  Name: {
    type: String,
  },
  Belongsto : {
    type : String
  },
  allertes :{
    type: String
  },
  Position: {
    type: String,
  },
  long:{
    type : String
  },
  lat:{
    type : String
  },
  id_store:{
    type : String
  },
  state : {
    type : String
  }

});

const Caisse = mongoose.model('caisseP', userSchema);

module.exports = Caisse;