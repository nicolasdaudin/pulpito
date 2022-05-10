const User = require('./userModel');

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

exports.createUser = async (req, res) => {
  const { name, email, role } = req.body;

  const user = new User({ name, role, email });

  const newUser = await user.save();
  console.log(newUser);

  res.status(200).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
};
