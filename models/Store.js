const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

  name: {
    type: String,
  },
  matricule : {
    type : String
  },
  contact: {
    type: String,
  },
  store_owner : {
    type : String
  },
  type : {
    type : String
  },

  position : {
    type: String
  },
 id_admin : {
  type : String
 },
 id_caisse : [String],
 id_caisseier : [String]
});

const Store = mongoose.model('store', userSchema);

module.exports = Store;