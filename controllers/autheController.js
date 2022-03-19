const User = require('./../models/userModel');
const { catchAsync } = require('./../utils/catchSync');
const Email = require('./../utils/email');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const AppError = require('../utils/appError');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createTokenSend = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    userName: req.body.userName,
    address: req.body.address,

    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    phoneNumber: req.body.phoneNumber
  });

  createTokenSend(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  console.log('Loginned');
  // 1) Check if email and password exist
  if (!email || !password) {
    console.log('hey');
    return next(new AppError('Please provide email and password!', 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email: email }).select('+password');
  if (!user) {
    return next(new AppError('This email does not exist', 404));
  }

  if (!(await User.checkPassword(password, user.password))) {
    return next(new AppError('Password does not match', 401));
  }
  // 3) If everything ok, send token to client
  createTokenSend(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'logout', {
    expires: new Date(Date.now() + 10 * 1000)
  });
  res.status('200').json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }
  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.isPasswordChangedAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;

  //To render on page
  res.locals.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  //Get role of the user
  return (req, res, next) => {
    const user = req.user;
    if (!roles.includes(user.role)) {
      return next(
        new AppError('You do not have permission to access this route')
      );
    }
    next();
  };

  //Send json inform user can not access this route if his role is not authoritized
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('Can not find this user', 404));
  }

  const resetToken = await user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  try {
    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Token is sent to your email'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();
    return next(
      new AppError(
        'There is error when sending email, please request again',
        400
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const token = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  console.log(token);
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Wrong token or token is expired', 401));
  }

  if (!req.body.password || !req.body.passwordConfirm) {
    return next(new AppError('Please provide and confirm password !', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createTokenSend(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');

  //Check if currentPassword is correct
  if (
    !req.body.currentPassword ||
    !(await User.checkPassword(req.body.currentPassword, user.password))
  ) {
    return next(
      new AppError('Current password is incorrect, please confirm again!', 400)
    );
  }

  if (!req.body.password || !req.body.passwordConfirm) {
    return next(
      new AppError('Please provide new password and confirm it', 400)
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createTokenSend(user, 200, res);
});
