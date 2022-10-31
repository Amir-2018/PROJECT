const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

  id_products:[String],
  id_store : {
    type : String
  }


});

const Inventaire = mongoose.model('inventaire', userSchema);

module.exports = Inventaire;