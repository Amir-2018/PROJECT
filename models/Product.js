const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

  product_code: {
    type: String,
  },
  product_name: {
    type: String,
  },
  product_category : {
    type : String
  },
  product_selling_price : {
    type : String
  },
  product_buying_price : {
    type : String
  },
  id_store : {
    type : String
  }


});

const Prod = mongoose.model('prod', userSchema);

module.exports = Prod;