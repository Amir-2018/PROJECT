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
                        res.render("products",{tab_products : tab_products,id : req.params.id,admin:admin},)
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
                          res.render("products",{tab_products : tab_products,id : req.params.id,admin : admin},)
                         
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
              res.render('caissiers',{caissiers :caissiers,admin:admin,store:store})
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
        var caisses = []
        var caissiers = []
        if(store.id_caisse.length == 0)
              res.render('caisses',{store :store ,caisses : caisses,admin:admin})
        else {
          for (let i=0;i<store.id_caisse.length;i++){
            Caisse.findOne({_id :store.id_caisse[i]})
            .then(caisse=>{
              caisses.push(caisse);
              if(i==store.id_caisse.length -1){
                for (let i=0;i<store.id_caisseier.length;i++){
                  Caissier.findOne({_id :store.id_caisseier[i]})
                  .then(caissier=>{
                    caissiers.push(caissier);
                    if(i==store.id_caisseier.length -1){
                      Historie.findOne({id_store :  req.params.id})
                      .then(hist =>{
                        console.log("hist = "+hist)
                        var som = 0
                        for(let a = 0;a<hist.history.length;a++){
                          
                            som+=parseInt(hist.history[a].total);
                        } 
                        res.render('caisses',{tiket :hist.history.length, som : som,store :store ,caisses : caisses,admin:admin,nbcomptes : store.id_caisseier.length,caissiers : caissiers})

                      })

                    }
                  })
                }
              }
                // res.render('caisses',{store :store ,caisses : caisses,admin:admin,nbcomptes : store.id_caisseier.length})
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
