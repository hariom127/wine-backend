import mongoose, { Types } from 'mongoose'
import { AppService } from '../services/appService'
import { AppConstant, Labels } from '../constant'
/**
 * an interface that described the properties that are required for creating a new user
 */
interface ShopAttrs {
  name: string;
  userId: Types.ObjectId;
  warehouseId: Types.ObjectId;
  city: string;
  state: string;
  pincode: string;
  address: string;
}

/**
 * an interface that described the properties that a user modal has
 * ex. tell ts a build Function has inside ShopModal
 * so we can use it like this => Shop.build
 * using ShopModal interface we exract all existing shopSchema property and add one additional property to it called build-function
 */
interface ShopModal extends mongoose.Model<ShopDoc> {
  build(attrs: ShopAttrs): ShopDoc //build return a user that mines a refrance of ShopDoc so the type is ShopDoc
}

/**
 * an interface that described the properties that a user-document(user table row) has
 */
interface ShopDoc extends mongoose.Document {
  name: string;
  image: string;
  userId: string;
  warehouseId: string;
  city: string;
  state: string;
  pincode: number;
  address: string;
  status: string;
}

const shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      default: AppConstant.SHOP_IMG
    },
    userId: {
      type: Types.ObjectId,
      required: true
    },
    warehouseId: {
      type: Types.ObjectId,
      required: true
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    pincode: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        Labels.status.active,
        Labels.status.inactive
      ],
      default: Labels.status.active
    }
  },
  {
    timestamps: true,
    // filter response
    toJSON: {
      transform(doc, ret) {
        (ret.id = ret._id), delete ret._id
      },
      versionKey: true,
    },
  },
)

shopSchema.pre('save', async function (done) {
  if (this.isModified('name')) {
    const reqName = this.get('name') || "";
    const name = AppService.capitalizeFirstLetter(reqName);
    this.set('name', name);
  }
  done()
})


//build is just a custom name we can set name as we want
//schemaName.statics.FnName this is a way we can add and use a function from this model without exporting sepratly and check types as per TS likes this ==> schemaName.FnName(param:typecheck)

shopSchema.statics.build = (attrs: ShopAttrs) => {
  return new Shop(attrs)
}
const Shop = mongoose.model<any, ShopModal>('Shop', shopSchema)

export { Shop }
