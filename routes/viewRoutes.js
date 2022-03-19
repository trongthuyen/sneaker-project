const express = require('express');
const viewController = require('../controllers/viewController');

const viewRouter = express.Router();

// viewRouter.route('/product-details/:id', viewController.getSneaker);
viewRouter.route('/product-details/:id').get(viewController.getSneaker);
viewRouter.route('/login').get(viewController.loginPage);

module.exports = viewRouter;
