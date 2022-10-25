const jwt = require('jsonwebtoken');
const Super_Admin = require('../models/Super_Admin');

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, 'net ninja secret', (err, decodedToken) => {
      if (err) 
        {
          res.status(500).json({
            message : 'You are not authenticated'
          })
        }
      else 
        next();
      
    });
  } else 
    res.status(500).json({
      message : 'You are not logged in'
    })
};
// check current user
const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
      if (err) {
        res.locals.super_admin = null;
        next();
      } else {
        let super_admin = await Super_Admin.findById(decodedToken.id);
        res.locals.super_admin = super_admin;
        next();
      }
    });
  } else {
    res.locals.super_admin = null;
    next();
  }
};




module.exports = { requireAuth, checkUser };