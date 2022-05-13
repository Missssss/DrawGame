const router = require('express').Router();
const {wrapAsync} = require('../util/util');
const userController = require('../controllers/userController');
const {getUserId, signUp} = userController;

router.route('/user/userId')
    .get(wrapAsync(getUserId));

router.route('/user/signup')
    .post(wrapAsync(signUp));

// router.route('/user/signin')
//     .post(wrapAsync(signIn));

// router.route('/user/profile')
//     .get(authentication(), wrapAsync(getUserProfile));


    
module.exports = router;