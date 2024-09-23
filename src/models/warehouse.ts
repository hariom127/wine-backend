import mongoose, { Types } from 'mongoose'
import { AppService } from '../services/appService'
import { Labels } from '../constant'
/**
 * an interface that described the properties that are required for creating a new user
 */
interface WarehouseAttrs {
  name: string;
  userId: Types.ObjectId;
  city: string;
  state: string;
  address: string;
  pincode: string;
  status: string;
}

/**
 * an interface that described the properties that a user modal has
 * ex. tell ts a build Function has inside WarehouseModal
 * so we can use it like this => Warehouse.build
 * using WarehouseModal interface we exract all existing warehouseSchema property and add one additional property to it called build-function
 */
interface WarehouseModal extends mongoose.Model<WarehouseDoc> {
  build(attrs: WarehouseAttrs): WarehouseDoc //build return a user that mines a refrance of WarehouseDoc so the type is WarehouseDoc
}

/**
 * an interface that described the properties that a user-document(user table row) has
 */
interface WarehouseDoc extends mongoose.Document {
  name: string;
  userId: Types.ObjectId;
  city: string;
  state: string;
  address: string;
  pincode: string;
  status: string;
}

const warehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    userId: {
      type: Types.ObjectId,
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
    }
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

warehouseSchema.pre('save', async function (done) {
  if (this.isModified('name')) {
    const reqName = this.get('name') || "";
    const name = AppService.capitalizeFirstLetter(reqName);
    this.set('name', name);
  }
  done()
})


//build is just a custom name we can set name as we want
//schemaName.statics.FnName this is a way we can add and use a function from this model without exporting sepratly and check types as per TS likes this ==> schemaName.FnName(param:typecheck)

warehouseSchema.statics.build = (attrs: WarehouseAttrs) => {
  return new Warehouse(attrs)
}
const Warehouse = mongoose.model<any, WarehouseModal>('Warehouse', warehouseSchema)

export { Warehouse }
