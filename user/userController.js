const User = require('./userModel');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllUsers = async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
};

// exports.createUser = async (req, res) => {
//   const { name, email, role } = req.body;

//   const user = new User({ name, role, email });

//   const newUser = await user.save();
//   console.log(newUser);

//   res.status(200).json({
//     status: 'success',
//     data: {
//       user: newUser,
//     },
//   });
// };

/**
 * Remove fields from an object
 * @param {*} obj
 * @param  {...any} allowedFields
 */
const filterObj = (obj, allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

// const areFieldsInBody(obj, allowedFields) => {
//   Object.keys(obj).forEach((el)) => {
//     if (allowedFields.includes(el)) {
//       return true;
//     }
//   }
//   return false;
// }

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400
      )
    );
  }

  const allowedFields = ['name', 'email', 'favOrigins'];

  // // 2) Error if no fields to update
  // if (!areFieldsInBody(req.body,updatableFields)){
  //   return next(
  //     new AppError(
  //       `There are no fields to update. Please provide at least one of the following fields : ${updatableFields.join(',')}`,
  //       400
  //     )
  //   );
  // }

  // const { name, email, favOrigins } = req.body;
  // if (!name && !email && !favOrigins) {
  //   return next(
  //     new AppError(
  //       'There are no fields to update. Please provide name, email or favOrigins!',
  //       400
  //     )
  //   );
  // }

  // 2) Filter out unwanted fields names that are not allowed to be updated, to avoid users to set themselves as admin, for example
  const filteredBody = filterObj(req.body, allowedFields);

  // 3) Update user
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true, // fields validator will be run, for example isEmail()
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  // 3) Update user
  const deletedUser = await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
