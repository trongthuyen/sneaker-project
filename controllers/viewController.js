const Sneaker = require('../models/sneakerModel');
const { catchAsync } = require('../utils/catchSync');

exports.getSneaker = catchAsync(async (req, res, next) => {
  console.log(req.params.id);

  const sneaker = await Sneaker.findById(req.params.id);

  if (!sneaker) {
    res.status(404).json({
      status: 'Fail',
      message: 'Can not find the Sneaker'
    });
  }

  res.status(200).render('product_detail', {
    title: sneaker.name,
    sneaker: sneaker
  });
});

exports.loginPage = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Login'
  });
});
