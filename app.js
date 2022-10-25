const express = require('express');
const mongoose = require('mongoose');
var bodyParser = require('body-parser')
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const {checkUser } = require('./middleware/authMiddleware');
var cors = require('cors')
const app = express();
app.set('view engine', 'ejs');
app.use(cors({
  origin : '*'
}))
app.use(express.static(__dirname + '/public'));

app.use(cookieParser());
// middleware

// database connection

const dbURI = 'mongodb+srv://ilyes:ilyes@cluster0.10vtqfm.mongodb.net/test?retryWrites=true&w=majority';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true })
  .then(
    (result) => {
      if(result)
        console.log('Connected succesfully');
      else
        console.log('not connected');
    })
  .catch((err) => console.log(err));
// routes
app.get('*', checkUser);
//app.get('/smoothies', requireAuth, (req, res) => res.render('smoothies'));
// To get access to the incoming request
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(authRoutes);
const port = process.env.PORT || 4000
app.listen(port,()=>{
    console.log('server is listening on the port '+port +" ...")
})