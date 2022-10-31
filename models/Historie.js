const mongoose = require('mongoose');
const bcrypt = require('bcrypt');




const userSchema = new mongoose.Schema({



//   Total: {
//     type: String,
//   },
//   date : {
//     type : String
//   },
//   id_caisse:{
//     type : String,
//   },

//   id_caissier:{
//     type:String
//   }

history:[],
id_store : {
    type:  String
},
id : {
    type : String
},


});



const Historie = mongoose.model('hist', userSchema);

module.exports = Historie;