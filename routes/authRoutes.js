const { Router } = require('express');
const superController = require('../controllers/super.admin');
const adminController = require('../controllers/admin');
const { requireAuth, checkUser } = require('../middleware/authMiddleware');
const router = Router();

router.post('/signup', superController.signup_post);
//router.post('/verif', superController.verif);
router.post('/login', superController.login_post);
router.get('/logout', superController.logout_get);


router.post('/loginAdmin',adminController.loginAdmin);

router.get('/testKey',superController.testKey);


// funtion restricted to super admin 
router.post('/createAdmin',superController.createAdmin);

router.get('/get_create_admin',superController.get_create_admin);
router.post('/create_store',adminController.create_store);
router.post('/add_product_to_inventory/:id',adminController.add_product_to_inventory);
router.get('/super_admin_page',superController.super_admin_page);
router.get('/login_page',superController.get_login_page);
router.get('/login_super_page',superController.get_login_super_page);
router.get('/page_admin',superController.get_page_admin);
router.get('/get_login_admin',adminController.get_login_admin);
router.get('/get_products_Page/:id',adminController.get_products_Page); 
router.get('/get_caisses_Page/:id',adminController.get_caisses_Page);
router.get('/get_store_Page',adminController.get_store_Page);
router.get('/get_inventory_Page',adminController.get_inventory_Page);
router.get('/manage_admins',adminController.manage_admins);

router.get('/delete_admins/:id',superController.delete_admins);
router.get('/update_admins/:id',superController.get_update_admins);
router.get('/update_admins/:id',superController.get_update_admins);


router.post('/create_caisse/:id',adminController.create_caisse);
// Get caisses info
router.get('/get_caisse_info',adminController.get_caisse_info);

router.post('/update_admins/:id',superController.update_admins);
// to update store
router.post('/update_store/:id',adminController.update_store);
router.get('/update_store/:id',adminController.get_update_store);
// to update products 
router.post('/update_products/:id',adminController.post_update_products);
router.get('/update_products/:id',adminController.get_update_products);
// to delete products
router.get('/delete_products/:id',adminController.get_delete_products);
router.get('/delete_caisses/:id',adminController.get_delete_caisses);
router.get('/delete_caissiers/:id',adminController.get_delete_caissiers);
router.post('/delete_multiple_caissiers',adminController.delete_multiple_caissiers);

router.get('/delAll',superController.del_inv);
router.get('/delete_store/:id',adminController.delete_store);
router.get('/logout-super',superController.logout_super);
// caisses and caissiers
router.get('/get_caissier/:id',adminController.get_caissier);
router.post('/addCaissier/:id',adminController.addCaissier);
router.get('/get_dash_data/:id',adminController.get_dash_data);
router.post('/delete_multiple',adminController.delete_multiple);
router.post('/delete_multiple_products',adminController.delete_multiple_products);
router.post('/delete_multiple_caisses',adminController.delete_multiple_caisses);

router.post('/search_store',adminController.search_store);

router.get('/get_update_caissiers/:id',adminController.get_update_caissiers);
router.post('/post_update_caissiers/:id',adminController.post_update_caissiers);

// The last one
router.get('/get_store_for_caissier/:id',adminController.get_store_for_caissiers);
// router.all('*',adminController.not_found); 
// test pagination
router.get('/testP',adminController.testP); 

router.get('/manage_admins_For_Delete',adminController.manage_admins_For_Delete);
router.post('/delete_multiple_admins',superController.delete_multiple_admins);
router.get('/store_track',adminController.store_track);
router.get('/store_for_map',adminController.store_for_map);
router.get('/track_caisses',adminController.track_caisses);
router.get('/get_map/:id',adminController.get_map);
router.get('/show_maps/:id',adminController.show_maps);
module.exports = router;
