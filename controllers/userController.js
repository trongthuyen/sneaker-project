const User = require('./../models/userModel');
const { catchAsync } = require('./../utils/catchSync');
const AppError = require('../utils/appError');

const filterObj = (body, ...fields) => {
  const result = {};
  Object.keys(body).forEach(key => {
    if (fields.includes(key)) {
      result[key] = body[key];
    }
  });
  return result;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user Posts password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for updating password. Please use /updatePassword.',
        400
      )
    );
  }

  //2) Update password
  const filterBody = filterObj(req.body, 'name', 'email');
  const user = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    user
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null
  });
});
exports.getUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    size: users.length,
    data: users
  });
});
