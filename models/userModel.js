const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const isEmail = email => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name']
  },
  phoneNumber: {
    type: String,
    required: [true, 'A user must have a phoneNumber']
  },
  address: String,
  cancelOrderQuan: {
    type: Number,
    default: 0,
    min: [0, 'The canceled order of a user could be greater than 0'],
    select: false
  },
  email: {
    type: String,
    validate: [isEmail, 'Invalid email address'],
    required: [true, 'An ser must have an email'],
    unique: true,
    lowercast: true
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  password: {
    type: String,
    required: [true, 'A user must have a password'],
    minLength: [8, 'Password length must be greater than 8'],
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'You must confirm your password'],
    validate: {
      validator: function(err) {
        return err === this.password;
      },
      message: 'Confirmed password does not match'
    }
  },
  passwordChangedAt: Date,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.statics.checkPassword = async (provivedPassword, password) => {
  return await bcrypt.compare(provivedPassword, password);
};

userSchema.methods.isPasswordChangedAfter = function(jwtTimeStamp) {
  if (this.passwordChangedAt) {
    const lastPasswordChangeTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(this.password);
    return lastPasswordChangeTimeStamp > jwtTimeStamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetPassword = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetPassword)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 5 * 60 * 1000;
  return resetPassword;
};

//No display inactive user
userSchema.pre(/^find/, function(next) {
  this.find({ active: true });
  next();
});

module.exports =
  mongoose.models.userSchema || mongoose.model('User', userSchema);
