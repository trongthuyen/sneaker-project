const express = require('express');
// const userController = require('../controllers/userController');
const autheController = require(`../controllers/autheController`);
const userController = require(`../controllers/userController`);

const router = express.Router();

router.post('/signup', autheController.signUp);

router.post('/login', autheController.login);

router.get('/logout', autheController.logout);

router.post('/forgotPassword', autheController.forgotPassword);
router.post('/resetPassword/:token', autheController.resetPassword);
router.get('/', userController.getUsers);

router.use(autheController.protect);
router.post('/updatePassword', autheController.updatePassword);
router.post('/updateMe', userController.updateMe);
router.get('/deleteMe', userController.deleteMe);

module.exports = router;
