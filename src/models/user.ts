import mongoose from 'mongoose'
import { Password } from '../services/password'
import { Labels } from '../constant'
/**
 * an interface that described the properties that are required for creating a new user
 */
interface UserAttrs {
  firstName: string;
  lastName: string;
  countryCode: string;
  mobile: string;
  email: string;
  password: string;
  profileImg?: string;
  gender: string;
}

/**
 * an interface that described the properties that a user modal has
 * ex. tell ts a build Function has inside UserModal
 * so we can use it like this => User.build
 * using UserModal interface we exract all existing userSchema property and add one additional property to it called build-function
 */
interface UserModal extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc //build return a user that mines a refrance of UserDoc so the type is UserDoc
}

/**
 * an interface that described the properties that a user-document(user table row) has
 */
interface UserDoc extends mongoose.Document {
  email: string;
  countryCode: string;
  mobile: string;
  password: string;
  otp: number
  profileImg: string;
  gender: string;
  firstName: string;
  lastName: string;
  fullName: string;
}

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
    },
    countryCode: {
      type: String,
    },
    mobile: {
      type: String,
      trim: true,
      required: true,
    },
    password: {
      type: String,
      trim: true,
      required: true,
    },
    otp: {
      type: Number,
      trim: true,
    },
    otpExpireOn: {
      type: Date,
    },
    profileImg: {
      type: String,
    },
    gender: {
      type: String,
      enum: [
        Labels.gender.Male,
        Labels.gender.Female,
        Labels.gender.Other
      ]
    },
    createdNum: { type: Number, default: Date.now() }
  },
  {
    timestamps: true,
    // filter response
    toJSON: {
      transform(doc, ret) {
        (ret.id = ret._id), delete ret._id
      },
      versionKey: true
    },
  },
)

userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'))
    this.set('password', hashed)
  }
  if (this.isModified('firstName') || this.isModified('lastName')) {
    const fullName = `${this.get('firstName')} ${this.get('lastName')}`;
    this.set('fullName', fullName);
  }
  done()
})


//build is just a custom name we can set name as we want
//schemaName.statics.FnName this is a way we can add and use a function from this model without exporting sepratly and check types as per TS likes this ==> schemaName.FnName(param:typecheck)

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs)
}
const User = mongoose.model<any, UserModal>('User', userSchema)

export { User }
