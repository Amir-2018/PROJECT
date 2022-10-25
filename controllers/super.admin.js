const Super_Admin = require("../models/Super_Admin");
const Admin = require("../models/Admin");
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer')
// handle errors


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
  // const { email, password } = req.body;
  // try {
    
  //   const super_admin = await Super_Admin.login(email, password);
  //   const token = createToken(super_admin._id);
  //   res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
  //     Admin.find({}).then(admins =>{
  //       res.render('manage_admins',{admins:admins})
  //       console.log(admins)
  //   })
  // } 
  // catch (err) {
  //     res.render('Login-super')
  // }
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, 'net ninja secret', {
    expiresIn: maxAge
  });
};

  Super_Admin.findOne({email:req.body.email})
  .then(super_admin =>{
    if(super_admin){
      const auth =  bcrypt.compare(req.body.password, super_admin.password);
      auth.then(result =>{
        if(result){
            const token = createToken(super_admin._id);
            res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
              Admin.find({}).then(admins =>{
                res.render('manage_admins',{admins:admins})
                console.log(admins)
            })
        }else{
          Admin.findOne({email:req.body.email})
          .then(admin =>{
            if(admin ){
              const authP =  bcrypt.compare(req.body.password, admin.password);
              authP.then(resultP =>{
                if(resultP){
                  const token = createToken(dmin._id);
                  res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
                  res.redirect('get_store_Page');
                }
              })
            }else{
              res.send('Cannot found the email in table admin')
            }
          })
        }
      })
    }else{
         Admin.findOne({email:req.body.email})
          .then(admin =>{
            if(admin ){
              const authP =  bcrypt.compare(req.body.password, admin.password);
              authP.then(resultP =>{
                if(resultP){
                  const token = createToken(admin._id);
                  res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
                  res.redirect('get_store_Page');
                }
              })
            }else{
              res.send('Cannot found the email in table admin')
            }
          })
    }
   
  })
  .catch(err =>{
    console.log(err)
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
        let super_admin = await Super_Admin.findById(decodedToken.id);
        console.log(super_admin)
        try {
          // Test if email is already exist
          Admin.findOne({email:req.body.email}) 
          .then(find_email =>{
            if(find_email){
              res.status(403).json({
                message : 'Admin is already exist ' 
              })
            }else{
              // email does not exist 
              const admin = new Admin({
                name : req.body.name,
                lastname : req.body.lastname,
                sexe : req.body.sexe,
                age : req.body.age,
                email : req.body.email,
                telephone : req.body.tel,
                pays : req.body.pays,
                email : req.body.email,
                password : req.body.password            
                })
                admin
                .save()
                .then(result =>{
                    
                      const token = createToken(admin._id);
                      res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
                      Admin.find().then(admins=>{
                        res.render('manage_admins',{admins : admins}) 
                      }).catch(err =>{
                        res.status(500).json({
                          message : 'Some Execption occured '+err
                        });
                      })
                                 
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
    })
  }else{
    res.status(400).json({
      message : "You are not authenticated"
    })
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
module.exports.del_inv = (req, res) => {
  Inventaire.remove().then(res=>{
    Store.remove().then(str=>{
    console.log('Deleted all')
  })
  })

}
module.exports.get_login_super_page = (req, res) => {
  res.render('Login-super')
}
module.exports.logout_super = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 });
  res.render('Login-super')
}

