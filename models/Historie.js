const mongoose = require('mongoose');
const bcrypt = require('bcrypt');




const userSchema = new mongoose.Schema({



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