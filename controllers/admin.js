const Admin = require("../models/Admin");
const Inventaire = require("../models/Inventaire");
const Prodcut = require("../models/Product");
const Store = require("../models/Store");
const Caissier = require("../models/Caissier");
const Tiket = require("../models/Tiket");
const jwt = require('jsonwebtoken');
const Caisse = require("../models/Caisse");
const Product = require("../models/Product");
const Historie = require("../models/Historie");
const mongoose = require('mongoose');
const sessionStorage = require('sessionstorage-for-nodejs');

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
const session = require('express-session');
const flash = require('connect-flash');
module.exports.create_store =async (req, res) => {
  
  var tab = (req.body.position).split(',');
  req.body["long"] = tab[0] ;
  req.body["lat"]= tab[1] ; 
    //Test if super admin is authenticated 
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
          req.body["actif_hours"] = 0 ; 
          
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
            req.body["id_store"] = store._id ; 
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
                        res.render("products",{tab_products : tab_products,id : req.params.id,admin:admin,store:store},)
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

          let admin = await Admin.findById(decodedToken.id);

          // find store by id 

            // get the inventory specified to that store
           
            Inventaire.findOne({id_store : req.params.id})
            .then(inventaire =>{
              console.log(inventaire)
              var  tab_products = []
              if(inventaire.id_products.length == 0){
                Store.findOne({_id: inventaire.id_store}).then(store =>{
                  res.render('products',{tab_products:tab_products,id:req.params.id,store : store,admin:admin})
                })
                // code here 
               
                  
                ////////////



              }else{
                for(let i=0;i<inventaire.id_products.length;i++){
                  Prodcut.findOne({_id :inventaire.id_products[i] })
                  .then(product =>{
                    tab_products.push(product)
                    if(i== inventaire.id_products.length-1){
                        // make it into condition
                        // res.render('products',{tab_products: tab_products}) 
                        Store.findOne({_id: inventaire.id_store}).then(store =>{
                          res.render("products",{tab_products : tab_products,id : req.params.id,admin:admin,store:store},)
                        })
                        
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

module.exports.get_caisse_info =async (req, res) => {
        // Test if super admin is authenticated 
        const token = req.cookies.jwt;
        if (token) {
          jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
            if (err) {
              res.locals.admin = null;
              res.render('Login')
            } else {
              let admin = await Admin.findById(decodedToken.id);
              const {page = 1,limit = 9} = req.query ;
              // find store by id 
              Store.find({id_admin: admin._id})
              .limit(limit *1)
              .skip((page -1)*limit) 
              .then(store =>{
                res.render('store_for_caisse',{store : store,admin : admin})
                
              })
              .catch(err =>{
                res.render('Login-super')
              })
      
            }
          })
        }
        else{ 
          res.render('Login-super')
        }
}

module.exports.get_store_for_caissiers =async (req, res) => {
        // Test if super admin is authenticated 
        const token = req.cookies.jwt;
        if (token) {
          jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
            if (err) {
              res.locals.admin = null;
              res.render('Login')
            } else {
              let admin = await Admin.findById(decodedToken.id);
              const {page = 1,limit = 9} = req.query ;
              // find store by id 
              Store.find({id_admin: admin._id})
              .limit(limit *1)
              .skip((page -1)*limit) 
              .then(store =>{
                res.render('store_for_caissier',{store : store,admin : admin})
                
              })
              .catch(err =>{
                res.render('Login-super')
              })
      
            }
          })
        }
        else{ 
          res.render('Login-super')
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
          const {page = 1,limit = 9} = req.query ;
          // find store by id 
          Store.find({id_admin: admin._id})
          .limit(limit *1)
          .skip((page -1)*limit) 
          .then(store =>{
            res.render('store',{store : store,admin : admin})
            
          })
          .catch(err =>{
            res.render('Login-super')
          })
  
        }
      })
    }
    else{ 
      res.render('Login-super')
    }
}


module.exports.get_caisses_Page =async (req, res) => {
    
    const token = req.cookies.jwt;
    if (token) {
      jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
        if (err) {
          res.locals.admin = null;
          res.render('Login-super')
        } else{
        let admin = await Admin.findById(decodedToken.id);
        Store.findOne({_id :  mongoose.Types.ObjectId(req.params.id)})

        .then(store =>{
          var caisses = []
          if(store.id_caisse.length == 0)
                res.render('crud_caisses',{store :store ,caisses : caisses,admin:admin})
          else {
            for (let i=0;i<store.id_caisse.length;i++){
              Caisse.findOne({_id :store.id_caisse[i]})
              .then(caisse=>{
                caisses.push(caisse);
                if(i==store.id_caisse.length -1)
                  res.render('crud_caisses',{store :store ,caisses : caisses,admin:admin})
              })
            }
          }
         
          
          
        })
        .catch(err =>{
          res.render('Login-super')
        })
      }
    })
      
  }else
      res.render('Login-super')
    
}
module.exports.create_caisse =async (req, res) => {
    
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
      if (err) {
        res.locals.admin = null;
        res.render('Login')
      } else{
      let admin = await Admin.findById(decodedToken.id);
      Store.findOne({_id: mongoose.Types.ObjectId(req.params.id)})

      .then(store =>{
      var tab = (req.body.position).split(',');
      req.body["long"] = tab[0] ;
      req.body["lat"]= tab[1] ; 
       req.body["id_store"] = store._id;
       req.body["state"] = "OFF"
       Caisse.create(req.body)
       .then(created_caisse=>{
          Store.updateOne(
             { _id:store._id  },
             { $push: { id_caisse: created_caisse._id } }
          ).then(up=>{
            res.redirect('/get_caisses_Page/'+store._id);
          })
       .catch(err=>{
        console.log(err)
       })
       }).catch(err=>{
        console.log('Cannot create caisse')
       })
        
      })
      .catch(err =>{
        res.render('Login')
      })
    }
  })
    
}else
    res.render('Login-super')
  
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
          res.render('inventory',{store : store,admin : admin})
          
        })
        .catch(err =>{
          res.render('Login')
        })

      }
    })
  }
  else{ 
    res.render('Login-super')
  }
}



module.exports.manage_admins =async (req, res) => {
  const {page = 1,limit = 9} = req.query ;
  Admin.find({})
  .limit(limit *1)
  .skip((page -1)*limit) 
  .then(admins =>{
    res.render('manage_admins')
  })
  .catch(err =>{
    res.send('cannot found admin')
  })
}
module.exports.manage_admins_For_Delete =async (req, res) => {
  const {page = 1,limit = 9} = req.query ;
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
        Super_Admin.findOne({email : super_admin.email})
        .then(sup_admin=>{
          if(sup_admin!=null){
              Admin.find({})
              .limit(limit *1)
              .skip((page -1)*limit)
              .then(admins =>{
                res.render('manage_admins',{admins:admins,super_admin : sup_admin})
              })
              .catch(err =>{
                res.send('cannot found admin')
              })
          }
        })
      }
    })
  }

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
            res.render('store',{store : store,admin : admin})
            
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
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
      if (err) {
  
          res.render('Login-super')

      } else {
        let admin = await Admin.findById(decodedToken.id);
        Store.findOne({_id : req.params.id}).then(store =>{
      
          res.render('update_store',{store : store,admin:admin})
        }).catch(err =>{
          res.send('Some error occured')
        })
      }
    })
  }else{
    res.render('Login-super')
  }
       
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
             res.render('store',{store : store,admin:admin})
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
  const token = req.cookies.jwt;

  jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
    if (err) {
      res.locals.admin = null;
      res.render('Login-super')
    } else {
      let admin = await Admin.findById(decodedToken.id);
      Store.findOne({id_admin : admin._id}).then(store =>{
        
        Prodcut.findOne({_id :  mongoose.Types.ObjectId(req.params.id)}).then(product =>{
  
          res.render('update_products',{product : product,admin : admin,store : store})
        }).catch(err =>{
          res.send('Some error occured')
        })

      })

    }
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
                          Store.findOne({id_admin : admin._id}).then(store =>{
                            res.render("products",{tab_products : tab_products,id : req.params.id,admin : admin,store : store},)
                          })
                          
                         
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
const { ObjectId } = require('mongodb');
const Super_Admin = require("../models/Super_Admin");

module.exports.get_delete_products =async (req, res) => {
  

  const token = req.cookies.jwt;
  const id = req.params.id ; 
  if (token) {
    jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
      if (err) {
        res.locals.admin = null;
        res.status(500).json({
          message : "You are not the specified user"
        })
      } else {
        let admin = await Admin.findById(decodedToken.id);
       
        
        Prodcut.findOne({_id :  mongoose.Types.ObjectId(req.params.id)})
        .then(product =>{
          Store.findOne({_id : product.id_store})
          .then(store =>{
            Inventaire.findOne({id_store : product.id_store})
            .then(inventaire =>{
              Inventaire.updateOne(
                { id_store : product.id_store},
                { $pull: { "id_products":req.params.id}})
              .then(del=>{
                console.log(del)
              })
              res.redirect('/get_products_Page/'+store._id);

            console.log("inv = "+inventaire)
            
          }) 
        })
      })
      

      }
    })
  }else{
    res.render('Login-super')
  }

}

module.exports.delete_multiple_caissiers =async (req, res) => {
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
          Store.findOne({id_caisseier: { $in: [req.body[0]] }})
          .then(store=>{
            for(let i=0;i<store.id_caisseier.length;i++){

              Store.updateOne(
                { _id : store._id},
                { $pull: { "id_caisseier":req.body[i]}})
              .then(del=>{
                console.log('Deleted')  
                
              })
                                 
            }
            
            Store.findOne({_id :store._id}).then(
              store=>{
                // res.redirect('/get_products_Page/'+store._id);
              
                res.send(store._id)
              }
            )
          }).catch(err=>{
            console.log('cannot find store')
          })
         
            
          
          
          // for(let i=0;i<req.body.length ;i++){
          //    console.log(req.body[i])
          // }
    }
    })
    }else
      res.render('Login-super') 
}
module.exports.get_delete_caissiers =async (req, res) => {
  const token = req.cookies.jwt;
  const id = req.params.id ; 
  if (token) {
    jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
      if (err) {
        res.locals.admin = null;
        res.status(500).json({
          message : "You are not the specified user"
        })
      } else {
        let admin = await Admin.findById(decodedToken.id);
        Store.findOne({id_caisseier: { $in: mongoose.Types.ObjectId(req.params.id) }})
        // Caissier.findOne({_id :  mongoose.Types.ObjectId(req.params.id)})
        .then(store =>{
 
              Store.updateOne(
                { _id : store._id},
                { $pull: { "id_caisseier":req.params.id}})
              .then(del=>{
                res.redirect('/get_caissier/'+store._id);
              })
                        
             
          
        
      })
      

      }
    })
  }else{
    res.render('Login-super')
  }
}
module.exports.get_delete_caisses =async (req, res) => {
  

  const token = req.cookies.jwt;
  const id = req.params.id ; 
  if (token) {
    jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
      if (err) {
        res.locals.admin = null;
        res.status(500).json({
          message : "You are not the specified user"
        })
      } else {
        let admin = await Admin.findById(decodedToken.id);
       
        
        Caisse.findOne({_id :  mongoose.Types.ObjectId(req.params.id)})
        .then(caisse =>{
          Store.findOne({_id : caisse.id_store})
          .then(store =>{
              Store.updateOne(
                { _id : caisse.id_store},
                { $pull: { "id_caisse":req.params.id}})
              .then(del=>{
                res.redirect('/get_caisses_Page/'+store._id);
              })
                          
          
        })
      })
      

      }
    })
  }else{
    res.render('Login-super')
  }

}


module.exports.delete_multiple_products = (req, res) => {
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
          
          Inventaire.findOne({id_products: { $in: [ req.body[0], req.body[1] ] }})
          .then(inventaire =>{
            var count = 0 ; 
            for(let i=0;i<req.body.length;i++){

              Inventaire.updateOne(
                { _id : inventaire._id},
                { $pull: { "id_products":req.body[i]}})
              .then(del=>{
                console.log('Deleted')  
                
              })
                                 
            }
            Store.findOne({_id : inventaire.id_store}).then(
              store=>{
                // res.redirect('/get_products_Page/'+store._id);
              
                res.send(store._id)
              }
            )
          })
          
          // for(let i=0;i<req.body.length ;i++){
          //    console.log(req.body[i])
          // }
    }
    })
    }else
      res.render('Login-super')    
 }
 
 module.exports.delete_multiple_caisses = (req, res) => {
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
          
          Store.findOne({id_caisse: { $in: [ req.body[0], req.body[1] ] }})
          .then(store =>{
            console.log(store)
            var count = 0 ; 
            for(let i=0;i<req.body.length;i++){
              console.log(store)
              Store.updateOne(
                { _id : store._id},
                { $pull: { "id_caisse":req.body[i]}})
              .then(del=>{
                console.log('Deleted')  
                
              })
                                 
            }
            Store.findOne({_id : store._id}).then(
              store=>{
                // res.redirect('/get_products_Page/'+store._id);
              
                res.send(store._id)
              }
            )
          })
          
          // for(let i=0;i<req.body.length ;i++){
          //    console.log(req.body[i])
          // }
    }
    })
    }else
      res.send('Login-super')    
 }



module.exports.get_caissier =async (req, res) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
      if (err) {
        res.locals.admin = null;
        res.render('Login-super')
      } else{
      let admin = await Admin.findById(decodedToken.id);
      Store.findOne({_id: mongoose.Types.ObjectId(req.params.id)})
       
      .then(store =>{
       
        var caissiers = []
        if(store.id_caisseier.length == 0)
              res.render('caissiers',{caissiers :[],admin:admin,store:store})
        else {
          for (let i=0;i<store.id_caisseier.length;i++){
            Caissier.findOne({_id :store.id_caisseier[i]})
            .then(caisse=>{
              caissiers.push(caisse);
              if(i==store.id_caisseier.length -1)
                res.render('caissiers',{caissiers :caissiers ,admin:admin,store:store})
            })
          }
        }
      })
   
       
       
        
        
  
    }
  })
    
}else
    res.render('Login-super')
  
}



module.exports.addCaissier =async (req, res) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
      if (err) {
        res.locals.admin = null;
        res.render('Login-super')
      } else{
      let admin = await Admin.findById(decodedToken.id);
      Store.findOne({_id: mongoose.Types.ObjectId(req.params.id)})

      .then(store =>{
        console.log("store"+store)
        req.body["id_store"] = store._id;
        Caissier.create(req.body)
        .then(created_caissier=>{
           Store.updateOne(
              { _id:store._id  },
              { $push: { id_caisseier: created_caissier._id } }
           ).then(up=>{
            res.redirect('/get_caissier/'+store._id)
           })
        .catch(err=>{
         console.log(err)
        })
        }).catch(err=>{
         console.log('Cannot create caissier')
        })
      })
       
      
        
      // })
      .catch(err =>{
        res.send('Login-super')
      })
    }
  })
    
}else
    res.send('Login-super')
   
 }
 module.exports.get_dash_data =async (req, res) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
      if (err) {
        res.locals.admin = null;
        res.render('Login-super')
      } else{
      let admin = await Admin.findById(decodedToken.id);

      Store.findOne({_id :  mongoose.Types.ObjectId(req.params.id)})
      .then(store =>{
        len_caisse = store.id_caisse.length  ; 
        len_caisseier = store.id_caisseier.length  ; 
        len_history = store.id_history.length  ; 
        var caisses = [] ; 
        var caissiers = []
        if(len_caisse ==0 && len_caisseier==0 && len_history == 0){
          res.render('caisses',{store :store ,caisses : [],caissiers : [],admin:admin,nbcomptes : 0,som : 0  ,tiket :0 ,actif_hours : 0})
        }else if(len_caisse !=0 && len_caisseier !=0 && len_history !=0){
          
            // if all exist
            // search for caisseiers
              for (let i=0;i<store.id_caisseier.length;i++){
                  Caissier.findOne({_id :store.id_caisseier[i]})
                  .then(caissier=>{
                    caissiers.push(caissier);
                  })
                  if(i == store.id_caisseier.length-1){
                    for (let i=0;i<store.id_caisse.length;i++){
                      Caisse.findOne({_id :store.id_caisse[i]})
                      .then(caisse=>{
                        caisses.push(caisse)
                        if(i == store.id_caisse.length-1){
                          var som = 0 ;
                          for (let j=0;j<store.id_history.length;j++){
                            Historie.findOne({_id :store.id_history[j]})
                            .then(history=>{
                               
                                for (let k=0;k<history.history.length;k++){
                                  som +=  parseInt(history.history[k].total)  ;
                                  if(k == history.history.length-1)
                                      res.render('caisses',{store :store ,caisses : caisses,caissiers : caissiers,admin:admin,nbcomptes : store.id_caisseier.length,som : som,tiket :history.history.length,actif_hours : 0 }) 
      
                                }
                                          
                            })
                          }
                        }
                    })
                  }
                    
                }
              }// find all caissiers
              // inventory does not exist
          }else if(len_caisseier !=0 && len_history ==0 && len_caisse == 0){
            for (let i=0;i<store.id_caisseier.length;i++){
                Caissier.findOne({_id :store.id_caisseier[i]})
                .then(caissier=>{
                  caissiers.push(caissier);
                  if(i == store.id_caisseier.length-1){

                          res.render('caisses',{store :store ,caisses : caisses,caissiers : caissiers,admin:admin,nbcomptes : caissiers.length,som : 0  ,tiket :0,actif_hours : 0 })
    
                      
                     
                    }
                  })
                }
                
               
          }// find all caissiers
            // res.render('caisses',{store :store ,caisses : caisses,caissiers : [],admin:admin,nbcomptes : 0,som : 0  ,tiket :0 })
          else if(len_caisse !=0 && len_history ==0 && len_caisseier ==0){
            for(let j = 0;j<store.id_caisse.length;j++){
                  Caisse.findOne({_id :store.id_caisse[j]})
                  .then(caisse=>{
                    caisses.push(caisse)
                    if(j == store.id_caisse.length-1){  
                         res.render('caisses',{store :store ,caisses : caisses,caissiers : [],admin:admin,nbcomptes : 0,som : 0  ,tiket :0,actif_hours : 0 })

                    }
                  })
           
            }
          }
          else if(len_caisse !=0 && len_caisseier !=0 && len_history ==0){
           // if all exist
            // search for caisseiers
            for (let i=0;i<store.id_caisseier.length;i++){
              Caissier.findOne({_id :store.id_caisseier[i]})
              .then(caissier=>{
                caissiers.push(caissier);
              })
              if(i == store.id_caisseier.length-1){
                for (let i=0;i<store.id_caisse.length;i++){
                  Caisse.findOne({_id :store.id_caisse[i]})
                  .then(caisse=>{
                    caisses.push(caisse)
                    if(i == store.id_caisse.length-1)
                       res.render('caisses',{store :store ,caisses : caisses,caissiers : caissiers,admin:admin,nbcomptes : store.id_caisseier.length,som : 0,tiket :0 ,actif_hours : 0})                           
                })
              }
                
            }
          }
          }
          else if(len_caisse ==0 && len_caisseier !=0 && len_history !=0){
            // if all exist
             // search for caisseiers
             for (let i=0;i<store.id_caisseier.length;i++){
               Caissier.findOne({_id :store.id_caisseier[i]})
               .then(caissier=>{
                 caissiers.push(caissier);
               })
               if(i == store.id_caisseier.length-1){
            
                  var som = 0 ;
                  for (let j=0;j<store.id_history.length;j++){
                    Historie.findOne({_id :store.id_history[j]})
                    .then(history=>{
                       
                        for (let k=0;k<history.history.length;k++){
                          som +=  parseInt(history.history[k].total)  ;
                          if(k == history.history.length-1)
                              res.render('caisses',{store :store ,caisses : [],caissiers : caissiers,admin:admin,nbcomptes : store.id_caisseier.length,som : som,tiket :history.history.length,actif_hours : 0 }) 

                        }
                                  
                    })
                  
                }
                 
             }
           }
           } else if(len_caisse !=0 && len_caisseier ==0 && len_history !=0){
            // if all exist
             // search for caisseiers
             for (let i=0;i<store.id_caisse.length;i++){
               Caisse.findOne({_id :store.id_caisse[i]})
               .then(caisse=>{
                console.log(caisse)
                 caisses.push(caisse);
               })
               if(i == store.id_caisse.length-1){
            
                  
                  for (let j=0;j<store.id_history.length;j++){
                    Historie.findOne({_id :store.id_history[j]})
                    .then(history=>{
                       
                        for (let k=0;k<history.history.length;k++){
                          som +=  parseInt(history.history[k].total)  ;
                          if(k == history.history.length-1)
                              res.render('caisses',{store :store ,caisses : caisses,caissiers : [],admin:admin,nbcomptes : 0,som : som,tiket :history.history.length,actif_hours : 0 }) 

                        }
                                  
                    })
                  
                }
                 
             }
           }
           }else if(len_caisse ==0 && len_caisseier ==0 && len_history !=0){
            res.render('caisses',{store :store ,caisses : [],caissiers : [],admin:admin,nbcomptes : 0,som : 0,tiket :0,actif_hours : 0 }) 
           }
        
        
      })
    }
  })
    
}else
    res.render('Login-super')
 }

 module.exports.delete_multiple = (req, res) => {
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
          var count = 0 ; 
          for(let i=0;i<req.body.length ;i++){
              Store.deleteOne({_id :req.body[i]})
             .then(store =>{
              count ++ ;
              if(count==req.body.length){
                   Store.find({id_admin: admin._id})    
                  .then(store =>{
                      res.render('store',{store : store,admin : admin})
                      
                  })
              }
              })
             .catch(err =>{
                res.status(200).json({
                message : 'Delet store exception'
                })
            })
          }
    }
    })
    }else
      res.render('Login-super')    
 }


 module.exports.search_store = (req, res) => {


  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
    if (err) {
        res.locals.admin = null;
        res.status(500).json({
          message : "You are not the specified user"
        })
    } else {
      console.log(req.body)
          let admin = await Admin.findById(decodedToken.id);
        
          Store.find({id_admin : admin._id,name : req.body[0]})
          .then(store =>{   
              res.status(200).json({
                message : store
              })

        })
        .catch(err=>{
          console.log(err)
        })
    }
    })
    }else
      res.render('Login-super')  
      
 }
 module.exports.get_update_caissiers = (req, res) => {
  const token = req.cookies.jwt;
  const id = req.params.id ; 
  if (token) {
    jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
      if (err) {
        res.locals.admin = null;
        res.status(500).json({
          message : "You are not the specified user"
        })
      } else {
        let admin = await Admin.findById(decodedToken.id);
        Caissier.findOne({_id : mongoose.Types.ObjectId(req.params.id)})
        .then(caissier=>{
           res.render('update_caissier',{admin:admin,caissier : caissier})
        })
        .catch(err=>{
          console.log('test')
        })
      }
    })
  }
 }
 
 module.exports.post_update_caissiers = (req, res) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
      if (err) {
        res.locals.admin = null;
        res.render('Login-super')
      } else{
      let admin = await Admin.findById(decodedToken.id);
      Caissier.updateOne({_id:mongoose.Types.ObjectId(req.params.id)},
      { $set: {
       name:req.body.name,
       lastname : req.body.lastname,
       email : req.body.email,
       age : req.body.age,
       pasword : req.body.password
     }}).then(result=>{ 
      Store.findOne({id_caisseier: {$in :req.params.id}})
      .then(store=>{
        res.redirect('/get_caissier/'+store._id)
      })
      .catch(err=>{
        console.log('Cannot find store')
      })
        
   })
      }
    })
  }

}
module.exports.not_found = (req, res) => {
  res.render('notfound');
}

module.exports.testP = (req, res) => {
  const dataList = [
    'a',
    'b',
    'c',
    'd',
    'e',
    '1',
    '2',
    '3',
    '4',
    '5'
]

function paginateArray(arr , itemPerPage , pageIndex) {
    const lastIndex = itemPerPage * pageIndex;
    const firstIndex = lastIndex - itemPerPage;
    return arr.slice(firstIndex , lastIndex);
}

console.log(paginateArray(dataList , 5 , 2));
}
module.exports.store_track = (req, res) => {
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
                  res.render('store-map',{store : store,admin : admin})
                  
                })
                .catch(err =>{
                  res.render('Login-super')
                })
        
              }
            })
          }
          else{ 
            res.render('Login-super')
          }
}

module.exports.store_for_map= (req, res) => {
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
            var positions = ""
            for(let i=0;i<store.length;i++){
              positions += (store[i].long+",") 
            }
            var p1 = positions.slice(0,-1)
            var positions2 = ""
            for(let i=0;i<store.length;i++){
              positions2 += (store[i].lat+",") 
            }
           var p2 =  positions2.slice(0,-1)
           var tab = [p1,p2]
           res.send(tab)
            
          })
          .catch(err =>{
            res.send('No results')
            // res.render('Login-super')
          })
  
        }
      })
    }
    else{ 
      res.render('Login-super')
    }
}
module.exports.track_caisses= (req, res) => {
    // Test if super admin is authenticated 
    const token = req.cookies.jwt;
    if (token) {
      jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
        if (err) {
          res.locals.admin = null;
          res.render('Login')
        } else {
          let admin = await Admin.findById(decodedToken.id);
          const {page = 1,limit = 9} = req.query ;
          // find store by id 
          Store.find({id_admin: admin._id})
          .limit(limit *1)
          .skip((page -1)*limit) 
          .then(store =>{
            res.render('map-caisses-forstore',{store : store,admin : admin})
            
          })
          .catch(err =>{
            res.render('Login-super')
          })
  
        }
      })
    }
    else{ 
      res.render('Login-super')
    }
}

module.exports.get_map= (req, res) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
      if (err) {
        res.locals.admin = null;
        res.render('Login-super')
      } else{
      let admin = await Admin.findById(decodedToken.id);
      Store.findOne({_id :  mongoose.Types.ObjectId(req.params.id)})

      .then(store =>{
        var caisses = []
        if(store.id_caisse.length == 0){
          res.send([])
        }
              // res.render('crud_caisses',{store :store ,caisses : caisses,admin:admin})
        else {
          for (let i=0;i<store.id_caisse.length;i++){
            Caisse.findOne({_id :store.id_caisse[i]})
            .then(caisse=>{
              caisses.push(caisse);
              if(i==store.id_caisse.length -1){
                var positions = ""
                for(let i=0;i<caisses.length;i++){
                  positions += (caisses[i].long+",") 
                }
                var p1 = positions.slice(0,-1)
                var positions2 = ""
                for(let i=0;i<caisses.length;i++){
                  positions2 += (caisses[i].lat+",") 
                }
               var p2 =  positions2.slice(0,-1)
               var tab = [p1,p2]
               res.send(tab)
              }
                // res.render('crud_caisses',{store :store ,caisses : caisses,admin:admin})
                
            })
          }
        }
       
        
        
      })
      .catch(err =>{
        res.render('Login-super')
      })
    }
  })
    
}else
    res.render('Login-super')
}
module.exports.show_maps= (req, res) => {
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
            res.render('caiss-map',{store : store,admin : admin})
            
          })
          .catch(err =>{
            res.render('Login-super')
          })
  
        }
      })
    }
    else{ 
      res.render('Login-super')
    }
}
