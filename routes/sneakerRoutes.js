const express = require('express');
const sneakerController = require('../controllers/sneakerController');
const autheController = require('../controllers/autheController');

const router = express.Router();

router.route('/laptop-stats').get(sneakerController.getLaptopStats);
router.route('/').get(sneakerController.getAllSneaker);

router
  .route('/monthly-plans/:year')
  .get(autheController.protect, sneakerController.getMonthlyPlans);

module.exports = router;
