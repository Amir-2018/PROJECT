const Super_Admin = require("../models/Super_Admin");
const Admin = require("../models/Admin");
const Prodcut = require("../models/Product");
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer')
const fs = require('fs');
const path = require('path');
// Dependencie to upload photo 
const multer = require('multer');
// create json web token
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, 'net ninja secret', {
    expiresIn: maxAge
  });
};

// Save user to the database
module.exports.signup_post = async (req, res) => {
  try {
    // Test if email is already exist
    Super_Admin.findOne({email:req.body.email})
    .then(find_email =>{
      if(find_email){
        res.status(403).json({
          message : 'Email is already exist '
        })
      }else{
        // email does not exist 
        const super_admin = new Super_Admin({
          full_name : req.body.fullname,
          email : req.body.email,
          password : req.body.password,                
          })
          super_admin
          .save()
          .then(result =>{
              
                const token = createToken(super_admin._id);
                res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
                res.render('login_super_admin')
          })
          // Exception server
          .catch(err =>{
                  res.status(500).json({
                    message : 'Some Execption occured '+err
                  });
          })
      }
    })
       // Exception server
  }catch(err) {
        res.status(500).json({
          message : 'Exception occured with registration form module'+err
        });
  }
  
}
const bcrypt = require('bcrypt');

module.exports.login_post = async (req, res) => {


  Super_Admin.findOne({email:req.body.email})
  .then(super_admin =>{ 
    if(super_admin !=null){
      const auth =  bcrypt.compare(req.body.password, super_admin.password);
      auth.then((search_super) =>{
            if(search_super){
              const token = createToken(super_admin._id);
              res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
                Admin.find({}).then(admins =>{
                  res.render('manage_admins',{admins:admins,super_admin : super_admin})
              })
            }else
              res.send('Password of super is incorrect');           
      })
    }else{
           Admin.findOne({email:req.body.email})
          .then(admin =>{
            if(admin!=null){
              const authP =  bcrypt.compare(req.body.password, admin.password);
              authP.then(resultP =>{
                if(resultP){
                  const token = createToken(admin._id); 
                  res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
                  
                  res.redirect("/get_store_Page");
                    
                  
                }else{
                  res.send('Incorrect password for admin')
                }
              })
            }else{
              res.send('You didnt have an account please create one ')
            }
          })
        
        }

      }).catch(err=>{
        res.send('search to admin') ; 
      })
    }


  





module.exports.logout_get = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 });
  res.render('Login')
}

module.exports.testKey = (req, res) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
      if (err) {
        res.locals.super_admin = null;
        res.status(500).json({
          message : "You are not the specified user"
        })
      } else {
        let super_admin = await Super_Admin.findById(decodedToken.id);
        res.status(200).json({
          message : {
            id : super_admin._id,
            email : super_admin.email
          }
        })
      }
    })
  }else{
    res.status(500).json({
      message : "You are not authenticated"
    })
  }


}

const Storage = multer.diskStorage({
  destination: './public',
  filename: function (req, file, cb) {
  //originalename Name of the file on the user’s computer
    cb(null, file.originalname );
  }
})
//   const uploadFilter = function(req, file, cb) {
  // filter rules here
// }
const upload = multer({
  storage : Storage,
  limits: {
      fileSize: 5000000,
    },
  //   fileFilter: uploadFilter
}).single('image') 

module.exports.createAdmin = (req, res) => {
  // Test if super admin is authenticated 
 
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
      if (err) {
        res.locals.super_admin = null;
        res.status(500).json({
          message : "You are not the specified user"
        })
      } else {
        // Test image size to not depass 5 M
        upload(req,res,(err)=>{
          if(err){
              if(err.code == 'LIMIT_FILE_SIZE'){
                  res.status(500).json({
                      message : "Image size is over than 5MB"
                  })   
              }
                
          }
          // image is less than 5M then now upload is unable 
          else{
            if(req.file == undefined){
              res.send('Please put an image');
            }
            else{
              const str = req.file.originalname;
              const slug = str.split('.').pop();
              if(slug =='jpg' || slug =='png' || slug =='jpeg' || slug =='gif'|| slug =='bmp' ){
                Admin.findOne({email:req.body.email})
                .then(admin_find=>{
                  if(admin_find !=null){
                    res.send('You already have an account')
                  }else{
                    // Test if email is owned to super admin
                    Super_Admin.findOne({email:req.body.email})
                    .then(super_find=>{
                      if(super_find !=null){
                        res.send('Email already exist')
                      }else{
                          // create user object 
                      const admin = new Admin({
                        name : req.body.name,
                        lastname : req.body.lastname,
                        email : req.body.email,
                        telephone : req.body.tel,
                        password : req.body.password, 
                        img:{
                          data : req.file.filename,
                          contentType : 'image/png'
                        }
          
                      })
                    
                      admin.save().then(result =>{
                        if(result){
                          Admin.find({}).then(admins=>{
                          res.render('manage_admins',{admins:admins})
                          })
                        }else{
                          res.status(500).json({
                              message : "Image not Uploaded ... "
                          })
                        }
                
                        }).catch(err =>{
                             console.log(err)
                        })
                      }
                    }).catch(err=>{
                      console.log(err) ; 
                    })
                    
                  } 
                  
                })
              }// File is not an image
              else{
                  res.status(500).json({
                      message : 'Only image are accepted '
                  })
              }
            }
              
            
              

              
            
          }// image is more than 5M
      })
      }
    })
  }else{
    res.render('Login-super')
  }

}

module.exports.super_admin_page = (req, res) => {
  res.render('super_admin')
}
module.exports.get_login_page = (req, res) => {
  res.render('login_super_admin')
}
module.exports.get_page_admin = (req, res) => {
  Admin.find().then(admins=>{
    res.render('manage_admins',{admins : admins}) 
  }).catch(err =>{
    res.status(500).json({
      message : 'Some Execption occured '+err
    });
  })
}
module.exports.get_create_admin = (req, res) => {
  res.render('create_admin')
}






module.exports.delete_admins =async (req, res) => {
  Admin.deleteOne({ _id: req.params.id })
  .then(result =>{
    Admin.find({}).then(admins =>{
      res.render('manage_admins',{admins : admins})
    })
    
  })
  .catch(err =>{
    res.send('Admin not deleted')
  })
}

module.exports.get_update_admins = (req, res) => {


        Admin.findOne({_id : req.params.id}).then(admin =>{

        res.render('update_admin',{admin : admin})
      }).catch(err =>{
        res.send('Some error occured')
      })
  

}


module.exports.update_admins = (req, res) => {
  Admin.updateOne({_id:req.params.id},
     { $set: {
      name:req.body.name,
      lastname : req.body.lastname,
      age : req.body.age,
      email : req.body.email,
      telephone : req.body.telephone,
      password : req.body.password

    }}).then(result=>{  
      Admin.find({}).then(admins =>{
        res.render('manage_admins',{admins : admins})
        
      }).catch(err =>{
        console.log(err)
      })
      
    }).catch(err =>{
      res.send('Some exception occured')
    })

  

}


const Inventaire = require("../models/Inventaire");
const Store = require("../models/Store");
const Caisse = require("../models/Caisse");
 module.exports.del_inv = (req, res) => {
  // Inventaire.remove().then(res=>{
  //   Store.remove().then(str=>{
  //   console.log('Deleted all')
  // })
  // })
  Caisse.remove().then(res=>{ console.log('deleted all')  })
 }

module.exports.get_login_super_page = (req, res) => {
  res.render('Login-super')
}
module.exports.logout_super = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 });
  res.render('Login-super')
}




module.exports.delete_multiple_admins = (req, res) => {
    var count = 0 ; 
    for(let i=0;i<req.body.length;i++){

      Admin.deleteOne({_id : req.body[i]})
      .then(result=>{
        count ++
        if(count == req.body.length ){
          res.redirect("/manage_admins_For_Delete")
        }
      })
        
    }
   
}