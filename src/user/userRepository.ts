import { IataCode } from '../common/types';
import User, { IUser } from './userModel';

export class UserRepository {
  static updateOne = async (id: string, update: Partial<IUser>) => {
    return await User.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true, // fields validator will be run, for example isEmail()
    });
  };

  static all = async () => {
    return await User.find();
  };

  static findOne = async (id: string) => {
    return await User.findById(id);
  };

  static deleteOne = async (id: string) => {
    await User.findByIdAndUpdate(id, {
      active: false,
    });
  };

  static addFavAirportToUser = async (id: string, airport: IataCode) => {
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

  static removeFavAirportFromUser = async (id: string, airport: IataCode) => {
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
