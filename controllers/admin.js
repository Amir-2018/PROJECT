const Admin = require("../models/Admin");
const Inventaire = require("../models/Inventaire");
const Prodcut = require("../models/Product");
const Store = require("../models/Store");
const Caissier = require("../models/Caissier");
const Tiket = require("../models/Tiket");
const jwt = require('jsonwebtoken');
const Caisse = require("../models/Caisse");
// create json web token
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, 'net ninja secret', {
    expiresIn: maxAge
  });
};

module.exports.loginAdmin =async (req, res) => {
    const { email, password } = req.body;
    try {
      const admin = await Admin.login(email, password);
      const token = createToken(admin._id);
      res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
      res.redirect('get_store_Page');
    } 
    catch (err) {
        res.redirect('/get_login_admin')
    }
}
module.exports.get_login_admin =async (req, res) => {
    res.render('login')
}
module.exports.create_store =async (req, res) => {
    // Test if super admin is authenticated 
    const token = req.cookies.jwt;
    if (token) {
      jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
        if (err) {
          res.locals.admin = null;
          res.status(500).json({
            message : "You are not the specified user"
          })
        } else {
          let admin = await Admin.findById(decodedToken.id);
          req.body["id_admin"] = admin._id ; 
          Store.create(req.body)
          .then(store =>{
            req.body["id_admin"] = admin._id ; 
            Inventaire.create({id_store : store._id})
            .then(inventaire =>{
              res.redirect('get_store_page');
            })
            .catch(err =>{
            res.send('Store created Inventaire does not be creted success')
            })
          })
          .catch(err =>{
            res.send('store not created')
          })
        }
      })
    }else{
      res.render('Login')
    }
}

module.exports.add_product_to_inventory =async (req, res) => {
  // Test if super admin is authenticated 
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
      if (err) {
        res.locals.admin = null;
        res.status(500).json({
          message : "You are not the specified user"
        })
      } else {
        let admin = await Admin.findById(decodedToken.id);
        // find store by id 
        Store.findOne({_id: req.params.id})  
        
        .then(store =>{
          console.log(store) 
          // get the inventory specified to that store
          Inventaire.findOne({id_store : store._id})
          .then(inventaire =>{
            Prodcut.create(req.body)
            .then(product =>{
              Inventaire.updateOne(
                { id_store:req.params.id  },
                { $push: { id_products: product._id } }
             )
             .then(result=>{
              
              // Your code here

     Inventaire.findOne({id_store : req.params.id})
            .then(inventaire =>{
              console.log(inventaire)
              var  tab_products = []
          
                for(let i=0;i<inventaire.id_products.length;i++){
                  Prodcut.findOne({_id :inventaire.id_products[i] })
                  .then(product =>{
                    tab_products.push(product)
                    if(i== inventaire.id_products.length-1){
                        // make it into condition
                        // res.render('products',{tab_products: tab_products}) 
                        res.render("products",{tab_products : tab_products,id : req.params.id},)
                    }
                    
                  }).catch(err =>{
                    res.send('exception with products')
                  })
                  
                
              }
              
              
              
              
           
          })
          .catch(err =>{
            res.send('Cannot access to store')
          })



              })
            })
            .catch(err =>{
              res.send('Product not added')
            })
            
          })
          .catch(err =>{
            res.send('cannot access to inventaire')
          })
        })
        .catch(err =>{
          res.send('Cannot access to store')
        })

      }
    })
  }
  else{
    res.render('Login')
  }
}
module.exports.get_products_Page =async (req, res) => {
  
    // Test if super admin is authenticated 
    const token = req.cookies.jwt;
    if (token) {
      jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
        if (err) {
          res.locals.admin = null;
          res.status(500).json({
            message : "You are not the specified user"
          })
        } else {

          
          // find store by id 

            // get the inventory specified to that store
           
            Inventaire.findOne({id_store : req.params.id})
            .then(inventaire =>{
              console.log(inventaire)
              var  tab_products = []
              if(inventaire.id_products.length == 0){
                
                // code here 
                console.log(tab_products)
                  res.render('products',{tab_products:tab_products,id:req.params.id})
                ////////////



              }else{
                for(let i=0;i<inventaire.id_products.length;i++){
                  Prodcut.findOne({_id :inventaire.id_products[i] })
                  .then(product =>{
                    tab_products.push(product)
                    if(i== inventaire.id_products.length-1){
                        // make it into condition
                        // res.render('products',{tab_products: tab_products}) 
                        res.render("products",{tab_products : tab_products,id : req.params.id},)
                    }
                    
                  }).catch(err =>{
                    res.send('exception with products')
                  })
                  
                }
              }
              
              
              
              
           
          })
          .catch(err =>{
            res.send('Cannot access to store')
          })
  
        }
      })
    }
    else{ 
      res.render('Login')
    }
    
}

module.exports.get_store_Page =async (req, res) => {
    // Test if super admin is authenticated 
    const token = req.cookies.jwt;
    if (token) {
      jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
        if (err) {
          res.locals.admin = null;
          res.render('Login')
        } else {
          let admin = await Admin.findById(decodedToken.id);
          
          // find store by id 
          Store.find({id_admin: admin._id})    
          .then(store =>{
            res.render('store',{store : store})
            
          })
          .catch(err =>{
            res.render('Login')
          })
  
        }
      })
    }
    else{ 
      res.render('Login')
    }
}


module.exports.get_inventory_Page =async (req, res) => {
  // Test if super admin is authenticated 
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
      if (err) {
        res.locals.admin = null;
        res.render('Login')
      } else {
        let admin = await Admin.findById(decodedToken.id);
        
        // find store by id 
        Store.find({id_admin: admin._id})    
        .then(store =>{
          res.render('inventory',{store : store})
          
        })
        .catch(err =>{
          res.render('Login')
        })

      }
    })
  }
  else{ 
    res.render('Login')
  }
}



module.exports.manage_admins =async (req, res) => {
  Admin.find({}).then(admins =>{
    res.render('manage_admins')
  })
  .catch(err =>{
    res.send('cannot found admin')
  })
}

module.exports.delete_store =async (req, res) => {
  
  
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
      if (err) {
        res.locals.admin = null;
        res.status(500).json({
          message : "You are not the specified user"
        })
      } else {
        let admin = await Admin.findById(decodedToken.id);
        
        // find store by id 
        Store.deleteOne({_id :req.params.id}).
        then(delres =>{
          Store.find({id_admin: admin._id})    
          .then(store =>{
            res.render('store',{store : store})
            
          })
          .catch(err =>{
            res.send('Cannot access to store')
          })
        })
        .catch(err=>{
          res.send('Error')
        })


      }
    })
  }
  else{ 
    res.send('You are not authenticated')
  }


}
module.exports.get_update_store =async (req, res) => {
  Store.findOne({_id : req.params.id}).then(store =>{

    res.render('update_store',{store : store})
  }).catch(err =>{
    res.send('Some error occured')
  })
}
module.exports.update_store =async (req, res) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
      if (err) {
        res.locals.admin = null;
        res.status(500).json({
          message : "You are not the specified user"
        })
      } else {
        let admin = await Admin.findById(decodedToken.id);
        Store.updateOne({_id:req.params.id},
          { $set: {
           name:req.body.name,
           contact : req.body.contact,
           store_owner : req.body.store_owner,
           position : req.body.position,
      
      
         }}).then(result=>{  
           Store.find({id_admin : admin._id}).then(store =>{
             res.render('store',{store : store})
           }).catch(err =>{
             console.log(err)
           })
           
         }).catch(err =>{
           res.send('Some exception occured')
         })
      }
    })
  }


}

module.exports.get_update_products =async (req, res) => {
  Prodcut.findOne({_id : req.params.id}).then(product =>{

    res.render('update_products',{product : product})
  }).catch(err =>{
    res.send('Some error occured')
  })
}
module.exports.post_update_products =async (req, res) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
      if (err) {
        res.locals.admin = null;
        res.status(500).json({
          message : "You are not the specified user"
        })
      } else {
        let admin = await Admin.findById(decodedToken.id);
        Prodcut.updateOne({_id:req.params.id},
          { $set: {
           product_code:req.body.product_code,
           product_name : req.body.product_name,
           product_buying_price  :req.body.product_buying_price ,
           product_category :req.body.product_category,
          

         }}).then(result=>{ 
          Inventaire.find({}).then(inv =>{
            for(let i = 0;i<inv.length;i++){
              for(let j = 0;j<inv[i].id_products.length;j++){
                if(inv[i].id_products[j]== req.params.id){
                  /******************************************************/
                  tab_products = []
                  for(let k=0;k<inv[i].id_products.length;k++){
                    Prodcut.findOne({_id :inv[i].id_products[k] })
                    .then(product =>{
                      if(product)
                        tab_products.push(product)
                      if(k== inv[i].id_products.length-1){
                          // make it into condition
                          // res.render('products',{tab_products: tab_products}) 
                          res.render("products",{tab_products : tab_products,id : req.params.id},)
                         
                      }
                      
                    }).catch(err =>{
                      res.send('exception with products')
                    })                    
                }
                  /******************************************************/
                }
              }
            }
          }).catch(err =>{
            res.send(err)
          })
           
         }).catch(err =>{
           console.log(err)
         })
      }
    })
  }
}
module.exports.post_delete_products =async (req, res) => {
  res.send('to delete post')
}


module.exports.get_delete_products =async (req, res) => {
res.send('I will delete it')

}
module.exports.get_caissier =async (req, res) => {
 Caissier.find({}).then(caissiers =>{
  res.render('caissiers',{caissiers:caissiers})
 }) 
 .catch(err =>{
  res.render('Failed to get all caissiers')
 })
  
}
module.exports.addCaissier =async (req, res) => {
  Caissier.create(req.body).then(caissier=>{
    Caissier.find({}).then(caissiers =>{
      res.render('caissiers',{caissiers:caissiers})
     }).catch(err =>{
      res.send('there is some exception')
    })
  })
  .catch(err =>{
    res.send('there is some exception')
  })
   
 }
 module.exports.get_dash_data =async (req, res) => {
  Caissier.find({})
  .then(caissiers =>{
    Tiket.find({})
    .then(tikets=>{
      Caisse.find({})
      .then(caisse=>{

          res.render('caisses',{
            caissiers:caissiers,
            tikets : tikets.length,
            caisse : caisse,
            nbcompte : caissiers.length
          })
      }).catch(caisse=>{
        res.send('Cannot get caisses')
      })

    }).catch(err =>{
    res.send('Cannot get tikets')
  })

  })
  .catch(err =>{
    res.send('Cannot get caissiers')
  })
 }
