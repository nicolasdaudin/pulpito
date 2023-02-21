import User from './userModel';

export class UserRepository {
  static updateOne = async (id, update) => {
    return await User.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true, // fields validator will be run, for example isEmail()
    });
  };

  static all = async () => {
    return await User.find();
  };

  static findOne = async (id) => {
    return await User.findById(id);
  };

  static deleteOne = async (id) => {
    await User.findByIdAndUpdate(id, {
      active: false,
    });
  };

  static addFavAirportToUser = async (id, airport) => {
    return await User.findByIdAndUpdate(
      id,
      {
        $addToSet: { favAirports: airport },
      },
      {
        new: true,
      }
    );
  };

  static removeFavAirportFromUser = async (id, airport) => {
    return await User.findByIdAndUpdate(
      id,
      {
        $pullAll: { favAirports: [airport] },
      },
      {
        new: true,
      }
    );
  };
}
