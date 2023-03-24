import { Schema, model, Types, Model } from 'mongoose';
import crypto from 'crypto';
import validator from 'validator';
import bcrypt from 'bcryptjs';

export interface IUser {
  name: string;
  email: string;
  favAirports?: Types.Array<string>;
  password: string;
  passwordConfirm?: string;
  passwordChangedAt: number;
  passwordResetToken: string;
  passwordResetExpiresAt: number;
  active: boolean;
}

interface IUserMethods {
  changedPasswordAfter(JWTTimestamp: number): boolean;
  isCorrectPassword(
    candidatePassword: string,
    userPassword: string
  ): Promise<boolean>;
  createPasswordResetToken(): string;
}

// eslint-disable-next-line @typescript-eslint/ban-types
type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  favAirports: {
    type: [String],
    required: false,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: [
      // this only works on CREATE and SAVE !!!
      // so for UPDSTES we need to SAVE instead of findOneAndUpdate
      function (el: string) {
        return this.password === el;
      },
      'Passwords are not the same!',
    ],
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpiresAt: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  //role: String,
  //createdAt: { type: Date, default: Date.now },
});

// pre('save') DO NOT WORK for update calls (findByIdAndUpdate)
userSchema.pre('save', async function (next) {
  // only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  // this.passwordChangedAt = Date.now();

  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  // sometimes this operation finishes after generating the JWT token so we put the passwordChangedAt one second in the past.
  next();
});

// any query that starts with 'find'
// find* queries only retrieves active users (that do not have 'active' as false)
userSchema.pre<UserModel>(/^find/, function (next) {
  // Query middleware, so 'this' points to query
  // instead of 'active:true' we use that filter, to account for documents that do not have the field 'active' set.
  this.find({ active: { $ne: false } });
  next();
});

userSchema.method(
  'isCorrectPassword',
  async function isCorrectPassword(
    candidatePassword: string,
    userPassword: string
  ) {
    // we can not use this.password because we decided password is not available in the output (because of select:false)
    // so we send it in the arguments
    return await bcrypt.compare(candidatePassword, userPassword);
  }
);

userSchema.method(
  'changedPasswordAfter',
  function changedPasswordAfter(JWTTimestamp: number) {
    if (this.passwordChangedAt) {
      // const changedTimestamp = parseInt(
      //   this.passwordChangedAt.getTime() / 1000,
      //   10
      // );
      const changedTimestamp = this.passwordChangedAt.getTime() / 1000;

      // because some users do not have this property
      return JWTTimestamp < changedTimestamp;
    }
    // false means NOT changed
    return false;
  }
);

userSchema.method(
  'createPasswordResetToken',
  function createPasswordResetToken() {
    // gemerate the token
    // we don't need such security so we can use crypto library instead of bcryptjs library

    const resetToken = crypto.randomBytes(32).toString('hex');

    // we are going to store the reset token in DB but as usually we are going to store it encrypted
    // same here: encryption does not need to be of the highest security so we can use crypto library
    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    // expiration after 10 minutes
    this.passwordResetExpiresAt = Date.now() + 10 * 60 * 1000;

    // we send the non encrypted version to email.
    return resetToken;
  }
);

const User = model<IUser, UserModel>('User', userSchema);
export default User;
